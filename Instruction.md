# 从零开始配置 Claude Code

## 1. 安装 Claude Code
使用如下命令安装配置基础配置：

```shell
npx zcf
```
使用官方安装和配置exa mcp

## 2. 配置 Claude 全局记忆

使用 prompts 中的 CLAUDE.md。

## 3. 安装 oh my claudecode

```shell
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode

/plugin install oh-my-claudecode

/oh-my-claudecode:omc-setup
```

## 4. 配置Hook

设置 Hook，当 Tool Calls > 8 次时，强制 Claude 输出一条优化建议（可复用 skill、记忆模式、工作流修复）

设置 Hook，当提示词 > 50 字时，让 Claude 检查期望结果是否清晰
