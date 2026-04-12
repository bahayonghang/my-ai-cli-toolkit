---
name: paper-replication
description: "深度学习论文复现技能。将学术论文中的模型架构转化为工业级 PyTorch 代码，包含论文解构、架构可视化(Mermaid)、代码实现和模块文档生成。当用户提供深度学习论文(PDF/文本)需要复现、实现模型、理解网络架构时使用。触发场景：帮我复现这篇论文、论文复现、实现这个模型、replicate this paper、reproduce this paper、implement this architecture、把论文里的网络写成代码。即使用户没有明确说复现，只要提供了深度学习论文并希望得到代码实现，也应触发此技能。"
version: "1.0.0"
argument-hint: [paper-pdf-or-text]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
category: docs-writing-publishing
tags: [paper, deep-learning, pytorch, replication, research, model-implementation, transformer, cnn]
metadata:
  category: docs-writing-publishing
  tags: [paper, deep-learning, pytorch, replication, research, model-implementation, transformer, cnn]
---

# Deep Learning Paper Replication Skill

读取深度学习论文（PDF 或文本），将论文中的数学描述、网络结构和实现细节转化为可运行、可验证、可维护的 PyTorch 代码与配套文档。

## Core Objective

- 先理解论文的核心问题、创新点、数学公式和超参数。
- 再用 Mermaid 可视化关键数据流和张量形状。
- 最后输出工业级 PyTorch 实现，并在需要时生成模块级技术文档。

## Workflow

根据用户需求和论文复杂度，选择合适的执行模式：

- **完整模式**（默认）：执行全部 4 个 Phase，适用于复杂模型的完整复现。
- **快速模式**：用户明确只需要代码时，跳过 Phase 4（文档生成）。
- **代码优先模式**：用户已理解论文时，简化 Phase 1 的解构，重点执行 Phase 3。

对于简单模型（如 MLP、单层网络），自动简化：

- Phase 2 的 Mermaid 图使用简化版本。
- Phase 4 的文档结构按需裁剪，不强制生成所有子目录。

### Phase 1: 论文审计与架构解构

输出最小但完整的解构结果：

- **论文概述**：一句话问题定义 + 2-4 条核心创新。
- **数学原理**：核心公式、符号说明、Loss Function 分析。
- **架构细节**：层数、头数、维度、卷积参数、dropout、激活函数、归一化方式。
- **实现缺口**：把论文未明确说明的实现细节单独标注，不要伪装成论文原文。

推荐输出骨架：

```markdown
## 论文概述
**问题 (Problem)**: ...

**核心创新 (Contribution)**:
1. ...
2. ...

## 数学原理
### 核心公式
$$ ... $$

### Loss Function
$$ ... $$

## 架构细节
| 组件 | 参数 | 值 | 来源 |
|------|------|-----|------|
```

### Phase 2: 架构流程可视化

使用 Mermaid 展示论文的数据流，至少覆盖：

- 输入和输出节点。
- Backbone / Encoder / Decoder / Neck / Head / Loss 中的关键路径。
- 关键节点的 Input/Output Tensor Shape，统一使用 `[B, C, H, W]`、`[B, N, D]` 等标准符号。
- 深层网络用模块级粒度，不机械展开所有层。

颜色规范：

- Blue `#e1f5fe`：输入/输出节点。
- Orange `#fff3e0`：核心处理模块。
- Green `#e8f5e9`：特征提取或缓存模块。
- Pink `#fce4ec`：注意力机制。
- Purple `#f3e5f5`：Loss 或聚合节点。

简单模型可使用简化图；复杂模型优先画模块关系图，再补张量形状变化图。

### Phase 3: PyTorch 实现

实现代码时遵循以下要点：

- 继承 `torch.nn.Module`，并给核心类加清晰 docstring。
- 严格使用类型提示。
- 在关键运算后显式标注张量形状变化。
- 把复杂子模块拆分为独立 class 或 `modules/` 子文件。
- 提供 `_init_weights` 或等价初始化逻辑，并注明来源。
- 提供 `set_seed` 或等价可复现性配置。
- 在文件尾部附带最小可运行验证代码：前向传播、shape 检查、参数量检查、梯度流检查。
- 对于论文未说明的超参数，显式标注 `Paper did not specify`，同时写明推荐值、参考来源、备选值和潜在影响。

