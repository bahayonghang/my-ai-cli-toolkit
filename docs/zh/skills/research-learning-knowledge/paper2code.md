# paper2code

仓库内置的单篇论文到代码技能，用来把一篇论文转成带引用锚点的实现脚手架。

## 适用场景

- 你的目标是“实现这篇论文”，而不只是阅读或总结
- 输入来源是 arXiv、你本地的 PDF，或 OpenReview 论文页面
- 你希望输出里包含歧义审计、复现说明，以及能回指论文段落的代码

## 不适用场景

- 如果主要任务是精读、对比、整合、搭综述，用 `paper-workbench`
- 不支持 DOI-only 作为主要输入
- 不支持 OpenReview 之外的任意论文落地页抓取

## 支持的输入

- arXiv ID
- arXiv URL
- 本地 PDF 路径
- OpenReview forum / paper page URL
- OpenReview 直链 PDF URL

## 对外接口

```text
/paper2code <paper-source> [--mode minimal|full|educational] [--framework pytorch|jax|numpy]
```

示例：

```text
/paper2code 1706.03762
/paper2code https://arxiv.org/abs/1706.03762
/paper2code ./papers/flashattention.pdf --mode educational
/paper2code https://openreview.net/forum?id=H4DqfPSibmx
/paper2code https://openreview.net/pdf?id=H4DqfPSibmx --mode full
```

## 输出结构

```text
{paper_slug}/
├── README.md
├── REPRODUCTION_NOTES.md
├── requirements.txt
├── src/
├── configs/
└── notebooks/
```

核心保证：

- 每个重要实现决策都尽量锚到论文段落或公式
- 论文未明确给出的细节会显式标注
- 先做歧义审计，再生成代码
- 官方代码只作为参考，不会被当成默认真理偷偷吞掉

## 非目标

- DOI 直取论文正文
- 对任意非 OpenReview 落地页做泛化抓取
- 对论文缺失细节做静默补全

## 与 `paper-workbench` 的关系

`paper-workbench` 更适合论文阅读和分析；`paper2code` 更适合把单篇论文落成实现脚手架与复现说明。
