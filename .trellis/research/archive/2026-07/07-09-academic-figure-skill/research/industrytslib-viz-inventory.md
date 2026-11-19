# Research: industrytslib 可视化模块 API 面完整盘点

- **Query**: 完整盘点 industrytslib 可视化模块的 API 面（图表能力、样式系统、导出管线、集成入口），为 academic-figure skill 提供依据
- **Scope**: internal（只读调研 `industrytslib` 源码，未修改任何文件）
- **目标模块**: `D:\Documents\Code\Github\industrytslib\src\industrytslib\utils\visualization\`
- **Date**: 2026-07-09

---

## 0. 架构总览

```
visualization/
├── __init__.py            模块入口：create_plotter / plotter_builder / get_style / __getattr__ 延迟导出
├── core/                  核心抽象
│   ├── base.py            BasePlotter (ABC)，定义 ~19 个抽象 plot_* 方法 + 通用工具
│   ├── registry.py        PlotterRegistry / create_plotter / get_registry（自动注册 matplotlib+plotly）
│   ├── config.py          VisualizationConfig（颜色/尺寸/导出/性能），读环境变量
│   └── style_options.py   VisualizationStyleOptions（解析 style/language/labels/export_formats）+ 中英标签映射
├── backends/              后端实现（base + Mixin 组合）
│   ├── base_mixin.py      BaseTrainingPlotMixin / BaseEvaluationPlotMixin（共享 wrapper）
│   ├── matplotlib/        MatplotlibPlotter = 5 Mixin（Training/Evaluation/DataAnalysis/Attention/Specialized）+ MatplotlibBase
│   └── plotly/            PlotlyPlotter = 4 Mixin（Training/Evaluation/DataAnalysis/Specialized，无 Attention）+ PlotlyBase
├── charts/                轻量图表封装（dataclass，转调 create_plotter）+ 独立的生成模型/损失图表类
├── analysis/              模块级函数：序列/决策序列/降维/区间/联合训练/可靠性图
├── metrics/               RegressionMetrics / OutlierDetector / MetricsFormatter
├── report/                TrainingReportGenerator / TrainingReportData（Markdown 训练报告）
├── styles/                BaseStyle + 5 期刊风格 + FontManager + StyleManager
└── utils/                 FigureExporter（导出）/ DataProcessor（抽样）/ DirectoryManager（目录命名）
```

**两条使用路径**：

1. **Plotter 路径（后端无关）**：`create_plotter(backend, project_name, style=...)` → 调 `plotter.plot_xxx(...)`。方法由 Mixin 提供，matplotlib/plotly 双实现。
2. **Chart 路径（更短）**：`charts/` 下的 dataclass（`TimeSeriesChart` 等）内部再调 `create_plotter`；`analysis/` 下的模块级函数直接从 `.npy`/`DataFrame` 出图。

**关键设计点**：

- 全部延迟导入（`__getattr__` + 函数内 import），避免 matplotlib/plotly/umap 的导入副作用。
- 样式与文本解析分离：`BaseStyle`（视觉参数）+ `VisualizationStyleOptions`（语言/标签/导出格式）。
- 中文/学位论文模式通过 `VisualizationStyleOptions.resolve_text` 做英→中标签自动翻译。

---

## 1. 图表能力清单总表

### 1.1 Plotter 后端方法（matplotlib + plotly 双实现）

抽象契约定义于 `core/base.py:BasePlotter`；具体实现分散在各 Mixin。以下方法 **matplotlib 与 plotly 均支持**，除非标注。

| 方法                                | 定义/实现文件                                                | 画什么图                                                             | 关键参数                                                                             | 后端              |
| ----------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------- |
| `plot_train_result`                 | matplotlib `mixins/training_mixin.py:26` / plotly `:20`      | 训练中 真实值vs预测值 单变量对比                                     | `time_now, epoch, true_list, pred_list, save_path, final_flag, custom_title`         | 两者              |
| `plot_loss`                         | matplotlib `mixins/training_mixin.py:113` / plotly `:82`     | 训练/验证 损失曲线                                                   | `time_now, train_loss_list, vali_loss_list, save_path, custom_title`                 | 两者              |
| `plot_train_result_ndarray`         | `backends/base_mixin.py:55`（共享 wrapper）                  | 多维训练结果（flatten 后转 `plot_train_result`）                     | `true_array, pred_array, ylabel`                                                     | 两者              |
| `plot_test_result`                  | matplotlib `mixins/evaluation_mixin.py:28` / plotly `:27`    | 测试集 真实vs预测 对比（基础版）                                     | `time_now, true_list, pred_list, save_path, final_flag, custom_title`                | 两者              |
| `plot_test_result2`                 | matplotlib `mixins/evaluation_mixin.py:147` / plotly `:146`  | 增强版对比（带指标/置信区间等）                                      | 同上                                                                                 | 两者              |
| `plot_test_result_boxplot`          | matplotlib `mixins/evaluation_mixin.py:292` / plotly `:283`  | 测试结果误差箱线图                                                   | `time_now, true_list, pred_list, save_path, custom_title`                            | 两者              |
| `plot_model_comparison_boxplot`     | matplotlib `mixins/evaluation_mixin.py:335` / plotly `:328`  | 多模型误差对比箱线图                                                 | `time_now, error_dict{model:list}, save_path, custom_title`                          | 两者              |
| `plot_test_result_ndarray` / `...2` | `backends/base_mixin.py:135/154`（共享 wrapper）             | 多维测试结果（flatten 转基础/增强版）                                | `true_array, pred_array, ylabel`                                                     | 两者              |
| `plot_input_curve`                  | matplotlib `mixins/data_analysis_mixin.py:29` / plotly `:29` | 输入变量多子图时序曲线                                               | `input_df: pl.DataFrame, save_path`                                                  | 两者              |
| `plot_output_curve`                 | matplotlib `:114` / plotly `:114`                            | 输出变量时序曲线                                                     | `output_df, save_path`                                                               | 两者              |
| `plot_input_boxplot`                | matplotlib `:199` / plotly `:199`                            | 输入变量分布箱线图                                                   | `input_df, save_path`                                                                | 两者              |
| `plot_output_boxplot`               | matplotlib `:247` / plotly `:238`                            | 输出变量分布箱线图                                                   | `output_df, save_path`                                                               | 两者              |
| `plot_correlation_matrix`           | matplotlib `:295` / plotly `:277`                            | 特征相关性热力图                                                     | `correlation_matrix: pl.DataFrame, save_path, time_now, custom_title`                | 两者              |
| `plot_data_distribution`            | matplotlib `:356` / plotly `:324`                            | train/test 分布对比（直方图+箱线图，检测漂移）                       | `time_now, train_data, test_data, save_path, feature_name, custom_title`             | 两者              |
| `plot_joint_training_val_stage1`    | matplotlib `mixins/specialized_mixin.py:24` / plotly `:21`   | 联合训练验证阶段1对比                                                | `contrast_ndarrary: np.ndarray, save_path`                                           | 两者              |
| `plot_joint_training_val_stage2`    | matplotlib `:80` / plotly `:78`                              | 联合训练验证阶段2对比                                                | 同上                                                                                 | 两者              |
| `plot_joint_training_test`          | matplotlib `:148` / plotly `:148`                            | 联合训练测试对比                                                     | 同上                                                                                 | 两者              |
| `plot_attention_heatmap`            | matplotlib `mixins/attention_mixin.py:22`                    | 注意力权重热力图（1D聚合/2D完整），内部优先 seaborn，缺失回退 imshow | `attention_weights, save_path, time_now, attention_type, xlabel, ylabel, show_title` | **仅 matplotlib** |
| `plot_attention_bar`                | matplotlib `mixins/attention_mixin.py:118`                   | 通道注意力条形图（1D 向量）                                          | `attention_weights, save_path, time_now, attention_type, xlabel, ylabel`             | **仅 matplotlib** |

> 说明：`plot_train_result / plot_test_result / plot_loss` 是抽象方法（`base.py`），必须由后端实现；ndarray 版本是 `base_mixin.py` 里的共享 wrapper。

### 1.2 charts/ 轻量封装类（dataclass，转调 create_plotter）

统一字段：`backend: Literal["matplotlib","plotly"]="matplotlib"`, `style: str="ieee"`, `visualization_options=None`。

| 类.方法                                     | 文件                        | 画什么图                                             | 关键参数                                           | 后端      |
| ------------------------------------------- | --------------------------- | ---------------------------------------------------- | -------------------------------------------------- | --------- |
| `TimeSeriesChart.plot`                      | `charts/timeseries.py:34`   | 时序图（DataFrame→input_curve；array→train_result）  | `data, save_path, project_name, title`             | 两者      |
| `ComparisonChart.plot_true_vs_pred`         | `charts/comparison.py:33`   | 真实vs预测对比（转 plot_test_result）                | `true_data, pred_data, save_path, title, time_now` | 两者      |
| `ComparisonChart.plot_enhanced`             | `charts/comparison.py:71`   | 增强版对比（转 plot_test_result2）                   | 同上                                               | 两者      |
| `BoxplotChart.plot_features`                | `charts/boxplot.py:33`      | 输入/输出特征箱线图                                  | `data, save_path, feature_type="input"             | "output"` | 两者 |
| `BoxplotChart.plot_model_comparison`        | `charts/boxplot.py:61`      | 多模型对比箱线图                                     | `error_dict, save_path, title`                     | 两者      |
| `DistributionChart.plot_error_distribution` | `charts/distribution.py:33` | 误差分布图（转 plot_test_result_boxplot）            | `true_data, pred_data, save_path, title`           | 两者      |
| `HeatmapChart.plot_correlation`             | `charts/heatmap.py:37`      | 相关性热力图（自动算相关矩阵，支持 pl/pd DataFrame） | `data, save_path, title, time_now`                 | 两者      |

### 1.3 charts/ 独立图表类（生成模型 / 损失，主要 plotly，部分双后端）

| 类.方法                                                   | 文件                                 | 画什么图                                         | 关键参数                                                              | 后端   |
| --------------------------------------------------------- | ------------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------- | ------ |
| `DiffusionComparisonChart.plot_all`                       | `charts/diffusion_comparison.py:397` | 扩散生成 vs 真实 全套对比（时序+条件+统计+报告） | `real/gen x_control/x_quality/y, save_dir, project_name, config`      | plotly |
| `DiffusionComparisonChart.plot_timeseries_comparison`     | `:576`                               | 时序特征对比（样本曲线+均值±σ）                  | `real_x[N,T,D], gen_x, save_dir, project_name, feature_names, config` | plotly |
| `DiffusionComparisonChart.plot_condition_comparison`      | `:797`                               | 条件 Y 分布对比（散点/直方图/箱线/Q-Q）          | `real_y, gen_y, ...`                                                  | plotly |
| `DiffusionComparisonChart.plot_statistics_comparison`     | `:957`                               | 逐特征统计分布对比（直方图/箱线）                | `real_x, gen_x, feature_names, config`                                | plotly |
| `DiffusionComparisonChart.plot_tsne_comparison`           | `:1125`                              | 真实/生成 t-SNE 对比（先 PCA 降维）              | `real_x, gen_x, config(tsne_*)`                                       | plotly |
| `DiffusionComparisonChart.plot_feature_distribution_pngs` | `:280`                               | 逐特征分布 PNG 批量                              | `real, gen, save_dir, feature_names`                                  | plotly |
| `DiffusionComparisonChart.generate_report`                | `:1269`                              | 文本统计报告（含 KS 检验、分位数、边界命中）     | `real, gen, ...`                                                      | 文本   |
| `DiffusionLossChart.plot_vae_losses`                      | `charts/diffusion_loss.py:108`       | VAE 多分量损失曲线（重构/KL/滑动平均）           | `vae_losses: dict, save_path, project_name`                           | 双后端 |
| `DiffusionLossChart.plot_dit_losses`                      | `:389`                               | DiT 扩散损失曲线                                 | `dit_losses, save_path, project_name`                                 | 双后端 |
| `GenerationComparisonChart.plot_label_comparison`         | `charts/diffusion_loss.py:600`       | 标签分布对比                                     | `real_labels, gen_labels, save_path`                                  | 双后端 |
| `GenerationComparisonChart.plot_feature_distribution`     | `:822`                               | 特征分布对比                                     | `real, gen, save_path`                                                | 双后端 |
| `GenerationComparisonChart.plot_timeseries_comparison`    | `:1005`                              | 时序对比                                         | `real, gen, save_path`                                                | 双后端 |
| `GANLossChart.plot_losses`                                | `charts/gan_loss.py:120`             | GAN G/D 损失双 Y 轴曲线+滑动平均                 | `g_losses, d_losses, save_path, project_name`                         | 双后端 |
| `GANLossChart.plot_health_metrics`                        | `:469`                               | G/D 平衡度/判别器输出 健康指标曲线               | `metrics, save_path`                                                  | 双后端 |

### 1.4 analysis/ 模块级函数

| 函数                                    | 文件                             | 画什么图                                                           | 关键参数                                                                           | 后端       |
| --------------------------------------- | -------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------- |
| `plot_sequences_from_npy`               | `analysis/sequence.py:1314`      | 从 .npy 逐变量 真实vs预测 子图（多变量 3D 支持，可加 zoom inset）  | `data_dir, output_dir, draw_zoom=False, style="ieee"`                              | plotly     |
| `plot_full_timeline_html`               | `analysis/sequence.py:1504`      | 逐变量 全时域 真实vs预测（HTML，交互）                             | `data_dir, output_dir, style`                                                      | plotly     |
| `plot_full_timeline_png`                | `analysis/sequence.py:1764`      | 逐变量 全时域 干净 PNG（无 inset）                                 | `data_dir, output_dir, style`                                                      | matplotlib |
| `plot_npy_all`                          | `analysis/sequence.py:1871`      | 测试结果一键出图（seq+timeline html+png，向后兼容）                | `result_save_path, style`                                                          | 两者       |
| `plot_npy_all_train`                    | `analysis/sequence.py:1900`      | 训练结果一键出图（带 zoom）                                        | `result_save_path, style`                                                          | plotly     |
| `plot_npy_per_variable_random_batch`    | `analysis/sequence.py:1924`      | 逐变量随机 batch 对比（读 model_parameter.toml 识别 seq/pred_len） | `result_save_path, style`                                                          | plotly     |
| `plot_npy_per_variable_paper_samples`   | `analysis/sequence.py:2194`      | 论文级确定性选样出图 + 选择清单 manifest                           | `result_save_path, style`                                                          | plotly     |
| `tsne_plotter`                          | `analysis/dimensionality.py:52`  | t-SNE 2D 投影散点（jet 着色）                                      | `data[N,F], labels, perplexity=30, n_iter=1000, random_state=42, save_path, style` | matplotlib |
| `umap_plotter`                          | `analysis/dimensionality.py:136` | UMAP 投影散点（需 umap-learn）                                     | `data, labels, n_neighbors=15, min_dist=0.1, metric, save_path, style`             | matplotlib |
| `input_tsne`                            | `analysis/dimensionality.py:229` | DataFrame train/test t-SNE 对比图（返回 Figure）                   | `df, test_size, max_samples, label_col, colors, style`                             | matplotlib |
| `sequence_tsne_pca_analysis`            | `analysis/dimensionality.py:429` | 生成模型 序列模式 t-SNE+PCA（刘金波法，返回 {type:path}）          | `x_real,y_real,x_gen,y_gen, save_dir, n_samples, style_options, show_title`        | matplotlib |
| `plot_interval_report`                  | `analysis/interval.py:44`        | 区间样本分布直方图 + 区间误差(RMSE/MAPE)双柱图                     | `report: IntervalReport, output_dir, style, figsize, language="zh"`                | matplotlib |
| `plot_error_distribution`               | `analysis/interval.py:175`       | 误差-真实值散点（按区间 viridis 着色）                             | `report, pred_array, true_array, output_dir, language`                             | matplotlib |
| `build_overlapping_sequence`            | `analysis/joint_training.py:29`  | （工具）二维数组→重叠一维序列                                      | `data: np.ndarray[N,M]`                                                            | -          |
| `create_overlap_sequence_and_visualize` | `analysis/joint_training.py:72`  | 重叠序列构建+曲线图                                                | `input_dir, output_dir, data_filename, max_points_to_plot, style`                  | matplotlib |
| `save_reliability_diagram`              | `analysis/reliability.py:73`     | 校准可靠性图（对角线+分箱精度柱+ECE 注释），PDF+PNG                | `probabilities, binary_targets, output_path, bins=10, title, also_png`             | matplotlib |

**decision_sequence.py（过程控制决策可视化，领域专用，全部 matplotlib）** — 公开函数：
`plot_cv_decision_vs_history:1061`（CV 决策/实际/理想设定值曲线）、`plot_cv_actual_vs_wm_predicted:1199`、`plot_kpi_actual_vs_wm_predicted:1492`、`plot_cv_cumulative:1653`、`plot_kpi_cumulative:1769`、`plot_control_timeline_panels:1934`、`plot_kpi_timeline_panels:1987`、`plot_kpi_stage_timeline_panels:2087`、`plot_kpi_rollout_panels:2144`、`plot_kpi_stage_local_panels:2160`、`plot_kpi_summary_panels:2176`、`plot_kpi_shadow_diagnostics:2208`，以及文档生成 `write_plots_documentation:388` / `write_single_stage_case_readme:434` / `write_iv_c_readme:468`。这一族输入是 `rows: list[dict]`（控制/ KPI 时间线记录），面向 MPC/软测量决策报告，与通用学术制图关系较弱。

### 1.5 metrics/ 指标（非绘图，供注释/报告）

| 类/函数             | 文件                       | 作用                   | 关键 API                                                                                                              |
| ------------------- | -------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `RegressionMetrics` | `metrics/regression.py:24` | 回归指标               | `calculate_basic_metrics`(MAE/MSE/RMSE/R2)、`calculate_percentage_metrics`(MAPE/SMAPE/WMAPE)、`calculate_all_metrics` |
| `OutlierDetector`   | `metrics/outlier.py:23`    | 异常点检测（图中高亮） | `detect_outliers(data, method="iqr"                                                                                   | "zscore" | "modified_zscore", factor)`、`get_outlier_bounds` |
| `MetricsFormatter`  | `metrics/formatter.py:25`  | 指标格式化             | `format_for_display(metrics, precision, format_type="text"                                                            | "html"   | "latex"                                           | "compact")`、`format_as_table`、`create_metrics_table`、`format_metric_annotation` |

### 1.6 report/ 训练报告

`TrainingReportGenerator`（`report/training_report.py:160`）：`collect_experiment_info/model_info/data_info/training_progress/publish_decision/metrics/paths/time_info` 采集 → `generate_report()` 出 Markdown、`save_report()`、`save_metrics_json()`；内含 ASCII 损失趋势 `_render_loss_trend`。数据容器 `TrainingReportData:40`。

---

## 2. 样式系统

### 2.1 `StyleConfig` 全字段（`styles/base.py:18`，dataclass，默认值）

| 分组       | 字段（默认值）                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 基本信息   | `name="base"`, `display_name`, `description`                                                                                         |
| 尺寸(英寸) | `single_column_width=3.5`, `double_column_width=7.0`, `max_height=9.0`, `default_aspect_ratio=0.75`                                  |
| 字号       | `title_fontsize=14`, `label_fontsize=12`, `tick_fontsize=10`, `legend_fontsize=10`, `annotation_fontsize=9`                          |
| 字体       | `font_family="serif"`, `font_name="Times New Roman"`, `cjk_font_name=None`, `plotly_font_family=None`                                |
| 线条/标记  | `line_width=1.3`, `line_width_thin=1.0`, `line_width_thick=1.5`, `marker_size=6`, `marker_edge_width=1.0`                            |
| 颜色       | `colors=[8色]`, `primary_color`, `secondary_color`, `tertiary_color`, `grid_color`, `background_color=#FFFFFF`, `text_color=#000000` |
| 网格       | `show_grid=True`, `grid_style=":"`, `grid_alpha=0.5`, `grid_linewidth=0.5`, `grid_which="major"`                                     |
| 边框       | `show_spines=True`, `spine_linewidth=0.75`                                                                                           |
| DPI        | `dpi=300`, `screen_dpi=100`                                                                                                          |
| Plotly     | `plotly_template="plotly_white"`                                                                                                     |
| 边距(比例) | `margin_left=0.15`, `margin_right=0.05`, `margin_top=0.1`, `margin_bottom=0.15`                                                      |

