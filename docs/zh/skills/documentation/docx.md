# docx

创建、读取、编辑和操作 Word 文档（.docx 文件）。

## 使用场景

- 创建带格式的专业 Word 文档（目录、页眉、页码）
- 使用修订追踪编辑现有 .docx 文件
- 为文档添加批注和回复
- 从 Word 文件中提取内容
- 格式转换（.doc → .docx、.docx → PDF/图片）
- Word 文档中的查找替换操作

## 工作原理

`.docx` 文件是一个包含 XML 文件的 ZIP 压缩包。本技能提供两种主要方法：

| 任务 | 方法 |
|------|------|
| 创建新文档 | 使用 `docx-js`（JavaScript 库）|
| 编辑现有文档 | 解包 → 编辑 XML → 重新打包 |

## 快速参考

### 创建新文档

```javascript
const { Document, Packer, Paragraph, TextRun } = require('docx');

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 }, // US Letter（DXA 单位）
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      new Paragraph({ children: [new TextRun("Hello World")] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => fs.writeFileSync("doc.docx", buffer));
```

### 编辑现有文档

```bash
# 步骤 1：解包
python scripts/office/unpack.py document.docx unpacked/

# 步骤 2：编辑 unpacked/word/ 中的 XML 文件

# 步骤 3：重新打包
python scripts/office/pack.py unpacked/ output.docx --original document.docx
```

### 读取内容

```bash
# 提取文本（包含修订追踪）
pandoc --track-changes=all document.docx -o output.md

# 访问原始 XML
python scripts/office/unpack.py document.docx unpacked/
```

### 接受修订

```bash
python scripts/accept_changes.py input.docx output.docx
```

### 添加批注

```bash
# 添加批注
python scripts/comment.py unpacked/ 0 "批注内容"

# 回复批注 0
python scripts/comment.py unpacked/ 1 "回复内容" --parent 0
```

## 核心功能

### 文档创建（docx-js）

- **页面设置**：US Letter（12240×15840 DXA）或 A4（11906×16838 DXA）
- **样式**：使用自定义字体/大小覆盖内置标题样式
- **列表**：使用 `LevelFormat.BULLET` 或 `LevelFormat.DECIMAL`（禁止使用 Unicode 符号）
- **表格**：始终使用 `WidthType.DXA`，同时设置表格和单元格宽度
- **图片**：必须指定 `type` 参数（png/jpg 等）
- **目录**：仅使用 `HeadingLevel`，样式中需包含 `outlineLevel`

### XML 编辑

- **修订追踪**：`<w:ins>` 表示插入，`<w:del>` 表示删除
- **批注**：使用 `comment.py` 辅助工具，然后在 document.xml 中添加标记
- **智能引号**：使用 XML 实体（`&#x201C;`、`&#x201D;` 等）
- **验证**：重新打包时自动修复常见问题

## 关键规则

| 规则 | 原因 |
|------|------|
| 显式设置页面大小 | docx-js 默认为 A4 |
| 禁止在文本中使用 `\n` | 使用独立的 Paragraph 元素 |
| 禁止使用 Unicode 项目符号 | 使用 numbering 配置 |
| PageBreak 必须在 Paragraph 内 | 独立使用会产生无效 XML |
| 表格使用 `WidthType.DXA` | 百分比在 Google Docs 中会出错 |
| 使用 `ShadingType.CLEAR` | SOLID 会导致黑色背景 |

## 依赖项

| 工具 | 用途 |
|------|------|
| `docx`（npm）| 创建新文档 |
| `pandoc` | 文本提取 |
| `LibreOffice` | PDF 转换、接受修订 |
| `Poppler` | PDF 转图片（`pdftoppm`）|

## 脚本参考

| 脚本 | 描述 |
|------|------|
| `scripts/office/unpack.py` | 解包并格式化 DOCX XML |
| `scripts/office/pack.py` | 验证并重新打包为 DOCX |
| `scripts/office/validate.py` | 验证 DOCX 结构 |
| `scripts/office/soffice.py` | LibreOffice 封装器 |
| `scripts/accept_changes.py` | 接受所有修订 |
| `scripts/comment.py` | 添加批注/回复 |

## 输出

- 位置：工作目录或指定路径
- 格式：`.docx`（Office Open XML）
