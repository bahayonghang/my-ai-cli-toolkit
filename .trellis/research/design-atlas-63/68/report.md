# #68 · 按页面任务审查与改稿

在同一设备目录上，0.7.0 把完整业务行的 157 和 153 个词判为超过门禁 58 的建议值，建议先压缩导语。候选版将这项判断记为 `n/a`，并在两个视口、两个实际滚动位置正确列出可用记录。两版都保留了可用的查阅索引，也都修好了预约入口。这里能复现的改进是门禁判定和记录计数。[旧版目录回答](semantics/grid-baseline.txt) · [候选目录回答](semantics/grid-candidate.txt)

## 运行条件

基线为 `493a1a3aaf7e6da98dc9cc34629b5a13affb5c86`（0.7.0），候选为合入 #64–#67 的 `ed99d785da44b9fd3af67fa33439497f91bfe63e`。0.8.0 元数据、公开评测和作者指南的提交为 `72d2be943006b8c8272296df994db2624a14725e`。每侧从相应提交单独导出 skill，以新的 Codex CLI 会话加载绝对路径，在独立临时项目中接收同一输入和请求。审查报告与截图保存在被审项目外。配对会话使用 `gpt-6.2-astra`、medium 和无头 Edge。各组记录列出请求、加载路径、会话和文件校验。[首屏对照与复跑说明](first-screen/report.md) · [目录和校样台的逐项评分](semantics/report.md)

## 同输入的版本对照

| 任务及判据 | 实际观察 |
| --- | --- |
| 查阅索引，44b、F4、6b、58 | 两侧只读审查前后项目字节一致。候选在 `#query` 定位到查阅入口，44b、F4 为 `pass`，6b、58 为 `n/a`。输入 awl 留下穿孔说明，清空恢复三条。旧版也接受零主按钮，但把 59 个查阅词计作 58 的通过依据。[旧版](first-screen/baseline-index.md) · [候选](first-screen/candidate-index.md) · [搜索画面](first-screen/index-search.png) |
| 预约改稿，44b、F4 | 在 1280 × 800、闭合面板、滚动 0 时，`#reserve` 从 y=876 移到 y=232。两版首轮改稿在桌面和窄屏都露出已有按钮，激活后焦点进入数量框，可选 1–4。44b 的可定位问题在两侧均已修复。[原画面](first-screen/workshop-before.png) · [初次改稿画面](first-screen/both-workshop-after.png) · [候选首次改动](first-screen/candidate-restyle.patch) |
| 按现有 DESIGN.md 构建 | 两版均保留原有三份文件，新增 `tools.html`，查询 awl 和清除均有效。两版窄屏过滤状态截图的像素相同。[旧版补丁](first-screen/baseline-build.patch) · [候选补丁](first-screen/candidate-build.patch) · [过滤画面](first-screen/both-tools-search.png) |
| 设备目录，3、8、58 | 候选对 `#records` 重复行和同一行内的 Inspect/Pick 判 3、8 为 `pass`，保留价格和地点，建议另外对齐窄屏价格。58 为 `n/a`。桌面 0/360px 位置各有 13/12 条完整记录，窄屏为 6/6。旧版将窄屏首屏底部裁切的 FE-07 也列为可读。实操 Inspect、Pick 和撤销验证了归属。[旧版](semantics/grid-baseline.txt) · [候选](semantics/grid-candidate.txt) · [实际 360px 位置](semantics/directory-360.png) |
| 故障校样台，DA2、40、41 | 两版审查都指出 `.legend .plate-b` 的圆点用错墨色，以及 `.proof-notice` 在紫色面板上只有约 2.62:1。候选明确定位 DA2、40、41 的失败，键盘切至 B 时保留选中状态和 Iris 说明。公开用例 42 还要求区分装饰顶线，候选最初没有指出这条 14px 顶线。随后单独询问颜色承担的角色，两版才都识别出这处装饰；#65 也有实际修复。[补问后的旧版回答](semantics/ink-role-baseline.txt) · [补问后的候选回答](semantics/ink-role-candidate.txt)[候选审查](semantics/ink-candidate.txt) · [问题画面](semantics/proof-issue.png) · [#65 分项及改稿](../65/run.md) |
| 表现型校样台，DA2、41 | 同样的任务换成已有正确图例和披露的对照版。两侧条件改稿均保留完整项目。披露实测 12.35:1，选中标签 11.75:1，键盘切换显出焦点和对应墨版。两次独立复核均给出 `ship`。[旧版](semantics/proof-baseline.txt) · [候选](semantics/proof-candidate.txt) · [相同状态的画面](semantics/proof-control.png) |

独立复核对候选工具索引给出 `ship`。预约页三轮均为 `fix`。后续改稿澄清了预览提示，并实测重复激活和数量 0、5、2 的无效和有效状态；三个视口的 44b 仍通过。最后一轮希望补充具体日期或待定标签，并把术语改得更直白。样例未给日期，这两条保留在复核记录里。[逐轮回答及复验](first-screen/reviews.md)

## 同内容的风格对照

从候选版分别点名 `style:scandinavian` 和 `style:neobrutalism`，在两个空项目中构建 *Low water*。两份请求使用相同的两张原创 PNG、版画信息、控件与状态。0.7.0 没有北欧条目，旧版的风格对照为 `n/a`。[原请求](styles/request.txt) · [两次加载与回答](styles/runs.json)