`BaseStyle`（`base.py:101`）方法：`get_figure_size(column_type, aspect_ratio)`、`get_figure_size_pixels`、`get_colors(n)`（循环取色）、`get_matplotlib_rcparams()`、`get_plotly_font_family()`、`get_plotly_layout(title,width,height)`、`get_plotly_axis_config`、`get_plotly_line_style`、`apply_to_matplotlib_axes(ax)`。

### 2.2 五种风格关键参数对比

| 参数                          | IEEE                                                                 | Elsevier                                      | Nature                                                                      | Springer                                                     | Chinese Thesis                                                                      |
| ----------------------------- | -------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 文件                          | `ieee.py`                                                            | `elsevier.py`                                 | `nature.py`                                                                 | `springer.py`                                                | `chinese_thesis.py`                                                                 |
| 单栏宽(in)                    | 3.5                                                                  | 3.54 (90mm)                                   | 3.5 (89mm)                                                                  | 3.31 (84mm)                                                  | 3.5                                                                                 |
| 双栏宽(in)                    | 7.16                                                                 | 7.48 (190mm)                                  | 7.2 (183mm)                                                                 | 6.85 (174mm)                                                 | 6.8                                                                                 |
| max_height                    | 4.0                                                                  | 9.45                                          | 9.0                                                                         | 9.25                                                         | 4.8                                                                                 |
| aspect_ratio                  | 0.45                                                                 | 0.7                                           | 0.75                                                                        | 0.75                                                         | 0.55                                                                                |
| 字体族/字体                   | serif / Times New Roman                                              | _(继承 serif/Times)_                          | _(继承 serif/Times)_                                                        | _(继承 serif/Times)_                                         | serif/Times + **cjk=SimSun**                                                        |
| title/label/tick/legend/annot | 11/11/9/9/9                                                          | 11/10/9/9/8                                   | 10/9/8/8/7                                                                  | 10/9/8/8/7                                                   | 10.5/10.5/10.5/10.5/10.5                                                            |
| line_width(主/细/粗)          | 1.4/1.05/1.8                                                         | 1.25/0.75/1.75                                | 1.0/0.5/1.5                                                                 | 1.0/0.5/1.5                                                  | 1.2/0.8/1.2                                                                         |
| DPI                           | 600                                                                  | 300                                           | 300                                                                         | 300                                                          | 600                                                                                 |
| 主色 primary                  | #E53935 红                                                           | #1f77b4 蓝                                    | #0072B2 蓝                                                                  | #000000 黑                                                   | #E53935 红                                                                          |
| 网格                          | 实线 α0.35                                                           | 实线 α0.3                                     | **show_grid=False**                                                         | 虚线 α0.5                                                    | 实线 α0.35                                                                          |
| plotly_template               | plotly_white                                                         | plotly_white                                  | simple_white                                                                | plotly_white                                                 | plotly_white                                                                        |
| 特殊                          | `get_grayscale_colors/get_line_styles/get_marker_styles`（黑白区分） | `get_colorblind_safe_colors`（Wong 色盲安全） | 覆写 `apply_to_matplotlib_axes`（仅左+下边框）、`get_plotly_layout`（简洁） | `get_grayscale_colors/get_print_friendly_colors`（灰度优先） | `get_grayscale_colors/get_line_styles/get_marker_styles`；plotly_font_family=CJK 链 |

