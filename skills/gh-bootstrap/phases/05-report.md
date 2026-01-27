# Phase 5: 执行报告与审查

生成执行结果报告，**让用户审查生成的文件**，提供后续建议和操作指引。

## ⚠️ CRITICAL: 必须包含审查环节

**在完成文件生成后，必须让用户审查关键文件！**

用户需要确认：
- 工作流配置是否正确（版本号、命令、触发条件）
- 变量是否已正确替换（无遗留的 `{{placeholder}}`）
- GitHub 信息是否正确（badges URL、仓库链接）
- 组件特定配置是否符合预期

## Objective

- 汇总执行结果
- **展示关键文件内容供用户审查**
- **询问用户是否需要修改**
- 生成可读报告
- 提供后续建议
- 输出操作指引

## Prerequisites

- Phase 4 执行结果

## Execution Steps

### Step 1: 汇总执行结果

```
[TASK]
收集 Phase 4 的执行结果

[INPUT]
- 创建的文件列表
- 跳过的文件列表
- 备份的文件列表
- 错误信息（如有）

[OUTPUT]
{
  "summary": {
    "total": 10,
    "created": 6,
    "skipped": 2,
    "backed_up": 2,
    "failed": 0
  },
  "files": {
    "created": [...],
    "skipped": [...],
    "backed_up": [...]
  }
}
```

### Step 2: 生成报告

```
[TASK]
格式化执行报告

[OUTPUT FORMAT]
## 执行报告

### 执行摘要

| 操作 | 数量 |
|------|------|
| 创建 | {created} |
| 跳过 | {skipped} |
| 备份 | {backed_up} |
| 失败 | {failed} |

### 创建的文件

✅ .github/workflows/ci.yml
✅ .github/ISSUE_TEMPLATE/bug_report.md
✅ .github/ISSUE_TEMPLATE/feature_request.md
✅ .github/PULL_REQUEST_TEMPLATE.md
✅ .github/dependabot.yml
✅ .github/labels.yml

### 跳过的文件

⏭️ README.md (已存在)
⏭️ LICENSE (已存在)

### 备份的文件

📦 .gitignore → .gitignore.bak
```

### Step 3: 用户审查环节 [MANDATORY]

```
[TASK]
展示关键文件内容，让用户审查并确认

[CRITICAL FILES TO REVIEW]
按优先级展示以下文件（如果生成了的话）：

1. **CI 工作流** (.github/workflows/ci.yml)
   - 检查 Node/Python 版本是否正确
   - 检查测试命令是否与项目一致
   - 检查触发条件是否合适

2. **README.md**
   - 检查 badges URL 是否正确 (owner/repo)
   - 检查项目描述是否准确
   - 检查安装/使用说明是否正确

3. **FUNDING.yml** (如果生成)
   - 检查赞助平台用户名是否正确

4. **dependabot.yml**
   - 检查包管理器类型是否正确
   - 检查更新频率是否合适

[OUTPUT FORMAT]
## 📋 请审查生成的文件

以下是关键配置文件，请确认内容是否正确：

### 1. CI 工作流 (.github/workflows/ci.yml)

\`\`\`yaml
{ci.yml 内容}
\`\`\`

**请确认：**
- [ ] Node.js 版本 `{version}` 是否正确？
- [ ] 测试命令 `npm test` 是否与项目一致？
- [ ] 触发分支 `main` 是否正确？

### 2. README.md (关键部分)

\`\`\`markdown
{README badges 和项目信息部分}
\`\`\`

**请确认：**
- [ ] 仓库链接 `github.com/{owner}/{repo}` 是否正确？
- [ ] 项目描述是否准确？

---

[TOOL CALL]
AskUserQuestion({
  "question": "请审查上述生成的文件内容。\n\n如果发现问题，请告诉我需要修改的地方。",
  "header": "审查确认",
  "options": [
    {
      "label": "✅ 全部正确",
      "description": "文件内容无误，可以完成"
    },
    {
      "label": "⚠️ 需要修改",
      "description": "我发现了一些问题需要修正"
    },
    {
      "label": "🔍 查看更多文件",
      "description": "我想查看其他生成的文件"
    }
  ],
  "multiSelect": false
})

[ON "需要修改"]
1. 询问用户具体需要修改什么
2. 执行修改
3. 重新展示修改后的内容
4. 再次询问确认

[ON "查看更多文件"]
展示其他生成的文件内容，然后再次询问确认
```

### Step 4: 后续建议

```
[TASK]
根据配置生成后续操作建议

[SUGGESTIONS BY COMPONENT]

**CI/CD 工作流**:
- 检查 `.github/workflows/ci.yml` 中的 Node.js 版本是否正确
- 确认测试命令 `npm test` 与项目实际配置一致
- 如需添加部署步骤，参考 GitHub Actions 文档

**Issue 模板**:
- 可根据项目需求自定义模板内容
- 添加更多模板类型：`docs`, `question`, `security`

**Dependabot**:
- 首次运行后会自动创建依赖更新 PR
- 可在 GitHub 仓库设置中调整更新频率

**Labels**:
- 运行 `gh label sync` 同步标签到仓库
- 或手动在 GitHub 仓库设置中导入

[OUTPUT FORMAT]
### 后续建议

1. **验证 CI 工作流**
   - 推送代码后检查 Actions 是否正常运行
   - 确认测试命令与项目配置一致

2. **自定义模板**
   - Issue 模板可根据项目需求调整
   - PR 模板可添加更多检查项

3. **同步标签**
   ```bash
   gh label sync --force
   ```

4. **启用 Dependabot**
   - 在仓库 Settings → Security → Dependabot 中启用
```

### Step 5: 输出最终报告

```
[TASK]
向用户展示完整报告

[ACTIONS]
1. 输出执行摘要
2. 列出所有文件操作
3. 展示后续建议
4. 提供相关文档链接

[DISPLAY FORMAT]
---
## ✅ gh-bootstrap 执行完成

{执行摘要}

{文件操作列表}

{后续建议}

### 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Issue 模板文档](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
- [Dependabot 文档](https://docs.github.com/en/code-security/dependabot)
---
```

## Output

- **Format**: Markdown 报告（直接输出到用户）
- **Usage**: 用户参考执行结果和后续操作

## Quality Checklist

- [ ] 执行结果已汇总
- [ ] 报告格式清晰
- [ ] 后续建议实用
- [ ] 文档链接有效

## Completion

Phase 5 完成后，整个 `/gh:bootstrap` 流程结束。用户可根据报告进行后续操作。
