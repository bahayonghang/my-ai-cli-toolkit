# Phase 3: 冲突检测

检测现有配置与目标配置的冲突，制定处理策略。

## 📋 参考文档

- **[specs/execution-rules.md](../specs/execution-rules.md)** - 备份和文件操作规则

## Objective

- 扫描目标文件是否已存在
- 识别配置冲突类型
- 制定冲突处理策略
- 获取用户确认

## Prerequisites

- Phase 2 配置 JSON
- 已启用的组件列表

---

## Execution Steps

### Step 1: 扫描目标文件

```
[ROLE]
文件扫描器

[TASK]
检查所有目标文件是否已存在

[ACTIONS]
1. 根据启用的组件，列出所有目标文件路径
2. 使用 Glob 检查每个文件是否存在
3. 对于存在的文件，读取内容摘要

[TARGET FILES BY COMPONENT]
- readme: README.md
- license: LICENSE
- gitignore: .gitignore
- ci-workflow: .github/workflows/ci.yml
- issue-templates: .github/ISSUE_TEMPLATE/*.md
- pr-template: .github/PULL_REQUEST_TEMPLATE.md
- dependabot: .github/dependabot.yml
- labels: .github/labels.yml
- codeowners: .github/CODEOWNERS
- funding: .github/FUNDING.yml

[TOOL CALL]
Glob: pattern=".github/**/*"
Glob: pattern="README*"
Glob: pattern="LICENSE*"

[OUTPUT]
{
  "existing": ["README.md", ".github/workflows/ci.yml"],
  "new": [".github/ISSUE_TEMPLATE/bug_report.md", ...]
}
```

### Step 2: 分析冲突类型

```
[ROLE]
冲突分析器

[TASK]
对每个已存在的文件分析冲突类型

[CONFLICT TYPES]
| 类型 | 说明 | 默认策略 |
|------|------|----------|
| IDENTICAL | 内容完全相同 | skip |
| SIMILAR | 结构相似，可合并 | backup |
| DIFFERENT | 内容不同 | backup |
| CUSTOM | 用户自定义内容 | skip |

[ACTIONS]
1. 读取现有文件内容
2. 与模板内容比较（如可能）
3. 判断冲突类型
4. 记录文件大小和修改时间

[TOOL CALL]
Read: README.md (如存在)
Read: .github/workflows/ci.yml (如存在)

[OUTPUT]
{
  "conflicts": [
    {
      "file": "README.md",
      "type": "DIFFERENT",
      "existingSize": 1024,
      "recommendation": "backup"
    },
    {
      "file": ".github/workflows/ci.yml",
      "type": "SIMILAR",
      "recommendation": "backup"
    }
  ]
}
```

### Step 3: 制定处理策略

```
[ROLE]
策略制定器

[TASK]
为每个冲突制定处理策略

[STRATEGIES]
| 策略 | 说明 | 适用场景 |
|------|------|----------|
| skip | 跳过，保留现有文件 | IDENTICAL, CUSTOM |
| overwrite | 覆盖现有文件 | 用户明确要求 |
| backup | 备份后覆盖（.bak 后缀） | DIFFERENT, SIMILAR |
| rename | 重命名新文件 | 特殊情况 |

[ACTIONS]
1. 根据冲突类型应用默认策略
2. 考虑文件重要性调整策略
3. 生成策略列表

[OUTPUT]
{
  "strategies": [
    {"file": "README.md", "strategy": "backup", "reason": "内容不同"},
    {"file": ".github/workflows/ci.yml", "strategy": "skip", "reason": "已有 CI 配置"}
  ]
}
```

### Step 4: 用户确认

```
[ROLE]
交互协调器

[TASK]
展示冲突列表，获取用户确认

[ACTIONS]
1. 格式化冲突报告
2. 展示每个冲突的推荐策略
3. 询问用户确认或修改

[DISPLAY FORMAT]
## 检测到文件冲突

| 文件 | 冲突类型 | 推荐策略 |
|------|----------|----------|
| README.md | 内容不同 | 备份后覆盖 |
| .github/workflows/ci.yml | 已存在 | 跳过 |

[TOOL CALL]
AskUserQuestion({
  "question": "如何处理文件冲突？",
  "header": "冲突处理",
  "options": [
    {"label": "使用推荐策略", "description": "按上述推荐方式处理"},
    {"label": "全部跳过", "description": "保留所有现有文件"},
    {"label": "全部覆盖", "description": "覆盖所有冲突文件（会备份）"},
    {"label": "逐个确认", "description": "为每个文件单独选择"}
  ],
  "multiSelect": false
})

[ON "逐个确认"]
对每个冲突文件单独询问：
AskUserQuestion({
  "question": "如何处理 {filename}？",
  "header": "文件处理",
  "options": [
    {"label": "跳过", "description": "保留现有文件"},
    {"label": "备份后覆盖", "description": "备份为 .bak 后覆盖"},
    {"label": "直接覆盖", "description": "不备份直接覆盖"}
  ],
  "multiSelect": false
})
```

### Step 5: 生成执行计划

```
[ROLE]
计划生成器

[TASK]
生成最终执行计划

[ACTIONS]
1. 汇总所有文件操作
2. 按操作类型分组
3. 生成摘要统计

[OUTPUT FORMAT]
{
  "plan": {
    "create": [
      ".github/ISSUE_TEMPLATE/bug_report.md",
      ".github/ISSUE_TEMPLATE/feature_request.md",
      ".github/PULL_REQUEST_TEMPLATE.md",
      ".github/dependabot.yml"
    ],
    "overwrite": [],
    "backup": [
      {"file": "README.md", "backupTo": "README.md.bak"}
    ],
    "skip": [
      ".github/workflows/ci.yml"
    ]
  },
  "summary": {
    "totalFiles": 10,
    "create": 6,
    "overwrite": 0,
    "backup": 2,
    "skip": 2
  }
}
```

---

## Output

- **Format**: 执行计划 JSON
- **Usage**: 传递给 Phase 4 执行

## Quality Checklist

- [ ] 所有目标文件已扫描
- [ ] 冲突类型已识别
- [ ] 处理策略已制定
- [ ] 用户已确认
- [ ] 执行计划已生成

## Next Phase

冲突处理策略确认后，进入 [Phase 4: 执行](04-execution.md)，执行文件生成和部署。
