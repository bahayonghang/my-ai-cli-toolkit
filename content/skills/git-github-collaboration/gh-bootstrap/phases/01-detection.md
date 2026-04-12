# Phase 1: 智能项目检测

自动扫描项目，识别语言、框架、包管理器和现有 GitHub 配置。

## 📋 参考文档

- **[specs/detection-rules.md](../specs/detection-rules.md)** - 检测规则详细定义

## Objective

- 识别项目主要语言和框架
- 检测包管理器类型
- 扫描现有 GitHub 配置
- 生成检测结果 JSON

## Prerequisites

- 用户在项目根目录执行 `/gh:bootstrap`

---

## Execution Steps

### Step 1: 扫描项目根目录

```
[ROLE]
项目分析器

[TASK]
扫描项目根目录，识别特征文件

[RULE REFERENCE]
详见 specs/detection-rules.md → 语言检测规则

[ACTIONS]
1. 使用 Glob 列出根目录文件
2. 检查特征文件是否存在：
   - package.json, tsconfig.json → Node.js/TypeScript
   - pyproject.toml, requirements.txt → Python
   - Cargo.toml → Rust
   - go.mod → Go
   - pom.xml, build.gradle → Java
3. 记录检测到的特征文件

[TOOL CALL]
Glob: pattern="*.*" (根目录)
Glob: pattern="*.json" (配置文件)

[OUTPUT]
{
  "featureFiles": ["package.json", "tsconfig.json", ...],
  "detectedLanguages": [{"language": "typescript", "confidence": "high"}]
}
```

### Step 2: 检测包管理器

```
[ROLE]
依赖分析器

[TASK]
通过锁文件识别包管理器

[RULE REFERENCE]
详见 specs/detection-rules.md → 包管理器检测规则

[ACTIONS]
1. 检查锁文件存在性：
   - package-lock.json → npm
   - yarn.lock → yarn
   - pnpm-lock.yaml → pnpm
   - bun.lockb → bun
   - poetry.lock → poetry
   - Cargo.lock → cargo
2. 确定包管理器类型

[TOOL CALL]
Glob: pattern="*lock*"
Glob: pattern="*.lock"

[OUTPUT]
{
  "packageManager": "pnpm",
  "lockFile": "pnpm-lock.yaml"
}
```

### Step 3: 检测框架

```
[ROLE]
框架识别器

[TASK]
解析依赖文件识别框架

[RULE REFERENCE]
详见 specs/detection-rules.md → 框架检测规则

[ACTIONS]
1. 读取 package.json 的 dependencies/devDependencies
2. 匹配框架特征：
   - next → Next.js
   - vue → Vue.js
   - react → React
   - express → Express.js
   - fastapi → FastAPI
   - django → Django
3. 检测版本号用于 CI 配置

[TOOL CALL]
Read: package.json (如存在)
Read: pyproject.toml (如存在)

[OUTPUT]
{
  "framework": "next.js",
  "frameworkVersion": "14.0.0",
  "runtimeVersion": "20"
}
```

### Step 4: 扫描 GitHub 配置

```
[ROLE]
配置扫描器

[TASK]
检测 .github/ 目录现有配置

[ACTIONS]
1. 检查 .github/ 目录是否存在
2. 列出 .github/workflows/*.yml
3. 检查 .github/ISSUE_TEMPLATE/
4. 检查 PULL_REQUEST_TEMPLATE.md
5. 检查 dependabot.yml, CODEOWNERS
6. 检查根目录社区文件 (README, LICENSE, CONTRIBUTING)

[TOOL CALL]
Glob: pattern=".github/**/*"
Glob: pattern="README*"
Glob: pattern="LICENSE*"
Glob: pattern="CONTRIBUTING*"

[OUTPUT]
{
  "existingConfigs": {
    "workflows": ["ci.yml"],
    "issueTemplates": ["bug_report.md"],
    "prTemplate": true,
    "dependabot": false,
    "codeowners": false
  },
  "communityFiles": {
    "readme": true,
    "license": "MIT",
    "contributing": false
  }
}
```

### Step 5: 生成检测结果

```
[ROLE]
结果汇总器

[TASK]
汇总检测结果为 JSON 结构

[ACTIONS]
1. 合并所有检测结果
2. 计算置信度
3. 确定需要用户输入的字段
4. 生成最终 JSON

[OUTPUT FORMAT]
{
  "detected": {
    "language": "typescript",
    "languages": ["typescript", "javascript"],
    "framework": "next.js",
    "frameworkVersion": "14.0.0",
    "runtimeVersion": "20",
    "packageManager": "pnpm",
    "monorepo": null,
    "existingConfigs": {
      "workflows": [],
      "issueTemplates": [],
      "prTemplate": false,
      "dependabot": false,
      "codeowners": false
    },
    "communityFiles": {
      "readme": false,
      "license": null,
      "contributing": false
    }
  },
  "confidence": {
    "language": "high",
    "framework": "high",
    "packageManager": "high"
  },
  "needsUserInput": ["projectName", "description", "author", "owner", "repo"]
}
```

---

## Output

- **Format**: JSON 检测结果（内存保持，不写入文件）
- **Usage**: 传递给 Phase 2 作为配置收集的基础

## Quality Checklist

- [ ] 已参考 specs/detection-rules.md
- [ ] 语言检测完成
- [ ] 包管理器识别
- [ ] 框架检测（如适用）
- [ ] 版本号检测
- [ ] GitHub 配置扫描
- [ ] 社区文件扫描
- [ ] 检测结果 JSON 生成

## Next Phase

检测完成后，进入 [Phase 2: 配置收集](02-collection.md)，向用户展示检测结果并收集配置偏好。