> **重要 caveat**：Elsevier/Nature/Springer 的 docstring 声称使用 Arial/Helvetica sans 字体，但它们的 `_create_config()` **并未覆写** `font_family`/`font_name`，实际继承 `StyleConfig` 默认的 `serif` + `Times New Roman`。若 skill 需要真正的无衬线，需要显式覆盖。

### 2.3 字体管理 `FontManager`（`styles/fonts.py:25`）

- **API**：`initialize(force_rebuild=False)`、`get_cjk_font_family()`（返回 matplotlib 第一个可解析的 CJK 族）、`get_cjk_fallback_fonts()`、`get_cjk_serif_fallback_fonts()`、`contains_cjk_text(text)`、`get_available_fonts()`、`has_local_fonts()`、`get_font_config()`。
- **字体发现顺序**：先扫本地 `fonts/`、`examples/fonts/`（cwd 与 repo 根）；再注册系统 CJK 字体；无本地字体则退回系统 serif 链。
- **CJK 回退链**：sans 链 `_fallback_fonts`（Noto Sans CJK SC / Source Han Sans / Microsoft YaHei / SimHei / PingFang SC …）；serif 链 `_serif_fallback_fonts`（SimSun / NSimSun / Songti SC / STSong / Noto Serif CJK SC …）。
- **IEEE serif 优先**：Times New Roman 置首，CJK 作为中文字符 fallback；数学字体 `mathtext.fontset=stix`。
- **中文强制注入**：`core/style_options.py:apply_visualization_options_to_matplotlib` 在 `uses_chinese_text` 时，把 `FontManager.get_cjk_font_family()` 实测可用字体强插到 `font.serif`/`font.sans-serif` 首位，避免中文豆腐块。
- **⚠ Windows caveat**：`_candidate_system_font_dirs()` 只列了 Linux/macOS 路径（`/usr/share/fonts`、`~/.fonts` 等），**不含 `C:\Windows\Fonts`**。在 Windows 上系统 CJK 字体不会被本模块主动 `addfont`；依赖 matplotlib 自带字体注册表（SimSun/Microsoft YaHei 通常已内置可用）或放字体到本地 `./fonts`。chinese_thesis 用 SimSun 在 Windows 一般可正常渲染。

