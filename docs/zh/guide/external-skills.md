# 外部技能

## 概览

第三方技能由 `content/external-skills/` 管理。

它与仓库自带的 `content/skills/` 主 catalog 是两套不同的体系。

这个目录当前包含：

- `external-skills.toml`：注册表数据
- `install.py`：CLI 安装器
- `install_tui.py`：外部 catalog 的终端界面
- `README.md`：注册表使用说明与支持的安装类型

## 支持的安装类型

当前注册表覆盖：

- `npm-cli`
- `npx`
- `pip-cli`
- `git`
- `vercel`

## 与 MCS 的关系

MCS 会通过 `mcs-core` 读取这份 catalog，并在 Web API 中暴露 external skill 相关能力。

也就是说：

- 一方 catalog 在 `content/skills/`
- 三方 catalog 在 `content/external-skills/`
- 文档里必须把这两者分开说明

## 什么时候使用它

以下场景适合 external skills：

- 能力由仓库外部维护
- 安装依赖其他包管理器或远程仓库
- 想把第三方能力的生命周期与主 catalog 分离

## CLI 示例

```bash
cd content/external-skills
uv run python install.py list
uv run python install.py agents
uv run python install.py info <skill-name>
uv run python install.py install <skill-name> --target claude
```

更完整的用法见本地文件 `content/external-skills/README.md`。
