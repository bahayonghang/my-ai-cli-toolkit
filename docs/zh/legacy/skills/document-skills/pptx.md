# pptx

::: warning 历史文档
此页仅用于历史参考与兼容旧链接；对应的 skill 已不再由本仓库的 `content/skills/` 一方目录提供。
:::

创建、读取、编辑和设计 PowerPoint 演示文稿（.pptx 文件）。

## 使用场景

- 创建幻灯片和演示文稿
- 读取和提取现有演示文稿的文本
- 编辑和更新演示文稿内容
- 使用模板、布局和演讲者备注
- 将演示文稿转换为图片进行审查

## 工作原理

| 任务 | 方法 |
|------|------|
| 读取/分析内容 | `python -m markitdown presentation.pptx` |
| 编辑或使用模板 | 解包 → 编辑 XML → 重新打包 |
| 从头创建 | 使用 `pptxgenjs`（JavaScript）|

## 快速参考

### 读取内容

```bash
# 提取文本
python -m markitdown presentation.pptx

# 视觉概览（缩略图网格）
python scripts/thumbnail.py presentation.pptx

# 访问原始 XML
python scripts/office/unpack.py presentation.pptx unpacked/
```

### 转换为图片

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

生成 `slide-01.jpg`、`slide-02.jpg` 等文件。

## 设计指南

### 配色方案

选择与主题匹配的颜色：

| 主题 | 主色 | 辅色 | 强调色 |
|------|------|------|--------|
| 午夜商务 | `1E2761` | `CADCFC` | `FFFFFF` |
| 森林苔藓 | `2C5F2D` | `97BC62` | `F5F5F5` |
| 珊瑚活力 | `F96167` | `F9E795` | `2F3C7E` |
| 海洋渐变 | `065A82` | `1C7293` | `21295C` |

### 字体规范

| 元素 | 大小 |
|------|------|
| 幻灯片标题 | 36-44pt 粗体 |
| 章节标题 | 20-24pt 粗体 |
| 正文 | 14-16pt |
| 说明文字 | 10-12pt |

### 布局技巧

- **每张幻灯片都需要视觉元素** — 图片、图表、图标或形状
- 使用双栏布局（左侧文字，右侧插图）
- 大数字标注（60-72pt 数字配小标签）
- 最小边距 0.5"，内容块间距 0.3-0.5"

### 避免常见错误

- 不要在所有幻灯片上重复相同布局
- 不要居中正文 — 段落左对齐
- 不要使用低对比度元素
- 永远不要在标题下使用装饰线（AI 特征）
- 不要创建纯文字幻灯片

## QA 流程

**每个演示文稿必须执行：**

1. **内容 QA**：检查缺失内容、错别字
   ```bash
   python -m markitdown output.pptx
   ```

2. **视觉 QA**：转换为图片并检查每张幻灯片
   - 检查元素重叠
   - 检查文字溢出
   - 验证间距和对齐

3. **验证循环**：修复 → 重新验证 → 重复

## 依赖项

| 工具 | 用途 |
|------|------|
| `markitdown[pptx]` | 文本提取 |
| `Pillow` | 缩略图网格 |
| `pptxgenjs`（npm）| 从头创建 |
| `LibreOffice` | PDF 转换 |
| `Poppler` | PDF 转图片 |

## 输出

- 位置：工作目录或指定路径
- 格式：`.pptx`（Office Open XML 演示文稿）
