# Phase 4: 执行

根据执行计划下载模板并**直接复制**生成配置文件。

## 📋 强制参考文档

执行前必须读取：
- **[specs/execution-rules.md](../specs/execution-rules.md)** - 执行规则和约束
- **[specs/template-catalog.md](../specs/template-catalog.md)** - 模板路径映射

## Objective

- 按需下载推荐模板仓库
- 读取模板文件并直接复制
- 仅替换变量占位符
- 部署到目标位置

## Prerequisites

- Phase 2 配置 JSON
- Phase 3 执行计划

---

## Execution Steps

### Step 1: 准备工作目录

```
[TASK]
确保目标目录结构存在

[ACTIONS]
1. 创建 .github/ 目录（如不存在）
2. 创建 .github/workflows/ 目录
3. 创建 .github/ISSUE_TEMPLATE/ 目录
4. 创建临时缓存目录 .gh-bootstrap-cache/

[TOOL CALL]
Bash: mkdir -p .github/workflows .github/ISSUE_TEMPLATE .gh-bootstrap-cache
```

### Step 2: 执行备份

```
[TASK]
对需要备份的文件执行备份操作

[ACTIONS]
1. 遍历 plan.backup 列表
2. 复制文件到 .bak 后缀
3. 记录备份结果

[TOOL CALL]
Bash: cp README.md README.md.bak

[OUTPUT]
{
  "backups": [
    {"original": "README.md", "backup": "README.md.bak", "status": "success"}
  ]
}
```

### Step 3: 下载模板 [MANDATORY]

```
[TASK]
根据组件需求从 template-catalog.md 下载对应仓库

[PREREQUISITE]
必须先 Read: specs/template-catalog.md

[ACTIONS]
1. 读取 template-catalog.md 获取精确路径
2. 遍历需要的组件列表
3. git clone 到 .gh-bootstrap-cache/{component}/
4. 记录每个组件的必读文件路径

[TOOL CALL]
Bash: git clone --depth 1 https://github.com/{owner}/{repo} .gh-bootstrap-cache/{component}

[OUTPUT]
{
  "downloads": [
    {
      "component": "ci-workflow",
      "repo": "actions/starter-workflows",
      "files_to_read": ["ci/node.js.yml"],
      "status": "success"
    }
  ]
}
```

### Step 4: 读取模板并直接复制 [MANDATORY]

```
[TASK]
读取下载的模板文件，直接复制内容（仅替换变量）

[RULE REFERENCE]
详见 specs/execution-rules.md:
- 直接复制规则
- 变量替换规则
- 禁止操作列表

[ACTIONS]
1. 使用 Read 工具读取模板文件
2. 原样复制读取到的内容
3. 仅替换变量占位符
4. 保持所有其他内容不变

[TOOL CALL]
Read: .gh-bootstrap-cache/ci-workflow/ci/node.js.yml
→ 获取完整 YAML 内容
→ 直接复制，仅调整 node-version
→ Write 到 .github/workflows/ci.yml
```

### Step 5: 写入目标文件

```
[TASK]
将生成的配置写入目标位置

[ACTIONS]
1. 使用 Write 工具创建文件
2. 确保文件格式正确（YAML/Markdown）
3. 记录创建的文件

[TOOL CALL]
Write: .github/workflows/ci.yml

[OUTPUT]
{
  "created": [
    ".github/workflows/ci.yml",
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/feature_request.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/dependabot.yml"
  ]
}
```

### Step 6: 验证生成结果

```
[TASK]
验证所有文件已正确生成

[ACTIONS]
1. 检查每个目标文件是否存在
2. 验证文件内容非空
3. 检查 YAML 文件语法
4. 检查变量替换是否完成

[VALIDATION CHECKS]
- 文件存在性检查
- 文件大小 > 0
- 无遗留 {{placeholder}}
- YAML 语法验证（workflows）

[OUTPUT]
{
  "validation": {
    "passed": ["ci.yml", "bug_report.md"],
    "failed": [],
    "warnings": []
  }
}
```

### Step 7: 清理临时目录

```
[TASK]
清理下载的临时文件

[ACTIONS]
1. 删除 .gh-bootstrap-cache/ 目录
2. 确认清理完成

[TOOL CALL]
Bash: rm -rf .gh-bootstrap-cache

[NOTE]
可选步骤，用户可选择保留以供参考
```

### Step 8: 记录执行结果

```
[TASK]
汇总执行结果

[OUTPUT FORMAT]
{
  "execution": {
    "status": "success",
    "files": {
      "created": [...],
      "backed_up": [...],
      "skipped": [],
      "failed": []
    },
    "templates_used": [
      {"component": "ci-workflow", "source": "actions/starter-workflows"}
    ],
    "errors": []
  }
}
```

---

## Error Handling

详见 [specs/execution-rules.md](../specs/execution-rules.md) 的错误处理规则部分。

```
[ON DOWNLOAD ERROR]
1. 记录下载失败的仓库
2. 尝试使用内置默认模板
3. 通知用户哪些组件使用了默认配置

[ON GENERATION ERROR]
1. 记录错误详情
2. 跳过该组件
3. 继续处理其他组件

[ROLLBACK STRATEGY]
- 删除新创建的文件
- 从备份恢复原文件
- 清理临时文件
```

## Output

- **Format**: 执行结果 JSON
- **Usage**: 传递给 Phase 5 生成报告

## Quality Checklist

- [ ] 已读取 specs/template-catalog.md
- [ ] 目录结构已创建
- [ ] 备份已完成
- [ ] 模板已下载
- [ ] 配置已直接复制（非重写）
- [ ] 变量已替换
- [ ] 验证通过
- [ ] 临时文件已清理
- [ ] 结果已记录

## Next Phase

执行完成后，进入 [Phase 5: 报告](05-report.md)，生成执行报告和后续建议。
