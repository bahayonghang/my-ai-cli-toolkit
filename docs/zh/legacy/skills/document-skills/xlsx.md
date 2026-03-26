# xlsx

::: warning 历史文档
此页仅用于历史参考与兼容旧链接；对应的 skill 已不再由本仓库的 `content/skills/` 一方目录提供。
:::

创建、读取、编辑和分析 Excel 电子表格（.xlsx 文件）。

## 使用场景

- 创建包含数据、公式和格式的新 Excel 文件
- 编辑现有电子表格并保留公式
- 使用 pandas 进行数据分析和可视化
- 构建符合规范的财务模型
- 提取和转换表格数据

## 工作原理

本技能使用 Python 库进行 Excel 操作：

| 库 | 最适用于 |
|----|----------|
| `pandas` | 数据分析、批量操作、简单导出 |
| `openpyxl` | 复杂格式、公式、Excel 特定功能 |

## 快速参考

### 读取数据

```python
import pandas as pd

# 读取 Excel
df = pd.read_excel('file.xlsx')  # 第一个工作表
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # 所有工作表

# 分析
df.head()      # 预览
df.describe()  # 统计信息
```

### 创建文件

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

wb = Workbook()
sheet = wb.active

# 添加数据和公式
sheet['A1'] = '收入'
sheet['B1'] = 1000
sheet['B2'] = '=SUM(B1:B10)'  # 使用公式，不要硬编码！

# 格式化
sheet['A1'].font = Font(bold=True)
wb.save('output.xlsx')
```

### 重新计算公式

```bash
# 添加公式后必须执行
python scripts/recalc.py output.xlsx
```

## 核心功能

### 公式最佳实践

- **始终使用 Excel 公式**，而不是在 Python 中计算
- 使用单元格引用（`=B5*(1+$B$6)`）而非硬编码值
- 保存后运行 `scripts/recalc.py` 计算值

### 财务模型规范

| 元素 | 约定 |
|------|------|
| 蓝色文字 | 硬编码输入 |
| 黑色文字 | 公式 |
| 绿色文字 | 来自其他工作表的链接 |
| 黄色背景 | 关键假设 |

### 数字格式

- 货币：`$#,##0`，在表头标注单位
- 百分比：`0.0%` 格式
- 负数：使用括号 `(123)` 而非 `-123`
- 零值：显示为 `-`

## 常见工作流

1. **选择工具**：pandas 用于数据，openpyxl 用于公式/格式
2. **创建/加载**：创建新文件或加载现有文件
3. **修改**：添加数据、公式、格式
4. **保存**：写入文件
5. **重新计算**：运行 `scripts/recalc.py`
6. **验证**：检查公式错误（#REF!、#DIV/0! 等）

## 依赖项

| 工具 | 用途 |
|------|------|
| `pandas` | 数据分析 |
| `openpyxl` | Excel 文件操作 |
| `LibreOffice` | 公式重新计算 |

## 输出

- 位置：工作目录或指定路径
- 格式：`.xlsx`（Office Open XML 电子表格）
