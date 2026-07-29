# Optimizations — Configuration Recipes by Bottleneck

Apply only what a measurement justifies (see `diagnostics.md`). Every recipe
states platform support and maturity. Nightly-only items are marked
**[nightly]**. Status notes are current as of mid-2026.

## 1. Iteration loop (before touching any config)

- `cargo check` skips codegen; several times faster than `cargo build`. Most
  editors (rust-analyzer) already run it on save.
- `bacon` or `cargo watch -x check` for continuous feedback.
- `cargo test --no-run` surfaces test-compile errors without running tests.

## 2. Linkers

Linking happens once at the end and is serial; it dominates warm rebuilds of
large binaries, especially with debuginfo.

| Linker         | Platforms             | Maturity           | Notes                                                                                                                                                  |
| -------------- | --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rust-lld / lld | Linux, macOS, Windows | Production         | **Default on `x86_64-unknown-linux-gnu` since Rust 1.90 (Sep 2025)** — no action needed there. Revert with `-C linker-features=-lld` if it misbehaves. |
| mold           | Linux                 | Production         | Usually faster than lld.                                                                                                                               |
| wild           | Linux                 | Newer, less mature | Can beat mold; watch its issue tracker.                                                                                                                |
| zld            | macOS                 | **Deprecated**     | Do not recommend.                                                                                                                                      |

Config (`.cargo/config.toml`, project or `~/.cargo/`):

```toml
# Linux, mold
[target.x86_64-unknown-linux-gnu]
linker = "clang"
rustflags = ["-C", "link-arg=-fuse-ld=mold"]

# Linux target NOT covered by the 1.90 lld default (e.g. aarch64):
[target.aarch64-unknown-linux-gnu]
linker = "clang"
rustflags = ["-C", "link-arg=-fuse-ld=lld"]
```

Notes:

- Prefer the `-fuse-ld` linker-flag form over the `mold -run` wrapper form;
  older guides report sccache conflicts with the wrapper approach.
- Measure: if a linker swap saves only ~3s of a 70s build, linking was never
  the bottleneck — revert focus to codegen.

## 3. Profile tuning (dev builds)

```toml
# Cargo.toml
[profile.dev]
debug = "line-tables-only"  # backtraces with line numbers, much less debuginfo
                            # use `debug = 0` if backtraces aren't needed at all

# Dependencies rarely change: optimize them once, keep your code fast to compile
[profile.dev.package."*"]
opt-level = 2

# Proc macros / build scripts run at compile time — optimizing them speeds builds
# (helps heavy serde/derive users)
[profile.dev.build-override]
opt-level = 3
```

macOS-specific — skip `dsymutil` debuginfo packing (often the majority of a
warm dev rebuild):

```toml
[profile.dev]
split-debuginfo = "unpacked"
```

Optional throwaway profile for fastest edit-run loops:

```toml
[profile.dev-fast]
inherits = "dev"
opt-level = 1
debug = false
```

## 4. Incremental compilation

Default: **on** for dev, **off** for release. For frequent local release
builds:

```toml
[profile.release]
incremental = true
```

In CI, always disable it — the artifacts cache poorly and defeat sccache:

```bash
export CARGO_INCREMENTAL=0
```

## 5. Workspace splitting (the root fix for one oversized crate)

rustc parallelizes across crates (and across codegen units within a crate,
but the pipeline — macro expansion, type checking, monomorphizing every
generic used — is per-crate). One 50k-line bin crate serializes the end of
every build. Split by stable boundaries:

```text
app/
├── Cargo.toml          # [workspace] members = ["crates/*", "app"]
├── crates/
│   ├── models/         # stable types, rarely change
│   ├── db/
│   └── api/
└── app/                # thin bin crate: wiring only
```

- Changing one member recompiles only it and its dependents.
- Keep the bin crate thin; heavy generic instantiation happens in the crate
  that _uses_ the generic, and the bin crate is compiled last and alone.
- `cargo-hakari` reduces repeated dependency rebuilds in large workspaces
  (workspace-hack pattern).
- With many members sharing deps under different feature sets, cargo's
  `feature-unification` option improves build reuse.

## 6. Codegen volume and generics

When `cargo-llvm-lines` shows monomorphization bloat:

- **Non-generic inner function**: keep the generic shell tiny, move the body
  to a non-generic `fn` (the standard-library trick used by
  `std::fs::read`).
- `dyn Trait` at API boundaries instead of `impl Trait`/generics where the
  dynamic-dispatch cost is irrelevant.
- Fewer distinct instantiations: take `&str` instead of `impl AsRef<str>` in
  rarely-inlined code.

`codegen-units` / LTO tradeoff (release):

| Setting                                               | Compile time | Runtime perf   |
| ----------------------------------------------------- | ------------ | -------------- |
| `codegen-units = 16`, `lto = "off"` or `"thin"` local | fastest      | slightly lower |
| release default (16 CGUs, thin-local LTO)             | baseline     | good           |
| `codegen-units = 1`, `lto = "fat"`                    | slowest      | best           |

Keep max-optimization settings for the production/release pipeline; use a
faster variant locally. Never change release runtime settings without
flagging the tradeoff.

## 7. Nightly accelerators

- **Cranelift backend [nightly]** — much faster codegen, slower generated
  code; good for dev builds, not release:

  ```bash
  rustup component add rustc-codegen-cranelift-preview --toolchain nightly
  ```

  ```toml
  # .cargo/config.toml
  [unstable]
  codegen-backend = true

  # Cargo.toml
  [profile.dev]
  codegen-backend = "cranelift"
  ```

- **Parallel frontend [nightly]** — parallelizes type-checking/borrow-check
  etc.; up to ~50% faster in good cases, ≤8 threads recommended.
  Stabilization is an active Rust project goal (2025h2 → 2026), still
  nightly-only as of mid-2026:

  ```toml
  [build]
  rustflags = ["-Z", "threads=8"]
  ```

## 8. CI recipes

- **sccache** — cache rustc outputs across runs/machines
  (`RUSTC_WRAPPER=sccache`, backends: local disk, S3, GCS, Redis, GitHub
  Actions cache).
- **`CARGO_INCREMENTAL=0`** always.
- **Dedicated profile** — CI needs correctness feedback, not peak runtime:

  ```toml
  [profile.ci]
  inherits = "release"
  lto = "off"
  codegen-units = 16
  incremental = false
  debug = 0
  strip = "symbols"
  ```

- **Docker**: `cargo-chef` to layer-cache dependency builds.
- Parallelize jobs: clippy shares compilation with the build job; tests
  compile under their own profile and cache entries.

## 9. Dependency hygiene (cold builds)

- `cargo tree --duplicates` — multiple versions of the same crate compile
  multiple times; unify versions.
- Audit features: `default-features = false` plus explicit features on heavy
  deps (tokio, serde, regex...). `--timings` lists which features each slow
  unit was built with.
- Replace heavyweight deps when a lighter one suffices; every proc-macro-
  heavy dependency also taxes all downstream crates.
