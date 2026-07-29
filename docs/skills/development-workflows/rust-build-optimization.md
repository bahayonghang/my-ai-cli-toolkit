# rust-build-optimization

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when a Rust or Cargo build is slow and the user wants it diagnosed or sped up: profiling compile times with cargo --timings or -Zself-profile, finding whether the bottleneck is dependencies, codegen/LLVM, linking, or one oversized crate, and applying targeted fixes such as faster linkers (lld, mold, wild), incremental compilation, dev/release profile tuning, workspace splitting, Cranelift, the nightly parallel frontend, or CI caching with sccache.

## 触发场景

- a Rust or Cargo build is slow and the user wants it diagnosed or sped up: profiling compile times with cargo --timings or -Zself-profile, finding whether the bottleneck is dependencies, codegen/LLVM, linking, or one oversized crate, and applying targeted fixes such as faster linkers (lld, mold, wild), incremental compilation, dev/release profile tuning, workspace splitting, Cranelift, the nightly parallel frontend, or CI caching with sccache
- Also for reviewing .cargo/config.toml or Cargo.toml profile settings for build speed
- Not for making the compiled program run faster (runtime optimization), general Rust coding or debugging questions, or non-Rust build systems

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `rust-build-optimization` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `rust`, `cargo`, `compile-times`, `build-performance`, `linker`, `profiling` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill rust-build-optimization
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/rust-build-optimization/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/rust-build-optimization/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/rust-build-optimization/references` | 目录 | 2 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/rust-build-optimization/agents` | 配套 agent |
| evals | `skills/development-workflows/rust-build-optimization/evals` | 评测样例 |
| references | `skills/development-workflows/rust-build-optimization/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/rust-build-optimization/SKILL.md`
- `skills/development-workflows/rust-build-optimization`