### 2.4 `StyleManager`（`styles/manager.py:29`）

职责：注册/查询/切换风格。类方法 `register`、`get_style(name)`（延迟实例化 + `_instances` 缓存）、`set_current_style`、`get_current_style`、`list_available()`、`_ensure_default_styles()`（注册 ieee/elsevier/nature/springer/chinese_thesis 五种）、`apply_style_to_matplotlib(style_name)`（初始化字体 + 应用 rcParams + prop_cycle）、`get_style_info(name)`。

### 2.5 `styles/__init__.py` 导出

- `get_style(name="ieee") -> BaseStyle`（转 `StyleManager.get_style`）
- `get_available_styles() -> list[str]`（转 `StyleManager.list_available`，**实际返回 5 个**：ieee/elsevier/nature/springer/chinese_thesis）
- 另导出 `BaseStyle, StyleConfig, IEEEStyle/…/ChineseThesisStyle, FontManager, StyleManager, get_style_manager, get_font_manager`。

> caveat：`visualization/__init__.py` 顶部 docstring 仍写 "get_available_styles → 4 styles"，已过时（现有 5 种，含 chinese_thesis）。

---

## 3. 导出管线（`utils/export.py`）

### 3.1 `FigureExporter(backend)`（`export.py:80`）

- `save_plotly_figure(fig, html_path, png_path=None, size=None, extra_paths=None, force_save_png=False)` → 写 HTML（若 `save_html`），写 PNG（若 `save_png` 或 `force_save_png`），并按 `extra_paths` 写 PDF/SVG。返回 `{format: bool}`。
- `save_matplotlib_figure(fig, png_path, size=None, dpi=None, close_fig=True, extra_paths=None)` → `fig.savefig` PNG（`bbox_inches="tight"`, `facecolor=white`），按 `extra_paths` 追加 PDF/SVG，可自动 `plt.close`。
- **支持格式**：`html`（仅 plotly）、`png`、`pdf`、`svg`。`SUPPORTED_EXPORT_FORMATS=("png","pdf","svg","html")`（见 `core/style_options.py`）。

