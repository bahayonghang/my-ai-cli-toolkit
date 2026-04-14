# brand-design-md

> A Claude Code skill that turns real brand design systems from [getdesign.md](https://getdesign.md) into concrete UI code, not vague “inspired by” prompting.

[English](#english) · [中文](#中文)

---

<a name="english"></a>

## What This Version Fixes

This repository version upgrades the original idea from a static prompt into a catalog-safe skill:

- it no longer trusts a hard-coded brand table as the source of truth
- it resolves brands through the live `getdesign list` catalog
- it fetches specs with deterministic `--out` paths instead of assuming a fixed temp file
- it separates greenfield prototype generation from existing-project component edits
- it ships eval prompts and trigger-eval samples so the skill can be tested and iterated

## What It Does

When a user asks for UI that should feel like a real brand or product, the skill:

1. resolves the requested brand through `scripts/getdesign-helper.mjs`
2. fetches the corresponding `DESIGN.md` with `npx getdesign@latest add <slug> --out <path>`
3. extracts exact tokens such as color, typography, spacing, radius, and shadow rules
4. generates UI code that follows those values directly

Example prompts:

> “Build a hero section in Apple style”  
> “Turn this React pricing card into Stripe style”  
> “Notion warm colors + Linear layout, build a feature section”  
> “Make an editorial landing page that feels like WIRED”

## Live Brand Catalog

The supported brand set is dynamic. This skill treats `npx getdesign@latest list` as the source of truth.

As of **2026-04-14**, the live catalog returned **66 brands**, including newer entries such as:

- `bugatti`
- `playstation`
- `theverge`
- `wired`

Check the current catalog:

```bash
npx getdesign@latest list
node scripts/getdesign-helper.mjs list --json
```

Representative brands:

- Tech / AI: Apple, Claude, Cursor, Figma, Notion, Supabase, Vercel, X.AI
- Dev tools / infra: Airtable, IBM, Linear, MongoDB, Stripe
- Editorial / consumer: Airbnb, BMW, Ferrari, Nike, PlayStation, Spotify, Tesla, The Verge, WIRED

## Helper Script

This version includes a small cross-platform Node helper at:

```text
scripts/getdesign-helper.mjs
```

It handles:

- live brand discovery via `getdesign list`
- Chinese aliases and common nicknames
- deterministic fetch output paths
- simple fuzzy suggestions when the requested brand is unknown

Examples:

```bash
node "$SKILL_DIR/scripts/getdesign-helper.mjs" resolve --query "参考 WIRED 做一个 editorial landing page"
node "$SKILL_DIR/scripts/getdesign-helper.mjs" fetch --slug wired
node "$SKILL_DIR/scripts/getdesign-helper.mjs" fetch --slug stripe --out ./docs/stripe-design.md
```

## Installation

### Prerequisites

- [Claude Code](https://claude.ai/code)
- Node.js with `npx`

### Install the whole skill directory

Do not copy only `SKILL.md`. This version includes a helper script and eval assets.

```bash
mkdir -p ~/.claude/skills/brand-design-md
cp -R brand-design-md/* ~/.claude/skills/brand-design-md/
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force "$HOME\\.claude\\skills\\brand-design-md" | Out-Null
Copy-Item -Recurse ".\\brand-design-md\\*" "$HOME\\.claude\\skills\\brand-design-md\\"
```

Restart Claude Code after installation.

## Output Behavior

- Greenfield requests default to a single-file HTML prototype
- Existing project requests should stay in the original stack when possible
- Mixed-brand requests are capped at 2 brands by default
- The output should always report the chosen slug(s) and the key token sources

## Included Evaluation Assets

This skill directory now includes:

- `evals/evals.json` for end-to-end qualitative test prompts
- `evals/trigger-evals.json` for should-trigger / should-not-trigger description tests

## License

MIT

Design specs are sourced from [getdesign.md](https://getdesign.md) / [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md). Brand identities remain the property of their respective owners.

---

<a name="中文"></a>

## 这个版本修了什么

这个仓库版本把原来的“静态 prompt”升级成了更稳定的 skill：

- 不再把手写品牌表当成真值源
- 品牌支持集实时来自 `getdesign list`
- 用 `--out` 固定 DESIGN 文件输出路径，不再假设固定临时路径
- 区分“新建原型”和“改现有项目组件”两条路径
- 自带评估样例，方便后续做触发与效果迭代

## 它会做什么

当用户要“某个真实品牌/产品/媒体站点的视觉语言”时，这个 skill 会：

1. 用 `scripts/getdesign-helper.mjs` 解析品牌
2. 用 `npx getdesign@latest add <slug> --out <path>` 获取对应 `DESIGN.md`
3. 提取颜色、排版、间距、圆角、阴影等精确 token
4. 基于这些 token 生成或改造 UI 代码

示例：

> “做一个 Apple 风格 hero”  
> “把这个 React pricing card 改成 Stripe 风格”  
> “Notion 暖色 + Linear 排版，做个 feature section”  
> “参考 WIRED 做一个 editorial landing page”

## 动态品牌目录

支持品牌不是写死的，而是以上游 `getdesign list` 为准。

截至 **2026-04-14**，实时目录返回 **66 个品牌**，其中包括较新的：

- `bugatti`
- `playstation`
- `theverge`
- `wired`

查看当前目录：

```bash
npx getdesign@latest list
node scripts/getdesign-helper.mjs list --json
```

## 安装方式

不要只复制 `SKILL.md`。这个版本还依赖 helper 脚本和评估资源。

```bash
mkdir -p ~/.claude/skills/brand-design-md
cp -R brand-design-md/* ~/.claude/skills/brand-design-md/
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force "$HOME\\.claude\\skills\\brand-design-md" | Out-Null
Copy-Item -Recurse ".\\brand-design-md\\*" "$HOME\\.claude\\skills\\brand-design-md\\"
```

## 输出策略

- 绿地请求默认输出单文件 HTML
- 现有项目请求优先保持原技术栈和组件形态
- 混搭默认最多 2 个品牌
- 输出时要明确说明最终使用的 slug 和关键 token 来源

## 附带评估资源

目录中已包含：

- `evals/evals.json`：端到端测试提示词
- `evals/trigger-evals.json`：触发 / 不触发测试集
