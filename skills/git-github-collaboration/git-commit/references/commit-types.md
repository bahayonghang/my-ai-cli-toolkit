# 约定式提交类型参考

## 常用提交类型

| 类型       | 说明                         | 示例                                |
| ---------- | ---------------------------- | ----------------------------------- |
| `feat`     | 新功能                       | feat: 添加用户登录功能              |
| `fix`      | 修复 bug                     | fix: 修复登录页面验证码不显示的问题 |
| `docs`     | 文档变更                     | docs: 更新 API 文档                 |
| `style`    | 代码格式调整(不影响功能)     | style: 统一代码缩进为 2 空格        |
| `refactor` | 重构(既不是新功能也不是修复) | refactor: 重构用户认证模块          |
| `perf`     | 性能优化                     | perf: 优化列表查询性能              |
| `test`     | 测试相关                     | test: 添加用户登录单元测试          |
| `build`    | 构建系统或依赖变更           | build: 升级 webpack 到 5.0          |
| `ci`       | CI 配置变更                  | ci: 添加 GitHub Actions 工作流      |
| `chore`    | 其他不修改源码的变更         | chore: 更新 .gitignore              |
| `revert`   | 回滚提交                     | revert: 回滚 feat: 添加支付功能     |

## 提交信息格式

### 基本格式

```
<类型>: <简短描述>

[可选的详细描述]

[可选的尾注]
```

### 带作用域的格式

```
<类型>(<作用域>): <简短描述>
```

示例:

- `feat(auth): 添加 OAuth2 登录支持`
- `fix(ui): 修复按钮样式在移动端错位`
- `docs(api): 更新用户 API 文档`

## 编写规范

### 简短描述规则

1. **使用动词开头**: 添加、修复、更新、删除、优化
2. **保持简短**: compose 脚本按显示宽度强制整个 header ≤ 72 列（CJK 与 emoji 每字符按 2 列计），中文 subject 建议 25 字以内，英文 50 字符以内
3. **不使用句号**: 描述结尾不加标点
4. **描述做了什么**: 而不是为什么做

✅ 好的示例:

- `feat: 添加用户头像上传功能`
- `fix: 修复购物车商品数量计算错误`
- `refactor: 重构数据库连接池逻辑`

❌ 不好的示例:

- `更新了一些东西` (不明确)
- `feat: 添加了用户可以上传头像的功能,支持 jpg 和 png 格式,大小不超过 5MB` (太长)
- `修复 bug` (不具体)

### 详细描述(可选)

- 换行后书写,解释变更的原因和影响
- 每行不超过 72 个字符
- 可以包含多个段落

示例:

```
feat: 添加用户头像上传功能

用户现在可以在个人设置页面上传自定义头像。
支持的格式: JPG, PNG, WebP
文件大小限制: 5MB
自动生成缩略图: 200x200, 48x48
```

### 尾注(可选)

- Breaking Change: 标记破坏性变更
- Closes: 关闭相关 issue

示例:

```
feat: 重构用户 API 认证方式

从 Session 认证改为 JWT Token 认证

BREAKING CHANGE: 旧的 session 认证方式已移除,客户端需要更新为 JWT 认证
Closes #123, #456
```

## 常见场景示例

### 新功能开发

```
feat: 添加商品收藏功能
feat(search): 添加搜索结果高亮显示
feat(payment): 集成支付宝支付
```

### Bug 修复

```
fix: 修复登录超时后无法重新登录
fix(cart): 修复购物车商品删除后总价未更新
fix(ui): 修复移动端导航菜单无法展开
```

### 文档更新

```
docs: 更新安装说明
docs(api): 添加用户认证 API 文档
docs: 修正 README 中的拼写错误
```

### 性能优化

```
perf: 优化首页加载速度
perf(db): 添加数据库查询索引
perf: 使用懒加载优化图片加载性能
```

### 代码重构

```
refactor: 重构用户权限检查逻辑
refactor(api): 统一 API 错误处理格式
refactor: 提取公共组件到 components 目录
```

## Agent 提交（Agent-Aware Commits）

Agent 生成的提交在标准 Conventional Commit 基础上追加两类元数据：header `[AI]` 标签 + 一组 trailer。

### Header 形式

```
<type>(<scope>): [AI] <emoji> <subject>
```

- `[AI]` 位于冒号之后、emoji 之前
- emoji 与 `[AI]` 正交：保留 emoji 不影响 `[AI]` 显示
- 用户显式说「不要 AI 标记」时省略 `[AI]` 并跳过所有 agent trailer

### Trailer 字段

| 字段               | 用途                                | 示例                                             |
| ------------------ | ----------------------------------- | ------------------------------------------------ |
| `Agent-Task`       | 任务来源（issue URL / 任务 ID）     | `Agent-Task: https://linear.app/x/issue/AUTH-42` |
| `Agent-Model`      | 模型标识                            | `Agent-Model: claude-opus-4-8`                   |
| `Agent-Prompt-Ref` | prompt 摘要 / hash / 短标签（可选） | `Agent-Prompt-Ref: prompt-2026-05-14-abc123`     |
| `Generated-By`     | 固定 `agent`，审计哨兵              | `Generated-By: agent`                            |

trailer 顺序：先 `BREAKING CHANGE` → 用户自定义 footer → `Closes` → `Refs` → `Confidence` → `Scope-risk` → `Tested` → `Agent-Task` → `Agent-Model` → `Agent-Prompt-Ref` → `Generated-By`。

`Confidence` / `Scope-risk` / `Tested` 是质量留痕 trailer（agent-mode 推荐填写、不强制）：分别记录自评可信度、影响半径、验证方式，由 compose 脚本 `--confidence` / `--scope-risk` / `--tested` 生成。详见 [agent-workflow.md](agent-workflow.md)。

### 审计命令

```bash
# 列出所有 agent 提交
git log --grep='^Generated-By: agent' --format='%H %s'

# 按模型筛选
git log --grep='^Agent-Model: claude-opus-4-8'

# 按 `[AI]` 标签过滤
git log --grep='\[AI\]' --format='%H %s'
```

### 端到端示例

**示例 1：feat 含 Why + 完整 trailer**

```
feat(auth): [AI] ✨ 添加 SMS 兜底登录

Why: 短信兜底降低验证码服务故障时的登录失败率

Closes #88
Confidence: high
Scope-risk: narrow
Tested: just ci
Agent-Task: https://linear.app/x/issue/AUTH-42
Agent-Model: claude-opus-4-8
Generated-By: agent
```

**示例 2：fix 含 Closes + Refs + 多 trailer**

```
fix(payment): [AI] 🐛 修复回调重复写入账本

Why: 回调被网关重试，导致同一笔订单出现重复 ledger 行

Jira: PROJ-456
Closes #128
Refs #130
Agent-Task: PROJ-456
Agent-Model: claude-opus-4-8
Generated-By: agent
```

**示例 3：checkpoint（[WIP]）**

```
chore(wip): [AI] 🔧 [WIP] 抽取 refresh token 旋转逻辑

Agent-Task: https://linear.app/x/issue/AUTH-42
Agent-Model: claude-opus-4-8
Generated-By: agent
```

checkpoint 跳过 Why 强制校验，仍保留 trailer。合并前由 interactive rebase 把多个 `[WIP]` squash 成一个 atomic commit。
