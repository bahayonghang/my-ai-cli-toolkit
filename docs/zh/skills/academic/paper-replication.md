# 论文复现 (Paper Replication)

深度学习论文复现技能，将学术论文转化为工业级 PyTorch 代码。

## 概述

该技能使 Claude 能够阅读深度学习论文（PDF 或文本），进行深度解构，并输出可运行的、符合工业标准的 PyTorch 网络模型代码。

## 触发词

- "帮我复现这篇论文"
- "论文复现"
- "实现这个模型"
- 当用户提供深度学习论文需要转化为 PyTorch 代码时

## 工作流程

该技能遵循严格的三阶段工作流：

### 阶段一：论文审计与架构解构

1. **核心摘要** - 问题陈述和关键贡献
2. **数学原理审计** - 提取 LaTeX 公式、解释符号、分析损失函数
3. **架构细节** - 记录所有超参数及其来源

### 阶段二：架构流程可视化

生成 Mermaid 流程图，包含：
- 使用标准符号标注输入/输出张量形状（`[B, C, H, W]`）
- 颜色编码的组件（输入、骨干网络、注意力、损失等）
- 深层网络（20+ 层）使用模块级粒度

### 阶段三：PyTorch 实现

生成符合严格标准的生产级代码：
- 完整的类型提示
- 每个操作后的张量形状注释
- 模块化架构，独立的类
- 权重初始化方法
- 可复现性配置
- 完整的验证代码

## 张量形状符号规范

| 符号 | 含义 | 示例 |
|------|------|------|
| `B` | Batch Size | 批次大小 |
| `C` | Channels | 通道数 |
| `H` | Height | 高度 |
| `W` | Width | 宽度 |
| `T` | Time / Sequence Length | 时间步/序列长度 |
| `D` | Dimension / Feature Dim | 特征维度 |
| `N` | Number of elements | 元素数量 |
| `E` | Embedding Dimension | 嵌入维度 |

## "论文未指定"协议

当论文未指定某些参数时，技能使用标准化的标注格式：

```python
# Dropout rate: Paper did not specify
# Recommended: 0.1
# Reference: BERT (Devlin et al., 2019)
# Alternatives: [0.0, 0.1, 0.2, 0.3]
# Impact: Higher dropout may improve generalization
self.dropout = nn.Dropout(p=0.1)
```

## 输出结构

```
output/
├── README.md           # 论文概述、使用说明
├── model.py            # 主模型实现
├── modules/            # 子模块
│   ├── __init__.py
│   ├── attention.py    # 注意力模块
│   ├── backbone.py     # 骨干网络
│   └── head.py         # 输出头
├── config.py           # 配置文件
└── requirements.txt    # 依赖列表
```

## 处理的常见陷阱

- 张量 reshape vs view 操作
- 论文图表/文字不一致
- 框架差异（PyTorch vs TensorFlow BatchNorm momentum）
- 不同框架的初始化差异

## 环境要求

- Python 3.10+
- PyTorch 2.0+
- 可选：einops, timm

## 使用示例

```
请帮我复现这篇论文：[附上 PDF 或粘贴论文内容]
```

技能将：
1. 提取并解释核心公式
2. 生成架构图
3. 生成带形状标注的经过验证的 PyTorch 代码