### 3.2 Kaleido 版本兼容

- `get_kaleido_version() -> (major,minor,patch)|None`、`is_kaleido_available()`、`is_kaleido_1_or_above()`。
- Plotly 静态图（png/pdf/svg）经 `fig.write_image` 依赖 **Kaleido**；未安装则 warn 并跳过（`uv add kaleido`）；0.x 旧版导出失败会提示升级到 `kaleido>=1.0`。
- matplotlib PNG 不依赖 Kaleido。

### 3.3 环境变量行为

| 环境变量                        | 读取处                                                    | 行为                                                                                |
| ------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `INDUSTRYTSLIB_EXPORT_PNG`      | `core/config.py:ExportConfig.save_png` + `_load_from_env` | `"1"/"true"/"yes"` 才开启 PNG 保存；**默认关闭**。影响走 plotly 路径的 `save_png`。 |
| `INDUSTRYTSLIB_PNG_DPI`         | `core/config.py:_load_from_env`                           | 覆盖 `export.png_dpi`（默认 600）                                                   |
| `INDUSTRYTSLIB_WEBGL_THRESHOLD` | `core/config.py:_load_from_env`                           | 覆盖 `performance.webgl_threshold`（默认 50000），点数超阈值走 WebGL                |

`ExportConfig` 其它默认：`save_html=True`, `png_scale=2`, `png_quality=95`, `use_project_prefix=False`, `backend_subdirs=True`, `category_subdirs=True`。

