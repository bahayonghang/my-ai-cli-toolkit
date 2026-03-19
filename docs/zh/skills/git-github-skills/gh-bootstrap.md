# GitHub Bootstrap

从上游模板安全引导 GitHub 仓库配置，而不是凭记忆手写配置文件。

## 概览

`gh-bootstrap` 现在内置了运行时脚本，用来承接重复性的执行动作：

```bash
python content/skills/git-github-skills/gh-bootstrap/scripts/gh_bootstrap_runtime.py detect .
python content/skills/git-github-skills/gh-bootstrap/scripts/gh_bootstrap_runtime.py fetch-template <repo-url> .gh-bootstrap-cache/template
python content/skills/git-github-skills/gh-bootstrap/scripts/gh_bootstrap_runtime.py render-template <template> <output> --var projectName=my-project
python content/skills/git-github-skills/gh-bootstrap/scripts/gh_bootstrap_runtime.py validate-tree .
```

## 工作流

1. 检测语言、框架和现有 `.github` 文件。
2. 阅读 `specs/template-catalog.md`，确定要使用的上游模板来源。
3. 克隆选定模板仓库。
4. 对目标模板做显式占位符替换后写入输出文件。
5. 扫描输出目录，只要还有 `{{placeholder}}` 未替换就不能结束。

## 规则

- 不能凭记忆生成 CI、Issue、PR 或其他仓库配置。
- `phases/` 和 `specs/` 继续作为规则和资料来源。
- 检测、克隆、渲染、校验这四步走统一脚本入口。

## RTK 快路径

如果本机安装了 `rtk`，可以用它做仓库扫描、模板检查和生成后的 diff 审阅；模板下载和文件渲染仍然走原始脚本路径。
