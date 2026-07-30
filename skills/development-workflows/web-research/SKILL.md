---
name: web-research
description: "跨平台互联网来源发现、核验与本地归档。Use when the user wants to find, verify, then locally save specific web sources — 找来源, 搜一下某个平台上的讨论, 核验这几个链接, 把这些内容存到本地, 批量归档链接, collect and archive sources. 固定流程是发现 → 候选清单 → 用户确认 → 归档；搜索结果绝不自动转下载。Do NOT use for topic research, landscape comparison, or cited report writing (use deep-research-pro), for offline-only codebase questions, or for any action that posts, comments, likes, follows, or otherwise changes account state."
category: development-workflows
tags:
  - web-search
  - source-discovery
  - archiving
  - verification
  - safety-boundaries
version: 0.1.0
argument-hint: "[research-target-or-urls]"
allowed-tools: Read, Write, WebSearch, WebFetch, Bash
---

# 互联网来源发现与归档

把「我想要的东西在网上」变成「我确认过的来源已经在本地」。本 skill 负责**获取链路**，
不负责主题综述。

## 职责边界

| 需求 | 用哪个 |
| --- | --- |
| 找到、核验、落盘具体来源 | 本 skill |
| 主题调研、横向对比、带引用的研究报告 | `deep-research-pro` |

`deep-research-pro` 覆盖「拆子问题 → 检索 → 精读 → 综合 → 带引用报告」，它不负责把来源
落成本地产物。本 skill 反过来：产出可核验的候选清单和本地文件，不产出结论性综述。

两者可以串：本 skill 交出候选清单后，用户若要综述，转 `deep-research-pro`。

## 何时不用

- 用户要的是结论/观点/对比，而不是来源本身 → `deep-research-pro`。
- 问题纯粹关于本地代码库，不需要联网。
- 用户明确说不要联网。
- 请求涉及发帖、评论、点赞、收藏、关注、私信等改变账号状态的动作 → 直接拒绝，见安全边界。

## 流程

阶段之间是**硬边界**，不得跨阶段自动推进。

### 1. 锁定目标

先说清楚再动手：

- 要找什么（主题、实体、时间范围）
- 目标平台（未指定就先用通用检索，别擅自登录态检索）
- 要多少条
- 最终要什么（只要链接清单 / 要正文 / 要媒体文件）

只在答案会改变检索路线或产物形态时提问，最多 1-2 个；否则用合理默认值并声明。

### 2. 发现

用当前环境真实可用的检索能力，按可得性依次尝试：

- `WebSearch` — 通用公开网页检索
- 环境中若装有 Exa 等搜索 MCP，可用于语义化检索与批量取正文
- `Bash` 调用平台原生 CLI（如 `gh`），**先探测可用性再用**，不可用就如实说明

每个子目标试 2-3 个查询变体。不要只搜顶层关键词。

不得为了提高覆盖率而绕过任何访问控制（见安全边界第 4 条）。

### 3. 核验

候选不等于来源。每条候选至少确认：

- 链接可达，且落地页确实是候选描述的内容（用 `WebFetch` 轻量取原文核对，别只信摘要）
- 发布时间
- 发布方 / 作者
- 与用户目标的相关性理由

核验不到就标记为**未核验**，不要静默丢弃，也不要当成已核验。

### 4. 交付候选清单并停下

输出候选清单，然后**停止**。这是硬门。

```json
{
  "schema_version": "1.0",
  "request": { "target": "", "platforms": [], "limit": 0 },
  "candidates": [
    {
      "url": "",
      "title": "",
      "publisher": "",
      "published_at": "",
      "verified": true,
      "why_relevant": ""
    }
  ],
  "coverage": ["已检索的平台/路线，以及每条的产出数量"],
  "gaps": ["没能覆盖的平台、被限流的路线、未核验的候选"]
}
```

`coverage` 和 `gaps` 不是可选项。声称覆盖了实际没跑的路线，比少跑更严重。

### 5. 归档（仅在用户确认后）

用户确认要归档哪些之后才进入本阶段。

- 正文：`WebFetch` 取回，存为 Markdown，头部记录源 URL、抓取时间、抓取方式
- 媒体：`Bash` 调用 `yt-dlp` 等工具，**先探测可用性**，不可用就报缺口而不是换个野路子
- 落盘路径由用户指定，或用工作区相对路径；不假设个人 home 目录约定

归档产物必须能追溯回候选清单里的那一条。

## 安全边界

1. **所有平台只读。** 不发帖、不评论、不点赞、不收藏、不关注、不私信，不改变任何账号状态。
   同样不操控桌面客户端或移动端 UI。
2. **搜索不自动转下载。** 检索结束就是检索结束。下载、归档需要独立、明确的当轮请求。
3. **登录态与私人数据需当轮明确授权。** 执行前说明平台、原始关键词和预计条数。
   授权只对当轮的具体平台与范围有效，**不可转移**——允许导出链接不等于允许下载正文或媒体。
4. **匿名公开路线优先。** 不绕过验证码、登录墙、付费墙、限流、地区限制或访问控制。
   遇到就如实报告受阻，不找替代绕行方案。
5. **不打印或保存凭证。** Cookie、Token、API Key、登录态、敏感 URL 参数一律不输出、不写盘。
6. **不覆盖既有产物，不自动删除。** 任何清理先取得用户明确允许，且只能移入回收站。
7. **付费或大批量操作先报预算。** 会产生显著额度消耗或大量请求的操作，执行前说明范围和预计数量。

## 缺口处理

- 某个平台没有可用检索路线：写进 `gaps`，不要用通用搜索的结果冒充平台站内结果。
- 工具不可用（`yt-dlp`、`gh`、搜索 MCP 未安装）：报告具体缺口，不自动安装。
- 候选核验不通过：保留在清单里并标 `verified: false`，说明为什么。
- 结果为空：直接说没找到，以及试过哪些查询变体。不要用相关但不对题的结果填充。
