# 从零开始配置 Claude Code 与完整 Skills 安装流程

本文档用于快速完成以下事情：

1. 安装 Claude Code 基础环境
2. 配置全局记忆与指导文件
3. 安装 oh-my-claudecode
4. 安装本仓库中的一方 skills
5. 按需安装 `community-skills-registry` 中维护的第三方 skills
6. 在需要时使用本仓库的 MCS、Web 和本地文档

## 1. 前置要求

按使用场景区分：

- 只安装 skills：
  - Node.js
  - npm / npx
  - Claude Code
- 需要本地仓库工作流时额外准备：
  - Git
  - 可选：Rust（仅当你要运行 `just mcs` / `just web` 时需要）
  - 可选：`just`（推荐，用于统一执行仓库命令）

## 2. 安装 Claude Code

使用如下命令安装基础配置：

```shell
npx zcf
```

然后按官方方式完成 Claude Code 登录、基础目录初始化，以及 exa MCP 等你需要的通用能力。

## 3. 配置 Claude 全局记忆

使用 `prompts` 中的 `CLAUDE.md` 作为全局记忆与指导文件基础版本。

## 4. 安装 oh-my-claudecode

```shell
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode

/plugin install oh-my-claudecode

/oh-my-claudecode:omc-setup
```

## 5. 推荐安装路径：直接从 GitHub 安装 skills

这是后续安装”本仓库一方 skills + `community-skills-registry` 第三方 skills”最推荐的路径，不需要先克隆本仓库。

### 直接安装本仓库一方 skills catalog

如果你只想安装本仓库的一方 skills，不需要 community-skills-registry 的交互选择流程：

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

### 无交互式一次性安装全部一方 skills

如果你希望把本仓库一方 skills 无交互式安装到指定 Agent，可直接执行：

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a kiro-cli -a qwen-code -a trae -a trae-cn
```

这条命令只覆盖本仓库的一方 skills，不包含 `community-skills-registry` 的第三方 registry 选择流程。

### 一个第三方 skill 示例

如果你想直接安装 `community-skills-registry` 里收录的整包第三方 skill，例如数字生命卡兹克技能包，可以执行：

```bash
npx skills add KKKKhazix/khazix-skills -g
```

更多第三方条目与说明见 `docs/guide/community-skills-registry.md` 和 `docs/zh/guide/community-skills-registry.md`。

## 6. 后续所有 skills 的推荐安装顺序

建议按下面顺序逐步补齐：

1. 使用 `npx skills add` 安装你常用的一方 skills
2. 如果你需要给多个 Agent 批量铺满一方 skills，可用无交互式安装命令
3. 后续新增 skills 时，重新执行安装命令即可

## 7. 什么时候需要克隆本仓库

只有在你需要以下能力时，才需要克隆本仓库：

- 使用 `just mcs` 启动 Rust TUI 管理器
- 使用 `just web` 启动 Web 管理界面
- 使用 `just doc` 启动本地文档站点

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings
```

## 8. 浏览与管理所有 skills

如果你希望在安装前后浏览 catalog、查看安装状态、做 diff 或批量管理，可使用仓库自带的 MCS。

### 终端界面

```bash
just mcs
```

### Web 界面

```bash
just web
```

## 9. Hook 配置建议

建议继续保留原有 Hook 规则，并补充到你的运行时配置中：

- 当 Tool Calls > 8 次时，强制 Claude 输出一条优化建议
  - 可复用 skill
  - 记忆模式
  - 工作流修复建议
- 当提示词 > 50 字时，让 Claude 检查期望结果是否清晰

## 10. 推荐的后续使用顺序

完成上述安装后，推荐按下面顺序使用：

1. 先完成 Claude Code / OMC / 全局记忆的基础配置
2. 通过 `npx skills add` 安装一方 skills
3. 按需从 `community-skills-registry` 中补充第三方 skills
4. 只有在需要本地管理能力时再克隆本仓库
5. 需要统一浏览和管理时，再使用 `just mcs` 或 `just web`

## 11. 相关入口

- 仓库总说明：`README.md`
- 中文说明：`README_CN.md`
- 安装文档：`docs/guide/installation.md`
- 中文安装文档：`docs/zh/guide/installation.md`
- 外部技能说明：`docs/guide/community-skills-registry.md`
- 中文外部技能说明：`docs/zh/guide/community-skills-registry.md`
