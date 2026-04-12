# COMMON_PITFALLS

## Contents

1. Tensor operation pitfalls
2. Paper figures may be wrong
3. Hyperparameter reporting traps
4. Paper vs official code
5. Framework differences
6. Initialization differences
7. PDF reading guidelines
8. Multi-file paper handling

## 1. Tensor Operation Pitfalls

```python
# Wrong: reshape may silently hide memory layout issues
x = x.reshape(B, -1)

# Better: use flatten or make contiguity explicit before view
x = x.view(B, -1)                # only if already contiguous
x = x.flatten(start_dim=1)       # safer default
x = x.contiguous().view(B, -1)   # explicit contiguity restoration
```

## 2. Paper Figures May Be Wrong

- 作者可能画错架构图；优先相信文字描述、公式和伪代码。
- 如果图文不一致，在代码注释或 README 中显式标注差异。

## 3. Hyperparameter Reporting Traps

- 区分“训练时使用的超参数”和“论文最终报告的最佳超参数”。
- 论文可能报告的是多轮搜索后的最优值，不一定等于默认训练配置。

## 4. Paper vs Official Code

- 如果论文提供官方代码仓库，优先参考官方实现。
- 标注官方代码版本、commit hash 或 release tag。
- 说明论文描述与官方代码实现的差异，不要默默融合。

## 5. Framework Differences

```python
# BatchNorm momentum differs between PyTorch and TensorFlow.
# PyTorch: new_running_mean = (1 - momentum) * running_mean + momentum * batch_mean
# TensorFlow: new_running_mean = momentum * running_mean + (1 - momentum) * batch_mean
#
# If the paper used TensorFlow and says momentum=0.9,
# the PyTorch equivalent is usually momentum=0.1.
nn.BatchNorm2d(channels, momentum=0.1)
```

## 6. Initialization Differences

- 不同框架的默认初始化方式不同。
- 如果论文未指定初始化，优先使用 PyTorch 默认值并明确标注。

## 7. PDF Reading Guidelines

读取 PDF 论文时，重点关注：

### 7.1 Figures and Tables

- Figure：网络架构图、数据流图、实验结果可视化。
- Table：超参数配置、实验对比、消融实验。
- Algorithm：伪代码、训练流程、推理过程。

### 7.2 Formula Extraction

- 重点查看 Method / Approach 章节。
- 保留公式编号，便于在代码和文档中回溯。
- 检查 Appendix 是否提供补充公式或推导。

### 7.3 Implementation Details

- Section 3/4（Method）：核心架构描述。
- Section 5（Experiments）：训练细节与超参数。
- Appendix：额外实现细节、完整配置、伪代码。

### 7.4 Code References

如果论文提供官方代码仓库：

- 优先参考官方实现。
- 记录代码版本或 commit hash。
- 对比论文描述与代码实现的差异。

## 8. Multi-File Paper Handling

- 如果论文有 Supplementary Material / Appendix 作为单独文件，优先阅读主论文。
- Supplementary 通常包含更详细的超参数配置、额外消融实验和完整伪代码。
- 只有在主论文信息不足时再补读补充材料。
- 凡来自补充材料的实现细节，标注：

```python
# Reference: Supplementary Section X
```
