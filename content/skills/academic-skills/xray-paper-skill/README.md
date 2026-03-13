# xray-paper-skill

`xray-paper-skill` 是一个用于“论文解构”而不是“论文复述”的 Claude Code skill。它会把论文拆成问题定义、核心洞见、创新增量、隐含假设、未解问题，以及一眼能懂的 napkin formula / ASCII logic flow。

## 适用场景

- 读一篇论文，但不想只看摘要复述
- 提炼论文的核心贡献、关键机制、局限和边界条件
- 用 reviewer 视角快速判断这篇 paper 靠什么成立
- 从本地论文文件、网页链接、arXiv / alphaxiv 页面或粘贴文本中提取逻辑模型

## 输入支持

- 本地 `.pdf`
- 本地 `.txt` / `.md` / `.org`
- 网页 URL、`arXiv abs` 页面、`alphaxiv` 页面
- 直接粘贴论文正文、摘要或长段落

当前不支持把**远程 PDF URL**当作可直接解析输入。遇到这种情况，skill 会要求提供本地 PDF 或粘贴文本。

## 调用示例

```text
/xray-paper-skill ./papers/mamba.pdf
/xray-paper-skill https://arxiv.org/abs/2401.12345
/xray-paper-skill ./papers/mamba.pdf --save ~/Documents/notes/
```

也可以直接在聊天里贴论文片段，然后让 skill 做 reviewer-style x-ray analysis。

## 输出特点

- 默认直接在对话里输出，不自动写文件
- 用户显式传 `--save PATH` 时，才会写出 Org 报告
- 如果用户要求“总结”，会先给 1-2 句 summary，再继续完整 x-ray 结构

固定输出骨架：

- `Problem`
- `Insight`
- `Delta`
- `Critique`
- `Logic Flow`
- `Napkin Formula`
- `Napkin Sketch`

## 资源文件

- `resources/ANALYSIS_FRAMEWORK.md`：去噪 -> 提取 -> 批判 的分析框架
- `resources/TEMPLATE.org`：保存为 Org 文件时使用的模板
- `scripts/xray_io.py`：本地 PDF 提取与保存路径解析
