# pdf

::: warning 历史文档
此页仅用于历史参考与兼容旧链接；对应的 skill 已不再由本仓库的 `content/skills/` 一方目录提供。
:::

处理 PDF 文件：读取、创建、合并、拆分、提取内容等。

## 使用场景

- 读取和提取 PDF 中的文本/表格
- 合并多个 PDF 为一个文件
- 拆分 PDF 为单独文件
- 旋转页面和添加水印
- 使用 reportlab 创建新 PDF
- 对扫描 PDF 进行 OCR
- 填写 PDF 表单
- 加密/解密 PDF

## 快速参考

| 任务 | 最佳工具 |
|------|----------|
| 合并 PDF | pypdf |
| 拆分 PDF | pypdf |
| 提取文本 | pdfplumber |
| 提取表格 | pdfplumber |
| 创建 PDF | reportlab |
| OCR 扫描 PDF | pytesseract |
| 命令行合并 | qpdf |

## Python 库

### pypdf - 基础操作

```python
from pypdf import PdfReader, PdfWriter

# 读取 PDF
reader = PdfReader("document.pdf")
print(f"页数: {len(reader.pages)}")

# 提取文本
for page in reader.pages:
    text = page.extract_text()

# 合并 PDF
writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as f:
    writer.write(f)
```

### pdfplumber - 文本和表格

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        # 提取文本
        text = page.extract_text()

        # 提取表格
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

### reportlab - 创建 PDF

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

c.drawString(100, height - 100, "Hello World!")
c.save()
```

**重要**：在 reportlab 中不要使用 Unicode 上下标字符。使用 `<sub>` 和 `<super>` 标签：

```python
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

styles = getSampleStyleSheet()
chemical = Paragraph("H<sub>2</sub>O", styles['Normal'])
```

## 命令行工具

### pdftotext (poppler-utils)

```bash
# 提取文本
pdftotext input.pdf output.txt

# 保留布局
pdftotext -layout input.pdf output.txt
```

### qpdf

```bash
# 合并 PDF
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# 拆分页面
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf

# 移除密码
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf
```

## 常见任务

### 添加水印

```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as f:
    writer.write(f)
```

### OCR 扫描 PDF

```python
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path('scanned.pdf')
text = ""
for image in images:
    text += pytesseract.image_to_string(image)
```

### 密码保护

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.encrypt("userpassword", "ownerpassword")
with open("encrypted.pdf", "wb") as f:
    writer.write(f)
```

## 依赖项

| 工具 | 用途 |
|------|------|
| `pypdf` | 基础 PDF 操作 |
| `pdfplumber` | 文本和表格提取 |
| `reportlab` | 创建新 PDF |
| `pytesseract` | OCR |
| `pdf2image` | PDF 转图片 |
| `qpdf` | 命令行操作 |
| `poppler-utils` | pdftotext、pdfimages |

## 输出

- 位置：工作目录或指定路径
- 格式：`.pdf`（便携式文档格式）
