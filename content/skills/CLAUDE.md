# Skills 目录说明

本目录包含所有 Claude Code 技能定义，按分类组织在子文件夹中。

## 目录结构

```
skills/
├── CLAUDE.md              # 本说明文档
├── check.py               # SKILL.md frontmatter 完整性检查工具
├── default.toml            # 默认安装分类配置
├── README.md              # 技能列表概览
├── academic-skills/       # 🎓 学术写作与研究
├── ai-llm-skills/        # 🤖 AI 与 LLM 集成
├── development-skills/    # 💻 开发框架与语言
├── devtools-skills/       # 🔧 开发工具与工作流
├── diagram-skills/        # 📊 图表生成
├── document-skills/       # 📝 文档处理与写作
├── git-github-skills/     # 🐙 Git 与 GitHub 工具
├── media-skills/          # 🎨 媒体与视觉内容
├── obsidian-skills/       # 🗃️ Obsidian 知识管理
└── skill-meta-skills/     # 🧩 技能创建与管理
    └── <skill-name>/      # 各技能目录
        ├── SKILL.md       # 技能定义文件（必需）
        ├── config/        # 配置模板（可选）
        ├── tips/          # 使用提示（可选）
        ├── references/    # 参考文档（可选）
        ├── scripts/       # 辅助脚本（可选）
        └── cookbook/       # 代码示例（可选）
```

## default.toml

`default.toml` 控制 `install-all` 命令默认安装哪些分类：

```toml
categories = [
    "skill-meta-skills",
    "development-skills",
    "devtools-skills",
    "git-github-skills",
]
```

## SKILL.md 格式规范

每个技能必须包含 `SKILL.md` 文件，使用 YAML frontmatter 定义元数据：

```yaml
---
name: skill-name                    # 技能名称（必需）
description: 技能的简短描述          # 技能描述（必需）
category: development               # 技能分类（必需）
tags: [tag1, tag2, tag3]           # 标签列表（必需）
license: MIT                        # 许可证（可选）
---

# 技能标题

详细的技能说明和使用文档...
```

### 必需字段

| 字段 | 说明 |
|------|------|
| `name` | 技能的唯一标识符，应与目录名一致 |
| `description` | 简短描述，用于技能列表展示和触发条件说明 |
| `category` | 技能分类，用于组织和筛选 |
| `tags` | 标签数组，用于搜索和关联 |

### 常用 Category 值

| Category | 说明 |
|----------|------|
| `document-processing` | 文档处理（docx, xlsx, pptx, pdf） |
| `development` | 开发工具和最佳实践 |
| `design` | 设计和可视化 |
| `research` | 研究和信息检索 |
| `documentation` | 技术文档撰写 |
| `academic` | 学术写作 |
| `ai-orchestration` | AI 代理编排 |
| `development-tools` | 开发辅助工具 |

## check.py 使用说明

`check.py` 用于检查所有技能的 SKILL.md 文件是否包含完整的 frontmatter 元数据。

### 运行方式

```bash
# 在 skills 目录下运行
cd skills
python check.py

# 或从项目根目录运行
python skills/check.py
```

### 输出示例

**所有技能完整时：**
```
================================================================================
Skills Metadata 完整性检查报告
================================================================================

📊 总计: 46 个 skills
✅ 完整: 46 个
❌ 不完整: 0 个

🎉 所有 skills 的 metadata 都完整！
```

**存在不完整技能时：**
```
================================================================================
Skills Metadata 完整性检查报告
================================================================================

📊 总计: 46 个 skills
✅ 完整: 42 个
❌ 不完整: 4 个

================================================================================
❌ 缺少 category 或 tags 的 Skills:
================================================================================

📁 docx
   ❌ 缺少 category 字段
   ❌ 缺少 tags 字段
```

### 检查项目

- `has_skill_md`: 是否存在 SKILL.md 文件
- `has_frontmatter`: 是否包含有效的 YAML frontmatter
- `has_category`: 是否定义了 category 字段
- `has_tags`: 是否定义了 tags 字段

## 添加新技能

1. 创建技能目录：
   ```bash
   mkdir skills/my-new-skill
   ```

2. 创建 SKILL.md 文件，包含完整的 frontmatter：
   ```yaml
   ---
   name: my-new-skill
   description: 技能的简短描述
   category: development
   tags: [relevant, tags, here]
   ---

   # My New Skill

   详细说明...
   ```

3. 运行检查确保元数据完整：
   ```bash
   python skills/check.py
   ```

4. 安装测试：
   ```bash
   just mcs
   ```