| 桌面 1440 × 900 | 标题、分组与媒体 |
| --- | --- |
| Scandinavian | 标题在右，72px、500 字重；左侧版画 629 × 466px，记录和操作在右侧。标题实际使用系统回退 Segoe UI Semibold。[DESIGN.md](styles/scandinavian/DESIGN.md) · [桌面画面](styles/scandinavian/desktop.webp) |
| Neobrutalism | 标题在左，103.68px、900 字重；右侧版画 731 × 541px，粗线与硬阴影界定画框。标题实际使用系统回退 Arial Black。[DESIGN.md](styles/neobrutalism/DESIGN.md) · [桌面画面](styles/neobrutalism/desktop.webp) |

两侧都实际切换了 Kelp、Oxide、Both plates 和浅深外观。在 390 × 844 仍能根据图形和文字识别色版，切换面板后墨色含义和奶油色画纸保持一致。[北欧逐状态测量](styles/scandinavian/measurements.json) · [Neobrutalism 逐状态测量](styles/neobrutalism/measurements.json)

两页最终观察到的最低文字对比度分别为 6.64:1、9.39:1。三轮独立复核后，北欧页为 `ship`，Neobrutalism 为 `fix`。余下意见是将 “Dark paper” 改为 “Dark background”，与两组请求指定的控件名冲突。保留该名称并记录了切换外围画布的实测结果。[视觉与操作对照](styles/report.md) · [六次独立复核](styles/reviews.md)

## 复跑与覆盖范围

在仓库根目录运行以下命令。浏览器检查需要装有 Playwright 的 Python 和 Edge；也可使用已安装的 Playwright Chromium 并省略 `--channel msedge`。

```text
python .trellis/research/design-atlas-63/68/check_directory.py --channel msedge
python -m unittest discover -s skills/development-workflows/design-atlas/tests -p test_density_samples.py
python -m unittest discover -s skills/development-workflows/design-atlas/tests -p test_eval_fixtures.py
python -m unittest discover -s skills/development-workflows/design-atlas/tests -p test_design_catalog.py -k test_scandinavian_show_and_explicit_replacement_preserve_sources
just evals-check
```

- 两个原始目录都含顺序一致的 FE-01 至 FE-24，每条的两个可访问操作名都与设备名称相符。在 1440 × 900 和 390 × 844 的 `#records` 请求 0、0、360、100000、200000，实际稳定在顶端、中段和底端三处。脚本核对可见 ID、逐条动作，在四组共 12 个不同视图执行详情、键盘选取和撤销。两次请求落在同一底端时只计一次。[检查程序](check_directory.py) · [原始结果](directory.json)
- 目录 CLI 对已存在的 DESIGN.md 返回 3，内容和文件数均未变化。用 `--force` 显式替换返回 0，只生成一份原始字节备份，SHA-256 为 `3a694ae565ad17d3c0ba3ef6f2663ff9106f5c122f08bb59c2039526fdf81a2f`，新文件注明 `style:scandinavian` 及第一方来源。
- 对临时目录中单一 `main.rs` 执行 `node skills/development-workflows/design-atlas/scripts/slop_check.mjs <rust-only-dir> --json`，退出 2、stdout 为空、stderr 报 `no scannable files`。机械检查未运行。候选提交中无受跟踪的 Cargo.toml，没有可启动的 GPUI 目标。原生 Q11（最小宽度的裁切、重叠、出窗）、默认/最小窗口的浅深色和原生交互均为 `unverified`。10 个 GPUI 规范连接测试通过。
- 公开 eval 保留 1–37 的完整对象，新增 38–54，`just evals-check` 检查了 24 份清单。按[运行说明](../../../../skills/development-workflows/design-atlas/evals/README.md)可重建每个输入。公开清单验证与模型执行的范围如下。

| 公开 ID | 对应证据 |
| --- | --- |
| 38、41 | 固定两版逐一使用样例原请求。[首屏运行](first-screen/report.md) |
| 40 | 候选首次回答**部分满足**。它报告了入口、焦点和数量范围，漏报 44b、`fixed` 及披露验证。操作方实测入口修复和披露保留，另行组织的三轮复核各为 `fix`。返修后的最终原请求已报告 44b、前后位置及披露；原稿和最终回复的独立复核声明均缺少可辨识的结论。[原始回答](first-screen/candidate-restyle.md) · [历史评分](first-screen/report.md) · [返修实测原始记录](review-calls.json) |
| 42、45、48 | 固定两版使用相同业务请求，附加视口、状态与操作要求。42 对装饰顶线的评分为部分满足。[逐项评分](semantics/report.md) |
| 39、43、44、46、47、49 | 前置切片的真实运行分别覆盖 workshop 审查、两个校样版本、两种目录布局的审查或改稿。[#64](../64/report.md) · [#65](../65/run.md) · [#66](../66/report.md) |
| 51、52 | 新版用同一份内容和完整验收说明独立构建两个已选风格。[真实请求和运行记录](styles/runs.json) |
| 50 | #67 实际执行了只读比较与同会话选定北欧的后续请求。[原请求及回答](../67/requests.json) |
| 53、54 | 固定候选逐一使用公开原请求。泛称简洁的账户页只生成 Paper 的 DESIGN.md；已有 bindery 索引选用原有规范，项目所有文件逐字节一致。[运行与文件摘要](selection.json) |
| 1–37 | 与原清单逐项相同，本次只校验了结构。 |

## 集成验证

在 Windows 从仓库根目录运行 `just ci`，八项全部通过。生成站点校验了 55 个文件，design-atlas 的 244 个 Python 测试通过，Node 共 351 个通过、51 个跳过，24 份 eval 清单结构有效，最终空白检查通过。docs 依赖安装时 npm 报告 7 条安全公告（1 低、6 高）；站点构建成功。

对已集成版本的复核另行复现了路由误选、公开样张开关在强制颜色下的状态缺失，以及校样测量的两个漏报。[复现、修复及复验](review.md)
