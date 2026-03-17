# MCS Web

## 它是什么

`mcs-web` 是 Rust workspace 中面向浏览器的界面：

- 后端：`mcs/mcs-web/src/` 下的 Axum 服务
- 前端：`mcs/mcs-web/ui/` 下的 React + TypeScript UI
- 共享逻辑：`mcs-core`

## 开发模式运行

```bash
just web
```

该命令会同时启动：

- 后端：`http://127.0.0.1:23242`
- UI：`http://localhost:15173`

## 构建并运行生产模式

```bash
just mcs-web
```

相关命令还包括：

- `just mcs-web-server`
- `just mcs-web-dev`
- `just mcs-web-build`
- `just mcs-web-test`

## 后端行为

`mcs-web` 会：

- 通过 `content/skills/` 识别仓库根目录
- 通过 `mcs-core` 读取平台配置
- 暴露平台、dashboard、skills、commands、prompt、sync，以及基于外部注册表的 `npx skills` REST API
- 在 `mcs-web/ui/dist/` 存在时直接托管构建后的 SPA

## 前端界面

当前 UI 主要包含：

- 平台选择
- 已安装内容视图
- dashboard
- unified install hub
- detail / diff / install dialogs

对应源码位于：

- `mcs/mcs-web/ui/src/pages/`
- `mcs/mcs-web/ui/src/components/`
- `mcs/mcs-web/ui/src/stores/`

## 什么时候用 Web 而不是 TUI

以下场景更适合 MCS Web：

- 想在浏览器里完成安装和浏览
- 需要更丰富的 detail drawer 和 install dialog
- 想使用 unified install hub
- 需要通过截图或视觉方式审查安装体验

以下场景更适合 TUI：

- 终端内的高速键盘工作流
- SSH / 远程 shell 环境
- 不打开浏览器就快速检查 source 与 installed 状态

## 相关页面

- [MCS TUI](/zh/guide/mcs)
- [MCS 架构](/zh/guide/mcs-architecture)
