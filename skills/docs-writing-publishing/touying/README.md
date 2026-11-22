# Touying (`2.0.0`)

面向 `@preview/touying:0.8.0`（要求 Typst `0.15.0+`）的 Typst 演示文稿工程技能包：提供精准的触发与排除边界、多文件架构规范、从 `0.6.x`/`0.7.x` 升级至 `0.8.0` 的破坏性变更迁移指南、`8` 份 `0.8.0` 参考手册与 `6` 级可编译示例（含 `animations`/`waypoints`、`article` 多模式、定制 `notes-fn`/bundle `.pdfpc` 及生态集成），以及确定性脚本与 `--warnings promote` 排障闭环。

## 目录结构亮点

- **核心规范与专题指南（`references/`）**：`core-0.8.md`、`animations-waypoints.md`、`output-modes-article.md`、`migration-0.8.md`、`themes-notes-export.md`、`integrations.md`、`visual-craft.md` 与 `troubleshooting.md`。
- **分级 0.8.0 示例（[examples/README.md](examples/README.md)）**：`01-minimal.typ`、`02-multi-file/`、`03-animations-waypoints-math.typ`、`04-multi-mode-article.typ`、`05-theme-notes.typ` 与 `06-bundle-pdfpc.typ`。
- **环境诊断与审计脚本（`scripts/touying_check.py`）**：提供 `doctor`（检测 Typst `>= 0.15.0` 与 `--warnings` 标志）、`audit --strict-warnings`（静态反模式与纯列表退化审计）以及 `compile`（多模式与 `--bundle` 实测编译及严格告警提升）。

## 安装

使用 Skills CLI 从本仓库安装：

```bash
npx skills add bahayonghang/my-ai-cli-toolkit/skills --skill touying
```

或在仓库根目录使用本地 live-link 安装器：

```bash
just install-projects --skill touying
```

## 你可以直接这样说

- 「用 Touying 0.8.0 帮我搭一个 16:9 的 `.typ` 演示文稿，采用 `globals.typ` + `main.typ` + 分节文件结构。」
- 「帮我把这个老版本的 Touying 幻灯片项目迁移到 `0.8.0`，处理 `semi-transparent-cover`、`touying-equation` 和脚注参考文献变更。」
- 「为什么我的 `#pause` 放在 `context` 里报错，或者 `--warnings promote` 报 `detecting slide content overflow`？」
- "Refactor this Typst Touying deck to support `presentation`, `handout`, and `article` export modes with clean `.pdfpc` bundle notes."

## 适用范围与排除边界

- **适用**：基于 `@preview/touying:0.8.0`（Typst `>= 0.15.0`）创建、重构、迁移或排障 `.typ` 演示文稿、主题、动画、演讲者备注与多模式导出。
- **排除**：
  - 非 Typst 幻灯片工具（`HTML`、`reveal.js`、`PPT`/`.pptx`、`Marp`）。
  - 普通非幻灯片 Typst 论文、简历或常规排版文档（除非明确配置 `export-mode: "article"` 复用演示文稿源）。
  - 基于 XeLaTeX Beamer 的中文学位论文答辩模板（应路由至 `academic-defense-beamer`）。

## 上游灵感与许可证声明

https://github.com/apcamargo/typst-skills; https://github.com/touying-typ/seaslides; https://github.com/tylina/tylina-skill; https://github.com/statzhero/typst-touying-skill

- 上述开源项目均仅在机制层面启发本包架构与门禁设计；对于未声明许可证的候选仓库严格执行零原文/模板复制边界（详见 [先例研究报告](reports/prior-art-research.md)）。

## 验证命令

```bash
# 仓库元数据与评测 schema 校验
python scripts/check_skill_frontmatter.py skills/docs-writing-publishing/touying
python scripts/check_skill_evals.py skills

# 包内契约测试（Node + Python stdlib unittest）
node --test skills/docs-writing-publishing/touying/tests/touying.test.mjs
python -m unittest discover -s skills/docs-writing-publishing/touying/tests -p test_*.py

# Qiaomu Production 包门禁与触发边界评测
python .agents/skills/qiaomu-meta-skill/scripts/validate_skill.py skills/docs-writing-publishing/touying
python .agents/skills/qiaomu-meta-skill/scripts/trigger_eval.py skills/docs-writing-publishing/touying --cases evals/trigger_cases.json
python .agents/skills/qiaomu-meta-skill/scripts/release_check.py skills/docs-writing-publishing/touying --phase local --run-tests

# Touying 0.8.0 环境自检、静态审计与分级示例编译
python skills/docs-writing-publishing/touying/scripts/touying_check.py doctor --json
python skills/docs-writing-publishing/touying/scripts/touying_check.py audit skills/docs-writing-publishing/touying/examples --strict-warnings --json
python skills/docs-writing-publishing/touying/scripts/touying_check.py compile skills/docs-writing-publishing/touying/examples/04-multi-mode-article.typ --modes presentation,handout,article --json
```

## Troubleshooting

| 现象 | 原因 | 解决方法 |
| --- | --- | --- |
| `#set page(...)` 不生效 | Touying 每页会应用 `self.page` | 改用 `config-page(...)` 或 `#slide(config: config-page(...))` |
| `typst compile --warnings promote` 在旧 cover 或公式报错 | `semi-transparent-cover` 与 `touying-equation` 在 `0.8.0` 已弃用 | 改用 `utils.alpha-changing-cover` / `utils.color-changing-cover` 与原生数学动画 `$ frac(a #pause + b, c) $` |
| `Unsupported mark` 编译 panic | `#pause` / `#only` 写进了 `context` 或 `measure` 内部 | 移至顶层幻灯片流、改用 `utils.methods(self)` + 显式 `repeat:`，或主题辅助函数改用 `touying-fn-wrapper-raw` |
| 出现 `detecting slide content overflow` 警告 | `breakable: false` 下内容高度或宽度超出可用版心 | 拆分页面、精简单页要点或按需开启 `clip: true` / `breakable: true` |
| 负数子帧索引（如 `#only(-1)`）报错 | `0.8.0` 禁止在流式解析动画函数中使用负索引 | 改用 `#waypoint(<end>)` 搭配 `get-last(<end>)` |
