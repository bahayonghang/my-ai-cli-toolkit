# #67 · 北欧条目与离线样张

这张样张要让读者看清一幅双版压印画，并能单独查看每一色版。作品《Low water》、两张本地 PNG 色版、图注、版式和规范均为本次原创。三种构图共用同一个 HTML、同一对原始色版、同一标题、记录和控件。选定的是 [sheet 构图](sheet.png)，可直接打开[分发的离线参考页](../../../../skills/development-workflows/design-atlas/assets/reference/scandinavian/index.html)。

## 三种构图

在 Edge 158.0.4370.33 中以 `file://` 加载页面，网络离线，缩放比例 1，固定 1180 × 760 CSS px，滚动位置 0。三个截图为原始视口。复现另两种构图时，在同一页面的样式表末尾追加对应 CSS。

| 构图 | 实际图像宽 × 高 | 对看版与读记录的影响 |
| --- | ---: | --- |
| [Gallery](gallery.png) · [CSS](gallery.css) | 470 × 348 | 标题居中，先看整张，再往下找工具。色版按钮只有上半部进入首屏，阅读完整记录需要滚动。 |
| [Register](register.png) · [CSS](register.css) | 509 × 376 | 横向标题下并排放版画和表，三行记录及切换控件均可见。左上标题离实际画面较远。 |
| [Sheet](sheet.png) · 交付版 | 562 × 416 | 三个选项及三行记录均在首屏，图比另两种更大，灯塔和水面刀纹可直接对照。图注紧贴图板；没有为看图任务增设独立主按钮。 |

与 `style:minimal` 比较，色版及图像保留饱和度，图注依附对象；与 `style:spacious` 比较，记录内部保持紧凑；与 `theme:atelier` 比较，标题用同一无衬线字体，棉纸和印痕仅出现在版画里。以上是对这份内容的判断。

## 操作和对比度

- [深色与焦点截图](dark-oxide.png)记录 Tab 到“Dark paper”、空格切换、再用方向键切至 Oxide。图中只剩太阳及反光。切回 Both 恢复海岸；两种界面外观的图像内部逐像素相同。
- [窄屏截图](mobile.png)为 390 × 844。标题、图、工具依次出现，页面实测无横向溢出，点选 Kelp 能切换。新加载页面跟随系统深色偏好。
- [渲染记录](render.json)包含元素坐标和实际 CSS 绘制对的对比度，已逐项核对条目的浅深色表。弱文字在两种实际表面上最低 5.89:1，焦点最低 6.00:1，控件边界最低 3.54:1。选择有反色和原生单选状态；两色图例还分别使用圆、菱形和色名。
- 对分发的 HTML 运行 `node scripts/slop_check.mjs assets/reference/scandinavian/index.html --design assets/catalog/styles/scandinavian.md`，结果为 Floor 0 FAIL、House 0 FAIL、Reflex 0 REFLEX、0 WARN。Ego Lite 的页面树和换版/换色操作也可读取；该浏览器截图两次超时。上述全部像素和测量来自独立启动的无头 Edge。
- 首次暂存时，原参考页的文本规则把两张 PNG 文件头的 CRLF 改成 LF。把参考页目录的 PNG 标为二进制后，从 Git 索引提取 HTML 和两层 PNG，校验三者的字节并用图像解码器打开两层，再从这份副本完整重跑上述渲染和交互。

## 目录与路由

[CLI 输出摘要](cli.json)分别记录四个名称的搜索、可见和全量计数、show 与源文件的字节比较、apply 来源、拒绝覆盖的退出码 3，以及显式替换所保留的原始备份。route 单独运行。未提风格时，即使项目元数据谈北欧设计，从完整候选池和低置信度兜底中仍排除该条目；“Browse Nordic ceramics”也维持题材和界面风格的区别。原 genre/cluster、精酿和街机等表现型回归由现有路由测试覆盖。

以 `14255fb1` 为起点，新增四个 search 查找的测试先全部失败，原有 search 对照通过。加入源文件和 manifest 后两个测试通过。单独的路由测试先得到四个错选及四个错误纳入候选的失败，原路由语料通过。更新路由后，全组 45 个路由测试及 33 个目录/CLI 测试通过。已运行 `just docs-sync` 并检查生成的中英文目录，最终 `just ci` 八项均通过。

[完整重建记录](build.json)给出两个干净上游 checkout 的锁定 SHA 和结果。从 skill 根目录复制包含已有 index、categories、first-party 及 overlays 的 catalog，把新源文件、manifest 和 routing 放进副本，运行以下命令两次。分发目录使用同一构建器生成。

```text
python scripts/build_catalog.py --design-md <VoltAgent-checkout> --design-skills <Bergside-checkout> --out <catalog-copy>
```

第一次只写入新 style 和 index，原有条目逐项保持一致，保留 50 个 Hallmark 主题。第二次零写入、零删除，216 个文件的内容与修改时间均保持一致。分发目录与重建副本的所有文件哈希一致，源文档与分发 style 均为 UTF-8/LF、逐字节相同。

## 真实请求

[请求、实际回答和文件校验](requests.json)记录点名、比较、同一对话选定、泛称简洁、已有品牌规范和去模板时的设计选择。每次先进入原始项目副本；比较请求单独核对项目目录为空以后才发送选择。这里的模型输出与确定性路由测试分开记录。