---

## 4. 集成入口

### 4.1 核心 API

- `create_plotter(backend, project_name, style="ieee", visualization_options=None, **kwargs) -> BasePlotter`（`core/registry.py:145`）——推荐入口，后端无关，注册表自动懒注册 matplotlib/plotly。
- `plotter_builder(plotter_type, project_name, style="ieee")`（`__init__.py:57`）——`create_plotter` 的校验封装（校验 project_name 非空）。
- `PlotterRegistry`（`core/registry.py:28`）：`register/get/create/list_available`；`get_registry()` 返回全局单例并注册默认后端。
- `plotter.set_style(style_name)`（`core/base.py:95`）——运行时切换风格（重解析 options + 应用 overrides）。
- `plotter.set_visualization_options(options)`（`core/base.py:107`）——应用 `VisualizationStyleOptions`（语言/标签/导出格式）。
- `VisualizationStyleOptions`（`core/style_options.py:151`）+ `resolve_visualization_style_options(config)`：解析 style/language/title_mode/prefer_grayscale/dense_text/export_formats/labels/fonts 等；`resolve_text` 做英→中标签翻译（`CHINESE_LABELS` 覆盖大量术语）。

### 4.2 三个最短路径示例

**示例 1 — 时序预测对比图（matplotlib, IEEE）**

