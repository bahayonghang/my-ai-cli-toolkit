# Editorial Typography Contract（`-l/-m/-i`）

适用范围：只给 `-l` 长图、`-m` 多卡、`-i` 信息图使用。`-v` 和 `-c` 保持各自专用字体系统，不套这份规范。

## 目标

- 用 Skill 自带的本地仓耳今楷，消除 `file://` 截图时的远程字体漂移
- 把 editorial mode 的字体规则收束成一个共享约定，而不是每个模板各写一套
- 保持信息图的可读性：展示型文字可以更有书卷气，但密集标签、数字、编号仍用清晰的 sans / mono

## 字体资产

- 字体文件：`$SKILL_DIR/assets/fonts/TsangerJinKai02-W04.ttf`
- 模板内通过 `{{LOCAL_FONT_FACE}}` 注入 `@font-face`
- 绝对路径必须转成 `file://` URL，不要用相对路径，不要用 Google Fonts

推荐注入值：

```css
@font-face {
  font-family: 'TsangerJinKai';
  src: url('file:///ABSOLUTE/PATH/TO/TsangerJinKai02-W04.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: block;
}
```

其中 `ABSOLUTE/PATH/TO/...` 必须替换成当前机器上 `assets/fonts/TsangerJinKai02-W04.ttf` 的绝对路径。

## 共享字体 token

editorial 模板统一使用以下 token 思路：

- `--font-title`: 仓耳今楷，用于主标题、章节标题、阅读型标签
- `--font-body`: 仓耳今楷，用于长图与多卡正文
- `--font-label`: 仓耳今楷，用于阅读型页眉、页脚、导读标签
- `--font-ui`: 无衬线系统栈，用于 `-i` 中高密度标签、元信息、结构说明
- `--font-mono`: 等宽栈，用于 arXiv ID、编号、数据短码

推荐 UI / mono fallback：

```css
--font-ui: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif;
--font-mono: 'SF Mono', 'Menlo', 'Consolas', monospace;
```

## Mode 约束

### `-l` / `-m`

- 标题、正文、标签统一用仓耳今楷
- arXiv ID、页码可用 mono
- 不要再出现 `KingHwa_OldSong` 作为第一字体，也不要拉远程字体

### `-i`

- 标题、章节头、核心概念用仓耳今楷
- 数据标签、流程编号、图例、细粒度注释优先用 `--font-ui` 或 `--font-mono`
- 不要把整张高密度信息图都改成楷体；要保住扫读速度

## 截图契约

editorial 模板必须声明：

```html
<script>
  window.__CAPTURE_REQUIRED_FONTS__ = ['TsangerJinKai'];
</script>
```

这样 `$SKILL_DIR/scripts/capture.js` 会在截图前等待字体加载完成；如果仓耳今楷没命中，会直接报错，而不是悄悄回退成系统字体。

## 自检

- [ ] HTML 中没有 Google Fonts `@import`
- [ ] `{{LOCAL_FONT_FACE}}` 已替换为当前机器有效的 `file://` 字体路径
- [ ] `-l/-m` 的正文是仓耳今楷，不是系统 sans
- [ ] `-i` 的大标题是仓耳今楷，但高密度标签仍然易读
- [ ] 页面内声明了 `window.__CAPTURE_REQUIRED_FONTS__ = ['TsangerJinKai']`
