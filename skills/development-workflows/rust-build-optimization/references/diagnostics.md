# Diagnostics — Measuring Where a Rust Build Spends Time

Use these tools in escalation order: start with `--timings`, go deeper only
when the answer is still ambiguous. Every claim about "why it's slow" should
cite output from one of these.

## 0. Baseline discipline

Time the exact scenario the user complains about, and keep it reproducible:

```bash
# cold build
cargo clean && time cargo build --release
# warm/incremental rebuild (the common complaint)
touch src/main.rs && time cargo build --release
```

Note CPU utilization (e.g. `user` vs wall time): a 32-core machine spending
most of the wall clock below 200% CPU is serialized, which points at one big
crate or the link step rather than raw compile volume.

## 1. cargo --timings (first stop, stable, built-in)

```bash
cargo build --timings   # writes target/cargo-timings/cargo-timing.html
```

How to read the HTML report:

- **Unit graph**: each row is one rustc invocation. Lavender is the compile,
  purple is codegen where cargo can see it, dashed lines show which units get
  unblocked. Hover to highlight the dependency critical path.
- **Concurrency graph**: a long tail where "Active" drops to 1 means the
  build is serialized on one unit — usually the final bin crate.
- **Slowest-units table**: candidates for feature-trimming, replacement, or
  splitting. Check the listed features — you may be compiling functionality
  you never use.

**Known blind spot**: for a bin crate's warm rebuild, `--timings` shows one
opaque block. Codegen and link time inside that block are not broken out;
that is exactly the case where a "71-second black box" needs the tools below.

## 2. Linker timing (cheap differential test)

Before profiling rustc internals, bound the link cost by A/B testing linkers
(see `optimizations.md` for configuration). If switching linkers changes
total time by only a few seconds, linking is not the bottleneck — stop
tuning it and look at codegen.

You can also see the raw process tree cargo spawns:

```bash
cargo build --verbose                 # full rustc invocations
strace -f -e execve -- cargo build 2>&1 | grep -E 'execve\(.*= 0'   # Linux
```

## 3. rustc self-profile (-Zself-profile + measureme)

Per-crate, per-compiler-phase timing. Nightly flag; on stable toolchains it
can be forced with `RUSTC_BOOTSTRAP=1` (unofficial — fine for local
diagnosis, do not bake into project config):

```bash
RUSTC_BOOTSTRAP=1 RUSTFLAGS="-Zself-profile" cargo build --release
# produces <crate>-<pid>.mm_profdata files in the working directory
```

Analyze with the measureme suite:

```bash
cargo install --git https://github.com/rust-lang/measureme summarize flamegraph crox
summarize summarize main-*.mm_profdata   # table: phase, self time, % of total
flamegraph main-*.mm_profdata            # flamegraph.svg
crox main-*.mm_profdata                  # chrome_profiler.json for chrome://tracing / Perfetto
```

Interpretation:

- `LLVM_module_codegen` / `LLVM_module_optimize` / `LLVM_lto_optimize`
  dominating → the crate ships too much code into LLVM: monomorphization
  bloat, too-large crate, or LTO cost. Go to `cargo-llvm-lines` and the
  workspace-splitting / codegen sections of `optimizations.md`.
- `typeck` / trait-solving phases dominating → heavy generic/trait-level
  code; splitting crates helps less, simplifying trait bounds helps more.

A quicker, coarser variant is `-Ztime-passes`:

```bash
cargo +nightly rustc -- -Ztime-passes 2>&1 | grep -E 'time:.*[0-9]{2,}\.'
```

## 4. cargo-llvm-lines (monomorphization bloat)

Shows which functions expand into the most LLVM IR — the direct driver of
codegen time:

```bash
cargo install cargo-llvm-lines
cargo llvm-lines --release | head -30
```

Repeat offenders are generic functions instantiated for many types
(`Vec::push`, serde derives, futures combinators). Fix patterns are in
`optimizations.md` (non-generic inner function, `dyn Trait` at boundaries).

## 5. Codegen-unit level profiling (advanced)

To see which codegen units within a crate are the long pole, profile rustc
itself with samply and readable CGU names:

```bash
cargo install samply
RUSTFLAGS="-Zhuman_readable_cgu_names=yes" samply record cargo +nightly build
```

## 6. Artifact anatomy (when you need ground truth)

An `.rlib` is a GNU `ar` archive of per-codegen-unit objects plus `lib.rmeta`;
useful for verifying what actually got compiled where:

```bash
ar t target/release/deps/libfoo-*.rlib          # list RCGU object files
nm target/release/deps/libfoo-*.rlib | rustfilt # demangled symbols
```

Seeing the same generic instantiations (e.g. `Vec::push` for your types) in
many crates' rlibs is monomorphization duplication — expected, but a
reminder that generics are compiled once per instantiating crate.

## Attribution checklist

Before moving to fixes, you should be able to fill in this sentence with
tool output as evidence: "The {cold|warm} {dev|release} build spends most of
its time in {linking | codegen of crate X | dependency compilation | LLVM
optimization | debuginfo packing}, shown by {--timings | summarize |
linker A/B | cargo-llvm-lines}."
