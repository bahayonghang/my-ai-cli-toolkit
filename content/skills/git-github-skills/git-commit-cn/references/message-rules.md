# 中文提交消息规则

## Header

使用以下格式：

```text
<type>(<scope>): <emoji?> <subject>
```

- `type` 保持英文 Conventional Commit 关键字
- `scope` 可选，推荐使用中文模块名
- `subject` 使用中文动宾短语，不超过 50 个字符
- 默认保留 emoji；仅在用户明确要求时关闭
- 遇到不兼容变更时，可使用 `type(scope)!:` 头部形式

## Subject 规则

- 写“添加”“修复”“优化”“重构”这类动宾短语
- 不要写空泛表述，如“改了点东西”“更新代码”
- 去掉句末 `。 . ! ！`
- 优先描述做了什么，不展开技术背景

## Body 规则

- 仅在需要补充背景、方案、影响范围时添加 body
- 每行只写一个清晰信息点，避免长段落堆叠
- 优先写：
  - 为什么做这次改动
  - 关键实现方式
  - 影响范围或验证方式

## Footer 规则

- `BREAKING CHANGE:` 用于不兼容变更说明
- `Closes #123` 用于关闭 issue
- `Refs #123` 用于关联但不关闭 issue
- 其他 footer 通过通用 trailer 表达，例如：
  - `Jira: PROJ-123`
  - `禅道: #88`

## Breaking Change 规则

以下场景默认视为 breaking：

- 公共 API 的入参、返回结构或语义不兼容
- 数据库 schema 需要迁移
- 配置格式或运行方式发生不兼容变化

出现 breaking 时：

1. 头部可使用 `!`
2. footer 中补 `BREAKING CHANGE: ...`
3. 文案中说明迁移影响，而不是只写“有破坏性变更”

## 禁止项

- 不要添加 `Co-Authored-By`
- 不要附加 AI attribution
- 不要在 message 中讨论 `git push`
- 不要为了凑格式写空洞 body
