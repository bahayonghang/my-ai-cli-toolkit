# Copy spot check

Checked `skills/development-workflows/design-atlas` with `rg -F`. Each phrase is one ui-mode heading (1-13) or one prompt-library heading (P1-P14). Exit code 1 means no match.

| id | phrase | rg exit |
| --- | --- | --- |
| ui-1 | 同一信息被反复解释 | 1 |
| ui-2 | 没有信息作用的英文小标题和分隔装饰 | 1 |
| ui-3 | 文案没有对准这页的使用者 | 1 |
| ui-4 | 每个数字、每段话都单独套框 | 1 |
| ui-5 | 圆角、阴影和彩边到处叠加 | 1 |
| ui-6 | 颜色没有稳定的用途 | 1 |
| ui-7 | 字号不断增加，信息主次仍不清楚 | 1 |
| ui-8 | 几何上排齐了，看起来仍歪 | 1 |
| ui-9 | 用户被迫做很多没必要的选择 | 1 |
| ui-10 | 每个元素都要飘、弹或逐个入场 | 1 |
| ui-11 | 只有“高级一点”，没有具体参照 | 1 |
| ui-12 | 把“获奖级”和无限自审当验收 | 1 |
| ui-13 | 用网页交互规则把动画改坏 | 1 |
| P1 | 删重复文案 | 1 |
| P2 | 不要给每段内容加重点框 | 1 |
| P3 | 指定每种颜色的用途 | 1 |
| P4 | 统一字号，对齐边角 | 1 |
| P5 | 一屏只讲一件事 | 1 |
| P6 | 动画与动效设计 | 1 |
| P7 | 从参考提炼风格，不只要求简化 | 1 |
| P8 | 字体、构图与留白 | 1 |
| P9 | 配色、材质与辨识度 | 1 |
| P10 | 把动效说成可实现的动作 | 1 |
| P11 | 完整状态与响应式 | 1 |
| P12 | 八维复查与迭代 | 1 |
| P13 | 用风格词约束素材与画面 | 1 |
| P14 | 从成品参考到项目实现 | 1 |

`rg -F LearnPrompt/vibecoding-humanizer` exit 0. Hits:

```
skills/development-workflows/design-atlas/README.md:141:[LearnPrompt/vibecoding-humanizer](https://github.com/LearnPrompt/vibecoding-humanizer) commit `51f8b09`：思路参考；上游未附许可证，未复制文本。
```

All 27 heading phrases returned exit 1. The repository name appears only in the README thanks line.
