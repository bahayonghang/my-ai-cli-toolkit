# Draw.io 技能

AI 驱动的 Draw.io 图表生成工具，支持实时浏览器预览。

## 概述

此技能使 Claude Code 能够通过自然语言命令创建、编辑和管理 draw.io 图表。它提供实时浏览器预览、版本历史记录，并支持多种图表类型，包括流程图、架构图、序列图等。

## 功能特性

- **实时预览**: 图表在 Claude 创建时实时显示和更新
- **版本历史**: 通过可视化缩略图恢复以前的图表版本
- **自然语言**: 用纯文本描述图表 - 流程图、架构图等
- **编辑支持**: 使用自然语言指令修改现有图表
- **导出功能**: 将图表保存为 `.drawio` 文件
- **自包含**: 嵌入式服务器，无需外部依赖
- **云架构支持**: 专门支持 AWS、GCP 和 Azure 架构图，包含官方图标
- **动画连接器**: 在图表元素之间创建动态和动画连接器

## 安装

```bash
# 安装技能
python3 install.py install drawio

# 或安装所有技能
python3 install.py install-all
```

该技能会自动配置 MCP 服务器：
- **命令**: `npx`
- **参数**: `["@next-ai-drawio/mcp-server@latest"]`
- **默认端口**: `6002`（如果占用会自动查找下一个可用端口）

## 使用示例

### 1. 创建架构图

```
生成一个 AWS 架构图，包含 Lambda、API Gateway、DynamoDB 和 S3，
用于无服务器 REST API
```

### 2. 流程图生成

```
创建一个显示 CI/CD 流水线的流程图：代码提交 -> 构建 -> 测试 -> 
预发布部署 -> 生产部署（带审批门）
```

### 3. 系统设计文档

```
设计一个微服务电商系统，包含用户服务、产品目录、购物车、
订单处理和支付网关
```

### 4. 云架构（AWS/GCP/Azure）

```
生成一个 GCP 架构图，包含 Cloud Run、Cloud SQL 和 Cloud Storage，
用于 Web 应用
```

### 5. 序列图

```
创建一个序列图，显示用户、客户端应用、认证服务器和资源服务器之间的 
OAuth 2.0 授权码流程
```

### 6. 动画连接器

```
给我一个 Transformer 架构的动画连接器图
```

## 工作原理

```
Claude Code <--stdio--> MCP 服务器 <--http--> 浏览器 (draw.io)
```

1. 要求 Claude 创建图表
2. Claude 调用 `start_session` 打开浏览器窗口
3. Claude 生成图表 XML 并发送到浏览器
4. 您可以实时看到图表更新！

## 工作流程

当您要求 Claude 创建或编辑图表时：

1. **会话启动**: Claude 调用 `start_session` 打开带有 draw.io 编辑器的浏览器窗口
2. **图表创建**: Claude 根据您的描述生成图表 XML
3. **实时更新**: 图表立即显示在浏览器中
4. **迭代编辑**: 您可以要求 Claude 修改图表，更改会实时显示
5. **导出**: 满意后，Claude 可以将图表导出为 `.drawio` 文件

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `start_session` | 打开带有实时图表预览的浏览器 |
| `create_new_diagram` | 从 XML 创建新图表 |
| `edit_diagram` | 通过基于 ID 的操作编辑图表 |
| `get_diagram` | 获取当前图表 XML |
| `export_diagram` | 将图表保存为 `.drawio` 文件 |

## 最佳实践

### 创建图表

- 明确指定您想要的图表类型（流程图、架构图、序列图等）
- 如果需要特定图标（AWS、GCP、Azure），请说明
- 指定是否需要动画连接器
- 描述元素之间的关系和流程

### 编辑图表

- 使用自然语言描述更改
- 通过标签引用特定元素
- 要求增量更改而不是完全重写

### 云架构图

- 指定云提供商（AWS、GCP、Azure）
- 说明您想要官方图标
- 描述服务及其连接
- 包括安全组、VPC 或其他基础设施元素

## 故障排除

### 端口已被占用

如果端口 6002 被占用，服务器会自动尝试下一个可用端口（最多到 6020）。

### "无活动会话"

首先调用 `start_session` 打开浏览器窗口。

### 浏览器未更新

检查浏览器 URL 是否有 `?mcp=` 查询参数。MCP 会话 ID 将浏览器连接到服务器。

## 环境变量

| 变量 | 默认值 | 描述 |
|------|--------|------|
| `PORT` | `6002` | 嵌入式 HTTP 服务器的端口 |
| `DRAWIO_BASE_URL` | `https://embed.diagrams.net` | draw.io 的基础 URL（用于自托管部署）|

## 链接

- [主页](https://next-ai-drawio.jiang.jp)
- [GitHub 仓库](https://github.com/DayuanJiang/next-ai-draw-io)
- [MCP 服务器文档](https://github.com/DayuanJiang/next-ai-draw-io/tree/main/packages/mcp-server)

## 许可证

Apache-2.0

## 作者

DayuanJiang
