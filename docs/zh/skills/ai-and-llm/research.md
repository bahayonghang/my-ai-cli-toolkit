# research

使用 Codex CLI 进行技术研究，支持网络搜索和引用。

## 核心原则

1. **Codex 只负责检索** - 获取原始来源，自己分析组织
2. **聚焦关键结果** - 只保留用户关心的内容
3. **完整引用** - 所有声明需要可点击的来源
4. **验证链接** - 最终确认前验证 URL

## 工作流程

### 1. 明确目标
- 核心问题是什么？
- 需要对比什么？
- 哪些方面重要？

### 2. 批量检索

```bash
codex e -m gpt-5.1-codex -c model_reasoning_effort=high \
  --enable web_search_request \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Return RAW search results with URLs. Search: <query>"
```

**查询技巧**：
- 添加年份约束：`2024 2025`
- 包含准确的产品名称
- 每个查询聚焦单一主题

### 3. 提取与组织
- 筛选有价值的信息
- 组织结构
- 添加分析和见解
- 统一引用格式

### 4. 验证链接

```bash
codex e ... "Verify if these URLs are valid: 1. <url1> 2. <url2>"
```

## 输出格式

### 行内引用
```markdown
OpenSearch 于 2021 年从 Elasticsearch 7.10 分叉（[AWS 博客]）。

[AWS 博客]: https://aws.amazon.com/blogs/...
```

### 报告结构
```markdown
# [主题] 研究报告

## 1. 概述
## 2. 核心特性
## 3. 对比
## 4. 建议

## 参考文献
[链接 1]: URL1
[链接 2]: URL2
```

## 来源优先级

1. 官方文档
2. 官方博客/公告
3. 第三方技术博客（验证质量）
4. 独立基准测试（注意偏见）

## 常见陷阱

| 陷阱 | 解决方案 |
|------|----------|
| 搜索了错误的产品 | 查询中包含准确名称 |
| 404 链接 | 最终确认前验证 |
| 厂商偏见 | 在报告中注明来源 |
| 查询过于宽泛 | 聚焦单一主题 |