```python
from pathlib import Path
from industrytslib.utils.visualization import create_plotter

plotter = create_plotter("matplotlib", "MyProject", style="ieee")
plotter.plot_test_result(
    time_now="20260709_120000",
    true_list=y_true, pred_list=y_pred,
    save_path=Path("out/pred.png"),
    custom_title="Prediction vs Truth",
)
# 方法来源: backends/matplotlib/mixins/evaluation_mixin.py:plot_test_result
# 更短的封装等价: charts/comparison.py:ComparisonChart.plot_true_vs_pred
#   ComparisonChart(backend="matplotlib", style="ieee").plot_true_vs_pred(y_true, y_pred, Path("out/pred.png"))
```

**示例 2 — 相关性热力图**

```python
from pathlib import Path
import polars as pl
from industrytslib.utils.visualization.charts import HeatmapChart

HeatmapChart(backend="matplotlib", style="ieee").plot_correlation(
    df, Path("out/corr.png"), title="Feature Correlation",
)
# charts/heatmap.py:HeatmapChart.plot_correlation
#   → 内部转 backends/*/mixins/data_analysis_mixin.py:plot_correlation_matrix
#   非方阵会自动 df.select(cs.numeric()).corr()
```

**示例 3 — t-SNE 降维图**

```python
from pathlib import Path
from industrytslib.utils.visualization import tsne_plotter   # __getattr__ 延迟导出

tsne_plotter(data, labels, perplexity=30.0, save_path=Path("out"), style="ieee")
# 生成 out/tsne_plot.png ; 来源 analysis/dimensionality.py:tsne_plotter (matplotlib)
```

---

## 5. 对 academic-figure skill 的建议

