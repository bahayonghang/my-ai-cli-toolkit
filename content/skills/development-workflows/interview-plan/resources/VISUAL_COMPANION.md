# 可视化伴侣指南

基于浏览器的可视化头脑风暴伴侣，用于展示模型、图表和选项。

## 何时使用

逐问题决定，而非逐会话。判断标准：**用户看到它是否比读到它更容易理解？**

**使用浏览器**（内容本身是视觉性的）：

- **UI 模型** — 线框图、布局、导航结构、组件设计
- **架构图** — 系统组件、数据流、关系映射
- **并排视觉对比** — 比较两种布局、配色方案、设计方向
- **设计打磨** — 关于外观、间距、视觉层次的问题
- **空间关系** — 状态机、流程图、实体关系图

**使用终端**（内容是文本或表格）：

- **需求和范围问题** — "X 是什么意思？"、"哪些功能在范围内？"
- **概念性 A/B/C 选择** — 用文字描述的方案选择
- **权衡列表** — 优缺点、对比表
- **技术决策** — API 设计、数据建模、架构方案选择
- **澄清性问题** — 答案是文字而非视觉偏好的任何问题

关于 UI 话题的问题不一定是视觉问题。"你想要什么样的向导？"是概念性的 — 用终端。"这些向导布局哪个感觉更好？"是视觉性的 — 用浏览器。

## 工作原理

服务器监视目录中的 HTML 文件，将最新的文件提供给浏览器。你编写 HTML 内容，用户在浏览器中查看并可点击选择选项。选择记录到 `.events` 文件，你在下一轮读取。

**内容片段 vs 完整文档：** 如果 HTML 文件以 `<!DOCTYPE` 或 `<html` 开头，服务器原样提供（仅注入辅助脚本）。否则，服务器自动用框架模板包装内容 — 添加页头、CSS 主题、选择指示器和所有交互基础设施。**默认编写内容片段。** 仅在需要完全控制页面时编写完整文档。

## 启动会话

```bash
# 启动服务器并持久化（模型保存到项目）
scripts/start-server.sh --project-dir /path/to/project

# 返回: {"type":"server-started","port":52341,"url":"http://localhost:52341",
#         "screen_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000"}
```

保存响应中的 `screen_dir`。告知用户打开 URL。

**查找连接信息：** 服务器将启动 JSON 写入 `$SCREEN_DIR/.server-info`。如果在后台启动服务器且未捕获 stdout，读取该文件获取 URL 和端口。使用 `--project-dir` 时，检查 `<project>/.superpowers/brainstorm/` 获取会话目录。

**按平台启动：**

- **Claude Code:** 默认模式即可 — 脚本自行后台运行服务器
- **Codex:** 脚本自动检测 CODEX_CI 并切换到前台模式，正常运行即可
- **Gemini CLI:** 使用 `--foreground` 并在 shell 工具调用中设置 `is_background: true`

如果 URL 从浏览器不可达（远程/容器化环境常见），绑定非回环主机：

```bash
scripts/start-server.sh \
  --project-dir /path/to/project \
  --host 0.0.0.0 \
  --url-host localhost
```

## 交互循环

1. **检查服务器存活**，然后**写入 HTML** 到 `screen_dir` 中的新文件：
   - 每次写入前，检查 `$SCREEN_DIR/.server-info` 是否存在。如果不存在（或 `.server-stopped` 存在），服务器已关闭 — 用 `start-server.sh` 重启后再继续。服务器在 30 分钟无活动后自动退出。
   - 使用语义化文件名：`platform.html`、`visual-style.html`、`layout.html`
   - **永远不要重用文件名** — 每个屏幕使用新文件
   - 使用 Write 工具 — **不要使用 cat/heredoc**
   - 服务器自动提供最新文件

2. **告知用户期望内容并结束你的回合：**
   - 每步都提醒 URL（不仅是第一次）
   - 简要文字摘要屏幕内容（如"展示 3 种首页布局选项"）
   - 请用户在终端回复："看一下，告诉我你的想法。如果愿意可以点击选择选项。"

3. **下一轮** — 用户在终端回复后：
   - 读取 `$SCREEN_DIR/.events`（如果存在）— 包含用户浏览器交互（点击、选择）的 JSON 行
   - 与用户终端文本合并获取完整信息
   - 终端消息是主要反馈；`.events` 提供结构化交互数据

4. **迭代或推进** — 如果反馈改变当前屏幕，写入新文件（如 `layout-v2.html`）。仅在当前步骤验证后才进入下一个问题。

5. **返回终端时卸载** — 当下一步不需要浏览器时，推送等待屏幕清除过时内容：

   ```html
   <!-- filename: waiting.html -->
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">在终端中继续...</p>
   </div>
   ```

6. 重复直到完成。

## 编写内容片段

只编写页面内部的内容。服务器自动用框架模板包装（页头、主题 CSS、选择指示器和所有交互基础设施）。

**最小示例：**

```html
<h2>哪种布局更好？</h2>
<p class="subtitle">考虑可读性和视觉层次</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>单列</h3>
      <p>简洁、专注的阅读体验</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>双列</h3>
      <p>侧边栏导航配合主内容</p>
    </div>
  </div>
</div>
```

## 可用 CSS 类

框架模板提供以下 CSS 类：

- **选项 (A/B/C 选择):** `.options` > `.option[data-choice]` — 添加 `data-multiselect` 到容器启用多选
- **卡片 (视觉设计):** `.cards` > `.card[data-choice]` — 含 `.card-image` 和 `.card-body`
- **模型容器:** `.mockup` > `.mockup-header` + `.mockup-body`
- **分屏视图:** `.split` — 并排对比
- **优缺点:** `.pros-cons` > `.pros` + `.cons`
- **模拟元素:** `.mock-nav`、`.mock-sidebar`、`.mock-content`、`.mock-button`、`.mock-input`、`.placeholder`
- **排版:** `h2`（页面标题）、`h3`（节标题）、`.subtitle`、`.section`、`.label`

## 浏览器事件格式

用户在浏览器中点击选项时，交互记录到 `$SCREEN_DIR/.events`（每行一个 JSON 对象）。推送新屏幕时文件自动清除。

```jsonl
{"type":"click","choice":"a","text":"选项 A - 简单布局","timestamp":1706000101}
{"type":"click","choice":"b","text":"选项 B - 混合方案","timestamp":1706000115}
```

如果 `.events` 不存在，用户未与浏览器交互 — 仅使用终端文本。

## 清理

```bash
scripts/stop-server.sh $SCREEN_DIR
```

使用 `--project-dir` 的会话，模型文件持久保存在 `.superpowers/brainstorm/` 中供后续参考。

## 参考

- 框架模板（CSS 参考）：`scripts/frame-template.html`
- 辅助脚本（客户端）：`scripts/helper.js`
