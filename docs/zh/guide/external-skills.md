# 外部技能

## 概览

第三方技能现在由注册表目录 `content/skills/external-skills/` 描述。

它与仓库自带的 `content/skills/` 一方技能目录共存，但它本身不是可安装技能目录。

当前模型是：

- 一方技能：`content/skills/<category>/<skill-name>/`
- 一方安装清单：`content/skills/catalog.json`
- 第三方注册表索引：`content/skills/external-skills/index.toml`
- 第三方分类分片：`content/skills/external-skills/categories/<category-id>.toml`
- Web 管理入口：MCS Web 与 `npx skills`

## 支持的安装类型

当前注册表描述：

- 安装类型：`skills_cli`
- provider：`vercel`、`playbooks`

## 与 MCS 的关系

MCS 会通过 `mcs-core` 读取这份注册表，并在 Web API 中暴露 external skill 相关能力。

也就是说：

- 一方 catalog 在 `content/skills/`
- 三方注册表也位于 `content/skills/`
- 文档里仍然要把“一方技能目录”和“三方注册表数据”区分开说明

## 交互式安装流程

仓库还提供了 `tools/scripts/skills-install/` 里的终端安装脚本，适合不使用 MCS Web 的场景。

推荐远程入口：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.sh)
```

```powershell
irm https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.ps1 | iex
```

这些脚本会：

- 通过 `npx skills ls --json` 检测当前已安装技能
- 从远程 `content/skills/catalog.json` 读取一方技能元数据
- 从远程 `content/skills/external-skills/index.toml` 与 `categories/*.toml` 读取第三方注册表元数据
- 把选中的条目翻译成一个或多个 `npx skills add <package_ref> [--skill <flag>]` 命令执行

如果你已经克隆仓库，仍可使用本地 `just skills-install*` 作为便捷包装命令。

## 什么时候使用它

以下场景适合 external skills：

- 能力由仓库外部维护
- 安装依赖其他包管理器或远程仓库
- 想把第三方能力的生命周期与主 catalog 分离

## 注册表示例

```toml
# index.toml
[schema]
version = 2

[[categories]]
id = "frontend"
group_id = "engineering"
label = "Frontend"
order = 10
file = "categories/frontend.toml"
```

```toml
# categories/frontend.toml
[[skills]]
id = "find-skills"
name = "find-skills"
tags = ["discovery", "registry"]
install = { kind = "skills_cli", provider = "vercel", package_ref = "vercel-labs/skills", skill_flag = "find-skills" }
```

`category_id` 现在由 loader 根据 `index.toml` 中选中的分片文件自动注入。

旧的 Python 安装器/TUI 已退役。
