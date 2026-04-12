# CODING_STANDARD

## Contents

1. Structured module pattern
2. Type hinting standard
3. Tensor shape tracking
4. Modular decomposition
5. Weight initialization
6. Reproducibility helper
7. Validation template
8. Paper did not specify protocol

## 1. Structured Module Pattern

所有主模型和核心子模块都应继承 `torch.nn.Module`，并在 docstring 中说明论文来源和实现目标。

```python
class ModelName(nn.Module):
    """
    Paper: [Paper Title]
    Authors: [Authors]

    Implementation of [Model Name] as described in the paper.
    """

    def __init__(self, ...):
        super().__init__()
        ...
```

## 2. Type Hinting Standard

严格使用 Python type hint，尤其是 `forward`、工厂函数和辅助工具函数。

```python
def forward(self, x: torch.Tensor) -> torch.Tensor:
    ...

def forward(
    self,
    x: torch.Tensor,
    mask: Optional[torch.Tensor] = None,
) -> Tuple[torch.Tensor, torch.Tensor]:
    ...
```

## 3. Tensor Shape Tracking

每个关键运算后都要显式追踪张量形状变化。

```python
def forward(self, x: torch.Tensor) -> torch.Tensor:
    # x: [B, 3, 224, 224] <- Input tensor

    x = self.conv1(x)
    # x: [B, 64, 112, 112] <- Conv2d(3, 64, k=7, s=2, p=3)

    x = self.bn1(x)
    # x: [B, 64, 112, 112] <- BatchNorm2d (shape unchanged)

    x = self.relu(x)
    # x: [B, 64, 112, 112] <- ReLU (shape unchanged)

    x = self.maxpool(x)
    # x: [B, 64, 56, 56] <- MaxPool2d(k=3, s=2, p=1)

    return x
```

## 4. Modular Decomposition

复杂结构拆成独立 class，避免把整个论文实现塞进一个 `forward`。

```python
class AttentionBlock(nn.Module):
    """Multi-Head Self-Attention Block"""
    ...


class FeedForwardBlock(nn.Module):
    """Position-wise Feed-Forward Network"""
    ...


class TransformerBlock(nn.Module):
    """Transformer Encoder Block = Attention + FFN"""

    def __init__(self, ...):
        self.attention = AttentionBlock(...)
        self.ffn = FeedForwardBlock(...)
```

## 5. Weight Initialization

提供 `_init_weights` 或等价逻辑，并注明初始化来源。

```python
def _init_weights(self) -> None:
    """
    Initialize weights according to the paper.

    Reference: Section X.X of the paper
    """
    for m in self.modules():
        if isinstance(m, nn.Conv2d):
            nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
            if m.bias is not None:
                nn.init.zeros_(m.bias)
        elif isinstance(m, nn.BatchNorm2d):
            nn.init.ones_(m.weight)
            nn.init.zeros_(m.bias)
        elif isinstance(m, nn.Linear):
            nn.init.xavier_uniform_(m.weight)
            if m.bias is not None:
                nn.init.zeros_(m.bias)
```

## 6. Reproducibility Helper

提供显式的随机种子配置，并说明确定性设置的代价。

```python
def set_seed(seed: int = 42) -> None:
    """
    Set random seed for reproducibility.

    Reference: Paper Section X.X (if specified), otherwise using standard practice.
    Note: Full determinism may impact performance on CUDA.
    """
    import random
    import numpy as np

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
```

## 7. Validation Template

每份 `model.py` 末尾都要附带可运行验证代码，至少覆盖前向传播、shape 检查、参数量检查和梯度流检查。

```python
if __name__ == "__main__":
    # ========== Configuration ==========
    batch_size = 2
    in_channels = 3
    height, width = 224, 224
    num_classes = 1000
    paper_reported_params = 25_500_000  # From Table X in paper (set None if not reported)

    # ========== Set Seed ==========
    set_seed(42)

    # ========== Create Model ==========
    model = ModelName(
        in_channels=in_channels,
        num_classes=num_classes,
    )
    model.eval()

    # ========== Generate Random Input ==========
    x = torch.randn(batch_size, in_channels, height, width)

    # ========== Forward Pass ==========
    with torch.no_grad():
        output = model(x)

    # ========== Shape Validation ==========
    expected_shape = (batch_size, num_classes)
    assert output.shape == expected_shape, (
        f"Shape mismatch! Expected {expected_shape}, got {output.shape}"
    )
    print(f"Output shape: {output.shape}")

    # ========== Parameter Count Validation ==========
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")

    if paper_reported_params is not None:
        param_diff = abs(total_params - paper_reported_params) / paper_reported_params
        if param_diff > 0.01:
            print(f"Parameter count differs from paper by {param_diff:.2%}")
        else:
            print("Parameter count matches paper (within 1%)")

    # ========== Gradient Flow Check ==========
    model.train()
    x_grad = torch.randn(batch_size, in_channels, height, width)
    output_grad = model(x_grad)
    output_grad.sum().backward()

    no_grad_params = []
    for name, param in model.named_parameters():
        if param.grad is None:
            no_grad_params.append(name)

    if no_grad_params:
        print(f"No gradient for: {no_grad_params}")
    else:
        print("Gradient flow check passed")

    # ========== Output Range Check ==========
    model.eval()
    with torch.no_grad():
        output_check = model(x)
    print(f"Output range: [{output_check.min():.4f}, {output_check.max():.4f}]")

    # ========== Memory Estimation ==========
    param_memory_mb = sum(
        p.numel() * p.element_size() for p in model.parameters()
    ) / (1024**2)
    print(f"Model parameter memory: {param_memory_mb:.2f} MB")

    print("\\nAll validations passed! Model is ready for training.")
```

## 8. Paper Did Not Specify Protocol

当论文没有给出超参数或实现细节时，必须留下显式证据链，不得直接假定为论文原始配置。

### Annotation Format

```python
# [Parameter Name]: Paper did not specify
# Recommended: [value]
# Reference: [concrete source such as a cited baseline, official code, or common practice]
# Alternatives: [other plausible values]
# Impact: [expected effect on convergence, stability, or generalization]
self.dropout = nn.Dropout(p=0.1)
```

### Example

```python
# Dropout rate: Paper did not specify
# Recommended: 0.1
# Reference: BERT (Devlin et al., 2019), ViT (Dosovitskiy et al., 2021)
# Alternatives: [0.0, 0.1, 0.2, 0.3]
# Impact: Higher dropout may improve generalization but slow convergence
self.dropout = nn.Dropout(p=0.1)

# Weight decay: Paper did not specify
# Recommended: 0.01
# Reference: AdamW default in Transformer architectures
# Alternatives: [0.0, 0.01, 0.05, 0.1]
# Impact: Higher values provide stronger regularization
```
