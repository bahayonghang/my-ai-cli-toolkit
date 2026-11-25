# #68 集成后的回归复验

复核起点为 `cecce9590d6de7e3d663f4b55f0b357655c4a971`。下列测试均在 Windows 运行。

## 北欧风格的选择

通过公开 CLI 的 `route --kind style --n 200 --format json` 枚举全部候选风格。原实现对 8 个题材、排除或比较请求都列出了北欧，包括 “Create a reading index about Nordic design history”、“不要北欧风格，保留现有品牌”和 “Compare the Nordic style with minimal before I choose.”。修复后这 8 次均排除北欧，换批推荐也只能从同一候选池取项。7 个肯定选择仍将北欧排在首位，包括 “Give the site a Scandinavian look” 和 “用北欧风格”。限定 `--kind theme` 时，同一请求使用正常的 genre 推断。47 个路由测试与 33 个目录测试通过，覆盖四个别名的搜索、命名应用和替换备份。[路由回归](../../../../skills/development-workflows/design-atlas/tests/test_routing.py)

四个新会话使用同一份修复版指令。北欧设计博物馆的阅读索引选用 Grid，明确排除北欧的账户查询选用 Storytelling，明确选择北欧的请求生成带有第一方来源的 DESIGN.md。第四个会话比较两种装订工坊风格并等待选择。项目已有的 DESIGN.md、index.html 和 notebook.css 在比较前后哈希相同。[请求、原答与文件校验](review-calls.json)

## 预约改稿的最终回答

固定候选的原始回答和第一次修订指令后的回答均为**部分满足**。两次均修复了按钮可见性，原答均漏报 44b、`fixed` 和披露验证。最终修订后，新会话使用同一模型、设置、项目输入、起始截图和原请求，报告了 **44b · #reserve · fixed**。按钮上边缘在 1280 × 800 从 876 移到 232 px，在 390 × 844 从 920 移到 300 px。回复记录了键盘焦点、数量 1–4 及披露原文 “Local preview. No booking or payment is sent.”。协调者在三个视口重放，七张截图与原始候选首次改稿后的对应 PNG 逐字节相同。[完整请求、原答、测量与七份截图摘要](review-calls.json)

最终回复还声称有独立复核。该会话日志只记录到接收者列表为空的等待操作，没有可辨识的评审结论；该次验收记为**自检，非独立复核**。协调者单独保留的原样例三轮独立复核均为 `fix`。[三轮原始回复](first-screen/reviews.md)

## 公开参考页

在 headless Edge 158.0.4370.33 打开[分发的离线页面](../../../../skills/development-workflows/design-atlas/assets/reference/scandinavian/index.html)，DPR 1。390 × 844、强制颜色、点击切换后移开鼠标并令按钮失焦。原按钮开启和关闭时的 99 × 40 裁图完全相同。修复后的 121 × 40 裁图中有 40 个像素随勾选变化，按钮的可访问名称保持 Dark paper，`aria-pressed` 随状态切换。[关闭](public-toggle-off.png) · [开启](public-toggle-on.png)

系统首选浅色和深色时分别从关闭和开启状态进入。切换后外围画布分别为 RGB(245, 242, 233) 和 RGB(24, 37, 33)。在 1180 × 760 和 390 × 844 比较同状态首屏，只有按钮左端的标记与边缘发生像素变化。两处均用空格切换外观，再以 Tab 和右方向键选中 Kelp，实时图注显示 “Kelp plate on cream paper”。

## 校样台测量

将表达型正确样本复制到临时目录，每次单独修改一项 CSS。Edge 158.0.4370.33 在 1440 × 900 和 390 × 844 下实操 Tab、右方向键选中 B。对同一选中标签和周边表面比较键盘聚焦与移焦时的像素，按实际颜色计算达到 3:1 的变化像素。此处的面积下限为一个原生单选控件的宽度，只用于这份静态、1 倍缩放的样本。

| 输入 | 修复前 `--check-clear` | 修复后两种宽度的结果 |
| --- | --- | --- |
| 原有正确对照 | 退出 0 | 退出 0，A/B/A 与图例一致；各有 1,158 个焦点变化像素 |
| 只把第三道 A 改成 Iris | 错误地退出 0 | 退出 1，两种宽度均指出色版与图例不符 |
| 移除输入和标签的焦点轮廓 | 错误地退出 0 | 退出 1，两种宽度均为 0 个焦点变化像素 |
| 以高对比投影代替轮廓 | — | 退出 0，两种宽度均为 894 个焦点变化像素 |

从仓库根目录运行 `python .trellis/research/design-atlas-63/68/check_proof.py --channel msedge` 可重建临时项目、运行[公开测量程序](../../../../skills/development-workflows/design-atlas/tests/fixtures/task-aware/colour/measure_proof.py)并核对退出码和两种宽度的失败原因。依赖 Playwright、Pillow 和 Edge。

## 仓库检查

`just docs-sync` 后没有生成文档差异。`just ci` 八项全部通过，包括 design-atlas 的 246 个 Python 测试。Node 测试通过 351 个、跳过 51 个；24 份公开评测清单通过结构检查。文档依赖安装仍报告 1 低、6 高共 7 条 npm 安全公告。

Standards 复核确认四项修复通过，覆盖选用路由、公开开关、校样测量和安装路径；另核对了 genre 来自可选条目的路由元数据。Spec 复核核对了选用边界、用例 40 的原始与补测评分，以及 Windows 导出和归档哈希。最终构建者所声称的独立复核仍按上述限制处理。