完整编码规范、验证模板和 `Paper did not specify` 协议见
`references/CODING_STANDARD.md`。

### Phase 4: 模块文档生成

为每个核心模块生成技术文档，包含：

- 概述：功能、架构位置、输入输出规格。
- 数学原理：公式、符号说明、必要时给推导。
- 数据流图：Mermaid 流程图 + 张量形状变化。
- 实现细节：关键代码、超参数、设计决策。
- 使用示例：调用方式和输入输出示例。
- 注意事项：常见问题、性能考量、与论文差异。

详细文档规范和 Mermaid 模板见 `references/DOCUMENTATION_GUIDE.md`。

## Tensor Shape Notation Standard

整个复现过程统一使用以下维度符号：

| 符号 | 含义 |
|------|------|
| `B` | Batch size |
| `C` | Channels |
| `H`, `W` | Height / Width |
| `T` | Time or sequence length |
| `D` | Feature dimension |
| `N` | Number of elements / tokens |
| `E` | Embedding dimension |
| `K` | Kernel size |

注释格式统一为：

```python
# x: [B, C, H, W] <- Input tensor
# x: [B, 64, H//2, W//2] <- Conv2d(C, 64, k=3, s=2, p=1)
```

## Output Structure

根据模型复杂度自适应调整输出结构：

**简单模型**（单文件即可表达，如 MLP、简单 CNN）：

```text
output/
├── model.py
└── README.md
```

**中等模型**（需要子模块拆分）：

```text
output/
├── model.py
├── modules/
└── README.md
```

**复杂模型**（完整复现，如 Transformer、检测网络）：

```text
output/
├── README.md
├── docs/
├── model.py
├── modules/
├── config.py
└── requirements.txt
```

如果论文存在训练、推理、配置三条明显边界，可以进一步拆出 `train.py`、`infer.py`、`configs/`，但仅在复杂度确实需要时这样做。

## Reading Strategy

- 先读主论文，再按需读 Appendix 或 Supplementary。
- 先以文字描述、公式和伪代码为准，再用图表做交叉验证。
- 如果官方代码存在，优先用官方代码校正文中歧义，并在注释中说明差异。
- 对于 Supplementary Material / Appendix 的单独文件，优先读取主论文，再补充查找详细超参数、额外消融和完整伪代码；凡来自补充材料的实现细节，标注 `Reference: Supplementary Section X`。

更多 PDF 阅读要点和常见陷阱见 `references/COMMON_PITFALLS.md`。

## Constraints

### Tool Stack

- Python 3.10+
- PyTorch 2.0+
- Mermaid
- `einops`（可选）
- `timm`（可选）

### Language Rules

- 分析与解释使用简体中文。
- 代码注释使用英文。
- 变量命名使用英文并遵循 PEP 8。

## Verification Checklist

在结束前确认：

### Phase 1

- [ ] 核心问题和创新点已明确。
- [ ] 关键公式、损失函数和符号说明已提取。
- [ ] 超参数配置完整，未指定项已显式标注。

### Phase 2

- [ ] Mermaid 图覆盖主要组件。
- [ ] 关键节点标注了 Tensor Shape。
- [ ] 深层网络使用了合适粒度。

### Phase 3

- [ ] 实现继承 `nn.Module`。
- [ ] 类型提示完整。
- [ ] 关键层后有维度注释。
- [ ] 子模块边界清晰。
- [ ] 初始化、随机种子和验证代码齐全。

### Phase 4（如启用）

- [ ] 每个核心模块有对应文档。
- [ ] 文档覆盖概述、数学、流程图、实现、示例、注意事项。
- [ ] 文档结构与模型复杂度相匹配，不过度生成。

### Runtime Validation

- [ ] 随机 Tensor 前向传播正常。
- [ ] 输出 Shape 与预期一致。
- [ ] 参数量与论文或官方实现基本一致（如可比）。
- [ ] 梯度流检查通过。
- [ ] 已排查关键实现陷阱和框架差异。

## References

- `references/CODING_STANDARD.md`
  何时读取：开始写代码前，或需要补全验证模板时。
- `references/DOCUMENTATION_GUIDE.md`
  何时读取：需要生成 `docs/`、模块文档或 Mermaid 模板时。
- `references/COMMON_PITFALLS.md`
  何时读取：读取 PDF、比对论文与代码、处理框架差异、查缺失细节时。
