# Design：缺陷修复

## 无 LaTeX 降级机制

- 判定：`USE_TEX = shutil.which("latex") is not None and os.environ.get("ACADEMIC_FIGURE_NO_TEX") != "1"`。
  环境变量供测试强制走降级路径。
- 标签：每个脚本在数据区之后定义 `label_bold(text)` 等最小局部函数；`USE_TEX` 为真时
  返回 `\textbf{...}`，否则返回原文并由调用处传 `fontweight="bold"`。`\%` 在降级
  路径改为 `%`。不抽取公共模块，保持目录脚本自包含。
- 字体：降级路径设 `mathtext.fontset = "cm"`、`axes.formatter.use_mathtext = True`。

## plotly 字号规则

- 画布用逻辑像素，按 72 px/in 计算：`width_px = width_in * 72`。
- 字号直接写 pt 数值（逻辑像素 = pt）。
- 导出：`scale = DPI / 72`。PDF 为矢量，尺寸为 `width_in`。
- 该规则只写在 `plotly-recipes.md`；`qa-checklist.md` 引用该节。

## 配色唯一定义

- `matplotlib-recipes.md` 色表节定义 `OKABE_ITO`（8 色，第 8 色 `#000000`）与
  `NEUTRAL_GRAY = "#999999"`。其他文件只写「见 `matplotlib-recipes.md` 色表」。

## 路径存在性测试

- 扫描 `SKILL.md` 与 `references/modes/*.md` 中形如 `` `references/...` ``、
  `` `scripts/...` ``、`` `assets/...` `` 的反引号片段；去掉 `<skill-dir>/` 前缀后
  相对 skill 根目录检查存在。含 `*` 或 `<` 的片段跳过。
