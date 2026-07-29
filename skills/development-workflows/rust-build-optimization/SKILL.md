---
name: rust-build-optimization
description: >-
  Use when a Rust or Cargo build is slow and the user wants it diagnosed or
  sped up: profiling compile times with cargo --timings or -Zself-profile,
  finding whether the bottleneck is dependencies, codegen/LLVM, linking, or
  one oversized crate, and applying targeted fixes such as faster linkers
  (lld, mold, wild), incremental compilation, dev/release profile tuning,
  workspace splitting, Cranelift, the nightly parallel frontend, or CI
  caching with sccache. Also for reviewing .cargo/config.toml or Cargo.toml
  profile settings for build speed. Not for making the compiled program run
  faster (runtime optimization), general Rust coding or debugging questions,
  or non-Rust build systems.
version: 0.1.0
category: development-workflows
tags:
  - rust
  - cargo
  - compile-times
  - build-performance
  - linker
  - profiling
argument-hint: "[project-path or symptom]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Rust Build Analysis and Optimization

Diagnose slow Rust builds by measuring first, then apply the smallest fix that
targets the actual bottleneck. The useful outcome is: a baseline number, a
named bottleneck backed by profiler output, applied configuration changes, and
a re-measured result — not a pile of speculative config.

> Path note: `<skill-dir>` below means this skill's own directory. Substitute
> the literal path announced when the skill loads; do not use `$SKILL_DIR`.

## Hard Rules

- Never recommend a fix before at least one measurement supports it.
- Label every nightly-only or platform-specific option as such.
- Do not silently change settings that affect release runtime performance
  (`codegen-units`, `lto`, `opt-level` in `[profile.release]`); state the
  tradeoff and get agreement.
- Re-measure after applying changes and report before/after numbers.

## Step 1 — Frame the Complaint

Establish three facts before touching anything:

1. **Cold or warm?** Full build after `cargo clean` / dependency bump, or an
   incremental rebuild after a one-line change? They have different
   bottlenecks and different fixes.
2. **Which profile?** `dev`, `release`, or CI. Ask, or read the command the
   user actually runs.
3. **Baseline.** Time the exact complained-about scenario once, e.g.
   `cargo build --release` after `touch`-ing a source file for warm builds.

Also check the trivial win first: if the user's inner loop is "edit → build →
read errors", `cargo check` (or `bacon` / `cargo watch -x check`) skips
codegen entirely and is often the single biggest quality-of-life fix.

## Step 2 — Measure

Start with the built-in profiler:

```bash
cargo build --timings          # writes target/cargo-timings/cargo-timing.html
```

Read it for: slowest units, the concurrency graph (long single-threaded tails
mean a serialization problem), and whether the final bin crate dominates.
Known blind spot: for the warm rebuild of a bin crate, `--timings` shows one
opaque block — codegen and link time are not broken out. When that block is
the mystery, go deeper with `-Zself-profile` and `measureme`
(`summarize` / `flamegraph` / `crox`), `cargo-llvm-lines`, or linker timing.
Full tool guide: `<skill-dir>/references/diagnostics.md`.

## Step 3 — Classify the Bottleneck

Map the evidence to one of these, in rough order of frequency:

| Evidence                                                          | Bottleneck                          | Fix section                |
| ----------------------------------------------------------------- | ----------------------------------- | -------------------------- |
| Final link step slow (big binary, debuginfo)                      | Linker                              | Linkers                    |
| One big crate compiles alone at the end, low CPU use              | Oversized crate, serialized codegen | Workspace splitting        |
| `LLVM_module_codegen` / `LLVM_lto_optimize` dominate self-profile | Codegen / monomorphization bloat    | Codegen & generics         |
| Many slow dependency units on the cold path                       | Dependency graph                    | Dependency hygiene         |
| Warm `release` rebuild redoes everything                          | Incremental off (release default)   | Profiles                   |
| macOS: long tail after codegen                                    | `dsymutil` debuginfo packing        | Profiles (split-debuginfo) |
| CI always builds from scratch                                     | No caching                          | CI recipes                 |

## Step 4 — Apply Fixes

Apply fixes matched to the classification, cheapest first. Configuration
recipes with exact `Cargo.toml` / `.cargo/config.toml` snippets, platform
support, and maturity notes are in `<skill-dir>/references/optimizations.md`.
Summary of the menu:

- **Linkers** — since Rust 1.90 (Sep 2025), `x86_64-unknown-linux-gnu` uses
  `rust-lld` by default; on other targets configure `lld`, `mold`, or `wild`.
- **Profiles** — `debug = "line-tables-only"`, dep `opt-level` overrides,
  `split-debuginfo = "unpacked"` on macOS, `incremental = true` for local
  release builds.
- **Workspace splitting** — the root fix when one crate serializes the build.
- **Codegen & generics** — `cargo-llvm-lines` to find monomorphization bloat;
  `codegen-units` / LTO tradeoffs.
- **Nightly accelerators** — Cranelift backend for dev, `-Zthreads`
  parallel frontend (both nightly-only as of 2026).
- **CI recipes** — sccache, `CARGO_INCREMENTAL=0`, a dedicated `ci` profile,
  cargo-chef for Docker.

## Step 5 — Verify and Report

Re-run the exact baseline scenario. Report: baseline time, changes applied
(each traceable to a measurement), new time, and the remaining options not
taken with their tradeoffs. If a change did not help, revert it rather than
letting speculative config accumulate.

## Routing

- Program runs slowly at runtime → runtime profiling and optimization
  (perf/flamegraph on the built binary), not this skill.
- Compiler errors, borrow-checker fights, general Rust questions → normal
  coding assistance, not this skill.
- Non-Rust build systems (webpack, gradle, cmake) → out of scope.
