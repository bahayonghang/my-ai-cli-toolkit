# 外部技能

## 概览

第三方技能现在由注册表文件 `content/skills/external-skills.toml` 描述。

它与仓库自带的 `content/skills/` 一方技能目录共存，但它本身不是可安装技能目录。

当前模型是：

- 一方技能：`content/skills/<category>/<skill-name>/`
- 第三方注册表：`content/skills/external-skills.toml`
- Web 管理入口：MCS Web 的 `npx skills`

## 支持的安装类型

当前注册表覆盖：

- `npm-cli`
- `npx`
- `pip-cli`
- `git`
- `vercel`

## 与 MCS 的关系

MCS 会通过 `mcs-core` 读取这份注册表，并在 Web API 中暴露 external skill 相关能力。

也就是说：

- 一方 catalog 在 `content/skills/`
- 三方注册表也位于 `content/skills/`
- 文档里仍然要把“一方技能目录”和“三方注册表数据”区分开说明

## 什么时候使用它

以下场景适合 external skills：

- 能力由仓库外部维护
- 安装依赖其他包管理器或远程仓库
- 想把第三方能力的生命周期与主 catalog 分离

## 注册表示例

```toml
[schema]
version = 2

[[skills]]
id = "find-skills"
name = "find-skills"
category_id = "frontend"

[skills.install]
kind = "skills_cli"
provider = "vercel"
package_ref = "vercel-labs/skills"
skill_flag = "find-skills"
```

旧的 Python 安装器/TUI 已退役。
