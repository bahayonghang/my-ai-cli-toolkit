---
name: wt-init
description: 初始化 Git 工作分支，根据用户输入的任务描述自动重命名当前分支。使用 type/description 格式（如 feat/login-page, fix/bug-123）。触发条件：用户输入 "/wt-init" 或请求初始化/重命名工作分支。
---

# wt-init

根据任务描述自动重命名当前 Git 分支，使用 type/description 命名规范。

## 工作流程

1. **获取任务描述**：询问用户当前要进行的任务（如果用户未提供）
2. **解析分支类型**：从任务描述中推断分支类型
3. **生成分支名**：转换为 type/description 格式
4. **检查分支状态**：确认是否有未提交的更改
5. **重命名分支**：使用 `git branch -m` 重命名当前分支

## 分支类型映射

| 关键词 | 分支类型 | 示例 |
|--------|----------|------|
| 修复、fix、bug、解决 | `fix` | fix/login-error |
| 功能、feat、新增、添加 | `feat` | feat/user-auth |
| 重构、refactor、重构 | `refactor` | refactor/api-client |
| 文档、docs、文档 | `docs` | docs/readme-update |
| 样式、style、UI、样式 | `style` | style/button-color |
| 测试、test、测试 | `test` | test/login-flow |
| 性能、perf、优化 | `perf` | perf/query-cache |
| 其他 | `chore` | chore/dependency-update |

## 分支名生成规则

1. 提取中文/英文关键词，转换为小写
2. 将空格、下划线替换为短横线
3. 移除多余短横线和特殊字符
4. 格式：`{type}/{description}`

## 示例

| 用户输入 | 生成分支名 |
|----------|-----------|
| 修复登录页面bug | fix/login-page-bug |
| 添加用户认证功能 | feat/user-auth |
| 更新 README 文档 | docs/readme-update |
| 重构 API 客户端 | refactor/api-client |

## 执行步骤

```bash
# 1. 获取当前分支名
git branch --show-current

# 2. 检查是否有未提交的更改
git status --porcelain

# 3. 如有未提交更改，先询问用户是否提交
# 用户确认后：git add -A && git commit -m "chore: save work before branch rename"

# 4. 重命名分支
git branch -m <new-branch-name>

# 5. 输出确认信息
```

## 注意事项

- 如果当前在 main/master 分支，会提示用户确认
- 如果分支已推送到远程，会提示需要手动更新远程分支
- 如果分支名已存在，会自动添加数字后缀（如 feat/login-2）
