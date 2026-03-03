# Paper Replication

Deep learning paper replication skill that transforms academic papers into industrial-grade PyTorch code with comprehensive module documentation.

## Overview

This skill enables Claude to read deep learning papers (PDF or text), perform deep deconstruction, and output runnable, industrial-standard PyTorch network model code along with detailed technical documentation for each module.

## Trigger Phrases

- "帮我复现这篇论文" (Help me replicate this paper)
- "论文复现" (Paper replication)
- "实现这个模型" (Implement this model)
- When providing a deep learning paper that needs to be converted to PyTorch code

## Workflow

The skill follows a strict four-phase workflow:

### Phase 1: Paper Auditing & Deconstruction

1. **Core Summary** - Problem statement and key contributions
2. **Mathematical Auditing** - Extract formulas in LaTeX, explain symbols, analyze loss functions
3. **Architecture Details** - Document all hyperparameters with sources

### Phase 2: Architecture Visualization

Generate Mermaid flowcharts with:
- Input/Output tensor shapes using standard notation (`[B, C, H, W]`)
- Color-coded components (Input, Backbone, Attention, Loss, etc.)
- Module-level granularity for deep networks (20+ layers)

### Phase 3: PyTorch Implementation

Generate production-ready code following strict standards:
- Type hints throughout
- Tensor shape comments after every operation
- Modular architecture with separate classes
- Weight initialization methods
- Reproducibility configuration
- Comprehensive validation code

### Phase 4: Module Documentation

Generate detailed technical documentation for each core module:

#### Document Structure (6 Required Sections)
1. **Module Overview** - Functionality, position in architecture, I/O specs
2. **Mathematical Principles** - Core formulas (LaTeX), symbol tables, derivations
3. **Data Flow Diagrams** - Mermaid flowcharts with tensor shape tracking
4. **Implementation Details** - Key code snippets, hyperparameters, design decisions
5. **Usage Examples** - Code examples with input/output demonstrations
6. **Notes & Caveats** - Common issues, performance considerations, paper differences

#### Mermaid Diagram Types
- **Internal Flow Diagrams** - Detailed data flow within modules
- **Tensor Shape Change Diagrams** - Dimension transformation tracking
- **Attention Mechanism Diagrams** - Q/K/V computation flow (when applicable)
- **Residual Connection Diagrams** - Skip connection visualization

#### Formula Documentation Standards
- LaTeX format with symbol explanation tables
- Dimension derivation for each operation
- Step-by-step derivation for complex formulas
- Detailed Loss Function analysis with component breakdown

## Tensor Shape Notation

| Symbol | Meaning | Example |
|--------|---------|---------|
| `B` | Batch Size | - |
| `C` | Channels | - |
| `H` | Height | - |
| `W` | Width | - |
| `T` | Time / Sequence Length | - |
| `D` | Dimension / Feature Dim | - |
| `N` | Number of elements | - |
| `E` | Embedding Dimension | - |

## "Paper Did Not Specify" Protocol

When papers don't specify certain parameters, the skill uses a standardized annotation format:

```python
# Dropout rate: Paper did not specify
# Recommended: 0.1
# Reference: BERT (Devlin et al., 2019)
# Alternatives: [0.0, 0.1, 0.2, 0.3]
# Impact: Higher dropout may improve generalization
self.dropout = nn.Dropout(p=0.1)
```

## Output Structure

```
output/
├── README.md                    # Paper overview, usage instructions
├── docs/                        # Technical documentation
│   ├── architecture.md          # Overall architecture document
│   ├── modules/                 # Module documentation
│   │   ├── backbone.md          # Backbone network docs
│   │   ├── attention.md         # Attention module docs (if applicable)
│   │   ├── head.md              # Output head docs
│   │   └── loss.md              # Loss function docs
│   ├── math/                    # Mathematical documentation
│   │   ├── formulas.md          # Formula summary
│   │   └── derivations.md       # Derivation process (if applicable)
│   └── diagrams/                # Diagram documentation
│       ├── overview.md          # Overall architecture flowchart
│       └── tensor_shapes.md     # Tensor shape change diagrams
├── model.py                     # Main model implementation
├── modules/                     # Sub-modules
│   ├── __init__.py
│   ├── attention.py             # Attention modules
│   ├── backbone.py              # Backbone network
│   └── head.py                  # Output head
├── config.py                    # Configuration file
└── requirements.txt             # Dependencies
```

## Common Pitfalls Handled

- Tensor reshape vs view operations
- Paper figure/text inconsistencies
- Framework differences (PyTorch vs TensorFlow BatchNorm momentum)
- Initialization differences across frameworks

## Requirements

- Python 3.10+
- PyTorch 2.0+
- Optional: einops, timm

## Example Usage

```
Please replicate this paper: [attach PDF or paste paper content]
```

The skill will:
1. Extract and explain core formulas
2. Generate architecture diagram
3. Produce validated PyTorch code with shape annotations
4. Generate detailed module documentation with Mermaid diagrams and formula explanations
