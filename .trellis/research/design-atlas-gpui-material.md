# design-atlas：GPUI 实施规范与 airy-glass 材质模型

2026-11-15 至 2026-11-19。两个 PR 都已合并到各自的 `dev`。GitHub 已核实父工单和七个子工单全部按完成关闭。

## 单一事实来源

- spec：`bahayonghang/my-ai-cli-toolkit#47`。决定 D1–D11、四层材质模型、起点数值、证据表都在那里。本文不重复，只记 spec 之外对后续会话有用的内容。
- ticket：`#48`（`slop_check` 零文件）、`#49`（`signals` 认出 GPUI）、`#50`（材质模型）、`#51`（深色组）、`#52`（GPUI 实施规范），以及 `bahayonghang/devsweep#5`（配方 spike）和 `bahayonghang/devsweep#6`（重做 Clean 页）。
- 依赖：`#51` 等 `#50`。`#52` 等 `#48`、`#49`、`#50`、`#51` 和 `devsweep#5`。`devsweep#6` 等 `#52`。

## 发布与关单（2026-11-19）

- toolkit [PR #53](https://github.com/bahayonghang/my-ai-cli-toolkit/pull/53) 把 `9b6aafe9` 合并为 `a98d17910782d3746082dba0ba048c0c5ec0c7c2`。Windows 重新运行 `just ci` 通过。工作流只在面向 main 的 PR 和发布 release 时触发，dev 没有必需的远端检查。
- DevSweep [PR #7](https://github.com/bahayonghang/devsweep/pull/7) 合并为 `324e72bbb4a86a2cf0731ba6fe2b5f17b9562148`。以远端 dev 为基线，`a3e0466` 从本地签收版 `4b9062e` 提取材质、Clean 审阅和键盘焦点所需代码。公开图片只有六张可由脚本重建的画廊色斑。原始截图保存在本地签收分支的两个任务证据目录。
- DevSweep 的 `5161ef4` 修复了 Rust 1.100 下两种测试辅助程序的查找方式。Windows 根仓 `just ci`、最终提交的 `just gpui`（211 项产品测试、4 项画廊测试、release 构建）及九项 GitHub 检查均通过。Windows 稳定版的一项并发文件增长测试曾单次失败；本地单测复验和同一 SHA 的托管重跑均成功。[最终 CI](https://github.com/bahayonghang/devsweep/actions/runs/44475129441)
- 公开 release 程序复验了 1240×820、720×560 两种尺寸的浅深色客户区。三组与签收图逐像素一致，窄窗浅色只有 5 / 630,000 像素相差一个色阶。两种尺寸的第 21 站 Tab 焦点图均相同。56 项颜色和透明度差异为零。测试辅助程序修复前后的产品二进制 SHA-256 均为 `560830500F42A094BFDE6995237D23D3BD4A63C1F0D3C482310BB23C3E5D850D`。真实 Shift+Tab、Windows 全局辅助功能变化通知和 macOS/Linux 原生界面仍未验证。
- GitHub 回读结果为两个 PR 均 `MERGED`，两个远端 dev 的提交均与合并 SHA 相符。toolkit #47、#48、#49、#50、#51、#52 与 DevSweep #5、#6 全部 `CLOSED / COMPLETED`。[父工单收尾](https://github.com/bahayonghang/my-ai-cli-toolkit/issues/47#issuecomment-7002311786) · [#5 交付](https://github.com/bahayonghang/devsweep/issues/5#issuecomment-7002289618) · [#6 签收](https://github.com/bahayonghang/devsweep/issues/6#issuecomment-7001256767)

## 发布前交接（2026-11-19）

- toolkit 的 `feat/design-atlas-gpui` 已推送至 `origin`，两端均为 `9b6aafe9`。`just ci` 退出 0。#48–#52 的结果评论已发布，五张工单均已关闭。未开 PR。
- DevSweep 的 `feat/airy-glass-material` 只在本地。#5 的画廊结论已发在[结果评论](https://github.com/bahayonghang/devsweep/issues/5#issuecomment-6932241960)。#6 的实现为 `c74f749`，原生证据为 `3e62a36`。该仓库的 `.trellis/tasks/11-18-gpui-clean-airy-glass-material/result.md` 收录四组原生/参考对照和一组同尺寸 SkillPort 对照。Tab 末行被裁切的问题在 1240 和 720 宽度复验通过，真实 Shift+Tab 仍未证实。
- #6 在用户将路径加入火绒信任区后，以默认并发在 `3e62a36` 和 `81a8b47` 两次运行 `just gpui`，均以 0 退出。每次产品测试 243 项、画廊测试 4 项全过，格式、Clippy 和 release 构建通过。[首次报告](https://github.com/bahayonghang/devsweep/issues/6#issuecomment-7000924204) · [复验评论](https://github.com/bahayonghang/devsweep/issues/6#issuecomment-7001210406)
- 用户签收了浅色和深色各自默认、最小窗口的对照，DevSweep #6 按完成关闭。本地验收报告已在 `4b9062e` 记录签收，该提交的 `just gpui` 同样通过（243 项产品测试、4 项画廊测试和 release 构建）。此时七个子项仅 DevSweep #5 开放，等 DevSweep 分支公开推送后关闭。[#6 签收](https://github.com/bahayonghang/devsweep/issues/6#issuecomment-7001256767) · [#47 进度](https://github.com/bahayonghang/my-ai-cli-toolkit/issues/47#issuecomment-7001285446)
- 原生系统通知、macOS 与 Linux 未验。减少动效在隔离的应用偏好中运行，高对比度使用应用调试预览。颜色边界的浅色最差实测为 3.17；早期 3.29 的用色差异见 #5 结论。

## 初始实施计划（2026-11-16）

- 实施用的 prompt 在 `.planning/design-atlas-gpui/next-session-prompt.md`（该目录不入库）。它在新会话里用 `/implement-spec` 按顺序做完 7 张 ticket，一次一张。这份 prompt 没有试跑过。
- prompt 里的默认做法是不推送 devsweep 的集成分支。这是按用户「采用推荐」定的，用户可以改。依据是 2026-11-16 的实测：devsweep 的 `dev` 比 `origin/dev` 多 3 个提交，其中有 10 张证据截图，而 `origin/dev` 和 `origin/main` 上还没有任何 JPG。

## 用户确认的决定（摘要）

用户在两轮追问里逐项确认（2026-11-15 和 2026-11-16）。完整措辞以 spec 为准。

- 目标是底场、纸、内容块三层不靠模糊也成立。真模糊只用于浮层，而且可选。
- 材质模型写进 `style:airy-glass` 条目，对所有技术栈生效。已有的 `DESIGN.md` 不动。
- 只做 GPUI 一份规范（`references/implementation-gpui.md`）。不做通用的原生技术栈抽象。
- 深色组进色板拨盘。skill 自带一张静态参考页。窗口底场默认由应用自己画成不透明。
- Rust 源码的机械门禁不在本轮。不把 GPUI 依赖换成 gpui-ce 或 gpui-kit。

## 实测

- 0.6.0 的 `slop_check.mjs` 在只有 `.rs` 的目录上输出 `files 0`，退出码是 0。`signals` 在 GPUI crate 上输出 `frameworks: []`。
- 起点数值是 SkillPort 的 token 加条目现有的 mint 场端。用 `scripts/palette.py` 的 `contrast` 和 `over`，按最差色斑计算：

| 项 | 浅色 | 深色 |
| --- | --- | --- |
| `ink` 在纸上 | 12.16 | 13.04 |
| `muted` 在纸上 | 4.96 | 6.90 |
| `ink` 在底场上 | 10.19 | 12.86 |
| `muted` 在底场上 | 4.16 | 6.81 |
| 控件边界在纸上 | 3.29 | 3.24 |
| 纸与底场的明度比 | 1.07 | 1.01 |

- 由此得出两点。浅色 mint 的 `muted` 不能落在底场上。纸与底场的明度比不能设门槛：SkillPort 自己的数值就只有 1.07 和 1.01，层次来自色斑、描边、高光和阴影。

## 读源码得到的事实（没有运行）

- 上游 GPUI（zed `322cd509`，DevSweep 钉住的版本）没有 `backdrop_*` 和 `filter` 样式，也没有径向渐变。它有 `BoxShadow` 的 `inset` 和 `spread_radius`、`add_fonts`、`with_animation`、`reduce_motion()`。
- zed `main`（`053d91cb14`）同样没有 backdrop blur 和径向渐变。
- gpui-ce 有 `backdrop_blur`，DirectX 渲染器里有实现。gpui-kit 的移植只覆盖 Metal 和 wgpu。
- SkillPort 的面板（`.glass-panel`）不用 `backdrop-filter`，只有浮层和吸顶条用。

## 推断与未验证

- 根因的排序依据是截图和源码，没有做对照实验。
- 截至 2026-11-16 制订计划时，这些尚未运行，后续实测见上方 #5 结论：GPUI 里色斑的画法、负扩散阴影的渲染、可变字体的字重、Mica 能否透过客户区显示。

## 发布过程

- gh 2.104 上，`gh issue edit <子 issue> --parent <父 URL>` 和 `--add-blocked-by <URL>` 可以跨仓库使用。两个仓库属于同一个所有者。
- 标题含中文。发布时用 Python 的参数列表调用 `gh`，创建后回读标题核对，8 个都一致。
- 正文里第三方仓库的 issue 编号放在行内代码里，这样不会在对方的时间线上生成反向引用。
- qiaomu-meta 的 `research_prior_art.py` 在 Windows 上失败：它用 `subprocess` 直接调用 `npx`，找不到可执行文件。当时改为直接运行它包装的两条命令。
