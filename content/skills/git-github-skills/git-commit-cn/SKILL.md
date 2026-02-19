---
name: git-commit-cn
description: 生成符合约定式提交规范的中文 Git 提交信息。当用户请求创建 Git 提交、生成 commit 信息、或提及"提交代码"、"git commit"、"中文提交"时使用。自动分析代码变更,生成规范的中文提交信息,包含正确的类型前缀(feat/fix/docs等)和清晰的描述。
category: development-tools
tags: [git, commit-message, conventional-commits, chinese]
---

# Git Commit 中文提交信息生成

自动生成符合约定式提交(Conventional Commits)规范的中文 Git 提交信息。

## 默认行为

**必须遵守以下规则**：

1. ✅ **使用 emoji**：每个提交类型必须包含对应的 emoji 图标
2. ✅ **拆分提交**：将不同类型或不同模块的变更拆分为多个独立提交
3. ✅ **自动推送**：所有提交完成后自动推送到远程仓库
4. ❌ **禁用 Co-Authored-By**：不添加 `Co-Authored-By: Claude Sonnet 4.5` 署名

## 核心工作流程

### 1. 分析代码变更

首先检查代码变更情况:

```bash
# 查看未暂存的变更
git diff

# 查看已暂存的变更
git diff --staged

# 查看状态
git status
```

### 2. 确定提交类型和 Emoji

根据变更内容确定提交类型和对应 emoji（**必须使用**）:

- **feat**: ✨ 新增功能或特性
- **fix**: 🐛 修复 bug 或错误
- **docs**: 📝 仅文档变更
- **style**: 💄 代码格式调整(不影响功能)
- **refactor**: ♻️ 代码重构
- **perf**: ⚡ 性能优化
- **test**: ✅ 测试相关
- **build**: 📦 构建系统或依赖变更
- **ci**: 👷 CI/CD 配置变更
- **chore**: 🔧 其他杂项变更

详细说明和示例见 [references/commit-types.md](references/commit-types.md)

### 3. 生成提交信息

**格式要求**:

```
<类型>: <emoji> <简短描述>

[可选的详细描述]
```

**简短描述规范**:
- 使用动词开头: 添加、修复、更新、删除、优化、重构
- 不超过 50 个字符
- 描述做了什么,不是为什么
- 结尾不使用标点符号

**示例**:

单行提交:
```
feat: ✨ 添加用户头像上传功能
```

多行提交:
```
feat: ✨ 添加用户头像上传功能

支持 JPG/PNG/WebP 格式,最大 5MB
自动生成 200x200 和 48x48 缩略图
```

### 4. 拆分并执行提交

**默认必须拆分提交**：将不同类型或不同模块的变更分开提交。

使用 HEREDOC 格式提交,确保格式正确:

```bash
git commit -m "$(cat <<'EOF'
feat: ✨ 添加用户管理功能

实现用户列表、添加、编辑、删除功能
集成角色权限管理
EOF
)"
```

### 5. 推送到远程仓库

**所有提交完成后，自动推送到远程仓库**（默认行为）:

```bash
# 检查当前分支是否有跟踪的远程分支
git rev-parse --abbrev-ref --symbolic-full-name @{u}

# 推送到远程
git push
```

**推送前安全检查**:

1. **确认远程分支存在**: 如果当前分支没有跟踪的远程分支，使用 `git push -u origin <branch>` 设置上游
2. **检查是否有冲突**: 如果推送失败（远程有新提交），提示用户先拉取合并
3. **保护主分支**: 如果当前分支是 `main` 或 `master`，推送前需要用户确认

```bash
# 首次推送新分支（设置上游跟踪）
git push -u origin $(git branch --show-current)

# 后续推送
git push
```

**推送失败处理**:

```bash
# 如果远程有新提交导致推送失败
# 提示: "远程分支有更新，建议先执行 git pull --rebase 后再推送"
git pull --rebase && git push
```

## 最佳实践

### 变更拆分（默认行为）

**必须将不同类型或不同模块的变更拆分为独立提交**，每个提交只做一件事:

✅ 好的做法:
```
git add src/auth/
git commit -m "feat: ✨ 添加 OAuth2 登录支持"

git add docs/api.md
git commit -m "docs: 📝 更新认证 API 文档"
```

❌ 不好的做法:
```
git add .
git commit -m "feat: ✨ 添加登录功能和更新文档"
```

### 带作用域的提交

对于大型项目,使用作用域标识变更范围:

```
feat(auth): ✨ 添加双因素认证
fix(ui): 🐛 修复移动端菜单样式
docs(api): 📝 更新用户 API 文档
```

### 破坏性变更标记

如果变更不兼容旧版本,使用 BREAKING CHANGE:

```bash
git commit -m "$(cat <<'EOF'
feat: ✨ 重构用户认证 API

从 Session 改为 JWT Token 认证

BREAKING CHANGE: 旧的 /api/login 接口已移除,
请使用新的 /api/auth/token 接口
EOF
)"
```

## 常见场景

### 新功能开发

```bash
# 添加并提交
git add src/features/upload/
git commit -m "feat: ✨ 添加文件批量上传功能"
```

### Bug 修复

```bash
git add src/components/LoginForm.tsx
git commit -m "fix: 🐛 修复登录表单验证码刷新问题"
```

### 多文件变更（必须拆分）

```bash
# 功能实现
git add src/
git commit -m "$(cat <<'EOF'
feat: ✨ 添加用户积分系统

实现积分获取和消费逻辑
添加积分历史记录
EOF
)"

# 测试代码
git add tests/
git commit -m "test: ✅ 添加积分系统单元测试"

# 文档更新
git add docs/
git commit -m "docs: 📝 更新积分系统 API 文档"
```

### 依赖更新

```bash
git add package.json package-lock.json
git commit -m "build: 📦 升级 React 到 18.3.0"
```

## 注意事项

1. **提交前检查**: 使用 `git status` 和 `git diff` 确认变更内容
2. **必须拆分提交**: 不同类型或不同模块的变更必须分开提交（默认行为）
3. **必须使用 emoji**: 每个提交信息必须包含对应的 emoji 图标（默认行为）
4. **禁用 Co-Author**: 不添加 `Co-Authored-By` 署名（默认行为）
5. **自动推送**: 所有提交完成后自动推送到远程仓库（默认行为）
6. **保护主分支**: 推送到 `main`/`master` 分支前需要用户确认
7. **清晰描述**: 让其他人看到 commit 信息就知道做了什么
8. **避免通用描述**: 不使用"修复 bug"、"更新代码"等模糊描述
9. **使用 HEREDOC**: 多行提交信息使用 HEREDOC 格式确保正确

## 参考资源

- [references/commit-types.md](references/commit-types.md) - 完整的提交类型和示例