### 5.1 该库已覆盖的能力（skill 可直接复用，不要重造）

- **完整期刊样式系统**：IEEE/Elsevier/Nature/Springer/中文学位论文（燕山大学 2024 规范），含正确的单双栏宽度、字号、DPI、配色、网格/边框规范。
- **双后端**：matplotlib（静态发表级）+ plotly（交互/HTML）。
- **时序预测对比**（单/多变量、全时域、随机 batch、论文选样）、**相关性热力图**、**箱线图**（特征/多模型/误差）、**分布对比**（train/test 漂移）、**降维**（t-SNE/UMAP/PCA、序列模式）、**损失曲线**（train/val、VAE、DiT、GAN）、**注意力图**（matplotlib）、**可靠性校准图**、**区间分析**、**联合训练重叠序列**。
- **指标与格式化**：MAE/MSE/RMSE/R²/MAPE/SMAPE/WMAPE、异常检测、`text/html/latex/compact` 注释格式化。
- **训练报告**：Markdown + metrics JSON 自动生成。
- **导出**：png/pdf/svg/html + Kaleido 兼容 + 环境变量控制。
- **中文支持**：`chinese_thesis` 风格 + `language="zh"` 触发 `CHINESE_LABELS` 英→中标签自动翻译。

### 5.2 skill 还需补齐/注意的部分

- **seaborn 不是该库后端**：仅 `attention_mixin` 内部可选用 seaborn 画热力图（缺失自动回退 imshow）。若 skill 需要 seaborn 统计图（violin/pairplot/jointplot/clustermap/回归带），该库无对应 API，需 skill 自行实现，但可复用 `StyleManager.apply_style_to_matplotlib(style)` / `apply_visualization_options_to_matplotlib(options)` 统一风格。
- **无通用 scatter/bar/pie/violin 顶层 API**：plotter 层只暴露业务化方法（train/test/loss/box/corr/dist/attention）。任意学术图需走原生 matplotlib + 先套样式。
- **独立脚本场景**：直接用原生 matplotlib 时，务必先调用 `StyleManager.apply_style_to_matplotlib("ieee")` 或 `apply_visualization_options_to_matplotlib(resolve_visualization_style_options({"style": ...}))`，否则不套样式且中文可能豆腐块（后者会强制注入 CJK 字体）。`analysis/` 与 `charts/` 内部已自动处理。
- **Windows 字体**：系统字体目录发现只覆盖 Linux/macOS；Windows 上依赖 matplotlib 内置字体（SimSun/YaHei 通常在），或把字体丢进本地 `./fonts`。中文场景先验证 `FontManager.get_cjk_font_family()` 返回非 None。
- **Plotly PNG 导出前置**：需装 Kaleido；且走 plotly 路径时 PNG 默认关闭，需设 `INDUSTRYTSLIB_EXPORT_PNG=1` 或显式 `export_formats`。matplotlib PNG 无此限制。
- **决策序列族（decision_sequence.py）**是过程控制/MPC 决策报告专用，输入为控制/KPI 时间线记录 dict，不建议作为通用学术制图入口。
- **过时文档**：`__init__.py` docstring 说 4 种风格（实为 5）；Elsevier/Nature/Springer docstring 声称 sans 字体实为 serif/Times。skill 文档不要照抄这些描述。

### 5.3 调用注意事项

- **优先 `create_plotter`（注册表）** 而非直接 import 后端类——后端无关且懒加载。
- **延迟导入**：matplotlib/plotly/umap/seaborn/kaleido 都是运行时导入，缺失时对应功能 warn/skip，不影响 import。
- **样式隔离**：`plotter.style` 返回的是 `deepcopy`，逐 plotter 覆盖不污染全局预设（`core/base.py:81`）。
- **环境变量**：`INDUSTRYTSLIB_EXPORT_PNG` / `INDUSTRYTSLIB_PNG_DPI` / `INDUSTRYTSLIB_WEBGL_THRESHOLD`。

---

## Caveats / Not Found

- 大文件（sequence.py 2393 行、decision_sequence.py 2298 行、diffusion_comparison.py 1808 行、diffusion_loss.py 1251 行、training_report.py 925 行、gan_loss.py 611 行）**仅提取公开函数/方法签名与 docstring 摘要**，未逐行读入；内部私有辅助函数（`_` 前缀）未全部展开。
- `decision_sequence.py` 各 `plot_kpi_*` 函数仅取名称与首行 docstring，未逐一记录全部参数（领域专用、与通用学术图关联弱）。
- 未运行任何代码验证渲染效果；结论基于源码静态阅读。
- Elsevier/Nature/Springer 的字体实际值（serif/Times）为静态推断（配置未覆写默认），未运行时确认。
