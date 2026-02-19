# Paper Check Skill

学术论文全流程质检工具，支持全局检查和7个部分的专项审查。

## 快速开始

```bash
# 安装到 Claude
./install.sh install paper-check

# 安装到 Codex
./install.sh --target=codex install paper-check
```

## 使用示例

```bash
# 全局检查
codex e -m gemini-2.0-flash-exp \
  "使用 paper-check skill 对我的论文进行全局检查" \
  --attach paper.pdf

# 检查特定部分
codex e -m gemini-2.0-flash-exp \
  "使用 paper-check skill 检查我的摘要部分" \
  --attach paper.pdf
```

## 功能模块

- **全局检查**: 逻辑流、术语一致性、时态、人称
- **标题校对**: 准确性、简洁性、关键词优化
- **摘要校对**: 四要素、数据支持、一致性、独立性
- **引言校对**: 漏斗结构、研究空白、研究问题
- **方法校对**: 可复现性、理由阐述、伦理声明
- **结果校对**: 纯粹性、图表引用、数据描述
- **讨论校对**: 解释深度、对比质量、局限性
- **结论校对**: 回应问题、总结方式、未来展望

## 详细文档

查看 [SKILL.md](./SKILL.md) 了解完整使用指南。
