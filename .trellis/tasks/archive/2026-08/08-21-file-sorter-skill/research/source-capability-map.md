# AI File Sorter 能力地图与 skill 转化边界

日期：2026-08-21  
源树：`ref/repo/ai-file-sorter`（仓库 `ref/` 为 ignored 参考区，不是第一方源）  
版本锚点：`README.md` 记录 Code 1.9.2（2026-08-14）

## 1. 源项目在做什么

`AI File Sorter` 是 Qt6 桌面应用：对一个文件夹或同一父目录下的文件做分析，给出主类/子类和可选新文件名，用户审阅后再移动或重命名。它可以完全本地运行（GGUF），也可以接远程 API。

对 skill 有用的是规则与审阅合同，不是 GUI、模型运行时或发行管道。

## 2. 工作流

```text
scan
  -> optional content analysis (image / document / media tags)
  -> categorize (LLM + whitelist + cache/learning hints)
  -> post-normalize labels
  -> optional rename suggestion
  -> review plan
  -> apply or dry-run
  -> undo sidecar
```

无 GUI 入口把同一条链暴露为：

```text
--headless --operation categorize|rename|categorize-and-rename
--review-only | --auto-apply
--headless-apply --review-file
```

证据：`docs/headless-runtime-contract.md:16-53`、`docs/architecture.md:7-52`。

## 3. 应进入 skill 的规则

### 3.1 文件族与候选主类

`FileCategoryPolicy::determine_main_category_selection`（`app/lib/FileCategoryPolicy.cpp:297-325`）按扩展名分族：

| 族 | 扩展名（源表） | 候选主类 |
|---|---|---|
| image | jpg/jpeg/png/bmp/gif/webp/tif/tiff/tga/psd/hdr/pic/pnm/ppm/pgm/pbm/heic/heif/avif/ico/svg | Images |
| document | txt/md/markdown/rtf/csv/tsv/log/json/xml/yml/yaml/ini/cfg/conf/html/htm/tex/rst/pdf/docx/xlsx/pptx/odt/ods/odp/doc/xls/ppt | Documents, Presentations, Spreadsheets, Data Exports, Configs |
| software | exe/msi/msix/msixbundle/appx/appxbundle/deb/rpm/pkg/dmg/appimage/apk/run/bat/cmd/com | Software, Installers, Drivers, Operating Systems, Other |
| archive | zip/7z/rar/tar/gz/bz2/xz/tgz/tbz/tbz2/txz/tar.gz/tar.bz2/tar.xz | Archives, Software, Data Exports, Other |
| audio | aac/aif/aiff/alac/ape/flac/m4a/mp3/ogg/oga/opus/wav/wma | Audio, Other |
| video | 3gp/avi/flv/m4v/mkv/mov/mp4/mpeg/mpg/mts/m2ts/ts/webm/wmv | Videos, Other |
| ebook | epub/mobi/azw/azw3/fb2 | Ebooks, Documents, Other |
| font | ttf/otf/woff/woff2 | Fonts, Other |
| generic | 其他 | Documents, Images, Videos, Audio, Software, Archives, Data Exports, Configs, Drivers, Operating Systems, Ebooks, Fonts, Other |

文档稳定主类细化（`FileCategoryPolicy.cpp:201-218`）：

- pptx/odp/ppt → Presentations
- xlsx/ods/xls → Spreadsheets
- csv/tsv → Data Exports
- ini/cfg/conf → Configs
- 其余文档扩展名 → Documents

skill 应用 Python 标准库重写这张表，不要翻译 C++。

### 3.2 两种分类模式

`docs/categorization-behavior.md:8-22`：

- More refined：主题优先，主类可以离开文件系统桶。
- More consistent：主类稳住，子类承载主题。图片强制 `Images`，文档强制稳定桶。

提示词分支由 `LocalLLMPromptBuilder` 根据 `Sorting style: More refined` 标记切换（`LocalLLMPromptBuilder.cpp:84-87,282-298`）。skill 不得复制该文件中的英文提示词长文，应改写成决策规则。

### 3.3 白名单

形状（`WhitelistStore.hpp:14-27`、`README.md:232-241`）：

1. 仅主类
2. 主类 + 全局子类
3. 主类 + 按主类分支的子类

全局子类与分支子类互斥。两种模式都受白名单约束。

提示压缩（`CategorizationService.cpp:35-37`）：约束项 > 30 时，提示最多 8 个相关候选；完整列表仍用于事后校验。

### 3.4 标签后处理

`CategorizationService.cpp:259-442` 与 `ArtifactCategoryPolicy.cpp:72-182`：

- 低信息标签：documents/files/general/misc/other/uncategorized 等 → 不能当有效子类。
- 图片低信息额外包括 image/photo/screenshot/wallpaper 等。
- consistent 且无白名单：图片主类拉回 `Images`，文档主类拉回稳定桶；子类从模型输出里挑非低信息值，否则 `General`。
- 软件/压缩包：主类别名规范到 Software/Installers/Drivers/Operating Systems/Archives/Data Exports/Other。
- 路径标签用 `Utils::sanitize_path_label` 去掉 `<>:"/\|?*` 和控制字符（`Utils.cpp:1085-1108`）。

### 3.5 解析合同

模型应答规范为一行：`<Main category> : <Subcategory>`（`LocalLLMPromptBuilder.cpp:89-100`）。  
`CategorizationResponseParser` 容忍包装标点、括号注释、JSON 翻译应答。校验上限 80 字符（`CategorizationResponseParser.cpp:22`）。

skill 应规定：脚本校验结构化计划字段，不把自由文本直接当路径。

### 3.6 扫描与项目保护

`FileScanner.cpp:202-315` 跳过：

- `.DS_Store`、`Thumbs.db`、`desktop.ini`
- 默认隐藏项（Windows `FILE_ATTRIBUTE_HIDDEN`；其他平台以 `.` 开头）
- 可选 reparse/symlink
- 强保护项目根

`ProtectedProjectDetector.cpp:100-221` 规则 id：`unity`、`unreal`、`godot`、`git`、`node`、`python`、`rust`、`go`、`gradle`、`dotnet`、`xcode`、`blender`（强）；`blender-file`（弱，不自动跳过）。

macOS bundle 扩展名（`.app`、`.framework` 等）被当成文件而不是可递归目录（`FileScanner.cpp:226-240`）。

### 3.7 命名

- 标签/文件名合法性：`ReviewNameValidator.cpp:20-169`。
- 审阅去重：建议名 `_N`，移动名括号数字（`ReviewFileNaming.hpp:64-81`）。
- 图片建议名可加 `YYYY-MM-DD` 与地点前缀（`ImageRenameMetadataService.hpp:40-41`）。MVP 建议只保留日期前缀规则，地点/反向地理编码标为后续。
- 媒体：`year_artist_album_title.ext`，缺字段省略并保序（`MediaRenameMetadataService.hpp:14-16`）。MVP 仅在能用标准库/已有标签读到字段时启用。
- 文档建议名：最多 3 词、茎长 50（`DocumentTextAnalyzer.hpp:10-13`）。
- 类名日期后缀：图片 `YYYY-MM-DD`，文档 `YYYY-MM`；不写入规范缓存名（`CategoryDateSuffix.hpp:10-21`）。

### 3.8 内容证据层级

1. 图像描述（视觉模型）优先于文件名。
2. 文档摘要（最多约 8000 字符摘录）优先于文件名。
3. 截图/UI 图按画面内容分类，禁止 Software/Operating Systems/Databases/Installers 等制品主类（`README.md:249`、`LocalLLMPromptBuilder.cpp:142-180`）。
4. 类名英文规范，再本地化显示（`docs/categorization-behavior.md:42-46`）。

## 4. 不应进入 skill 的能力

| 能力 | 位置 | 原因 |
|---|---|---|
| Qt GUI / i18n / 主题 | `MainApp*`、`resources/i18n` | 宿主对话界面已承担审阅 |
| llama.cpp / GGUF / CUDA/Vulkan | `LocalLLMClient`、`VisualLlmRuntime` | 宿主模型已存在 |
| OpenAI/Gemini/自定义 HTTP 客户端 | `LLMClient`、`GeminiClient` | 除非用户本轮明确要求远程分析 |
| OneDrive / 存储插件 | `plugins/`、`StoragePlugin*` | 平台适配，不是规则 |
| Explorer 扩展、单实例、更新器 | sibling 仓库与 `Updater*` | 发行与壳层 |
| SQLite 分类缓存与 UserLearningStore | `DatabaseManager`、`UserLearningStore` | 可后续做 sidecar；MVP 用单次计划 |
| 反向地理编码缓存 | `ImageRenameMetadataService` | 网络副作用与隐私 |
| 系统兼容性基准 | `SuitabilityBenchmarkDialog` | 针对本地 GGUF |

## 5. keep / adapt / reject / invent

| 机制 | 判定 | 映射到 skill |
|---|---|---|
| 扩展名 → 文件族 → 候选主类 | keep | `scripts/` 确定性表 |
| more-refined / more-consistent | keep | 输入标志 + references 决策规则 |
| 白名单三形态与 >30 截断 | keep | 校验走全表；提示可截断 |
| 审阅计划先于 apply | keep | 默认 dry-run；批准后 apply |
| 强保护项目根 | keep | 扫描 skip + skipped 原因 |
| 标签/文件名路径安全 | keep | 脚本校验，失败则条目不可 apply |
| 截图 ≠ 制品 | keep | 图像规则，不复制源提示词 |
| 英文规范类名 | keep | 计划字段用英文；显示语言跟用户 |
| headless 单父目录限制 | keep | 跨父目录拒绝 |
| undo sidecar | adapt | 若 Q1 纳入 apply，用 JSON sidecar，不移植 Qt UndoManager |
| 文档摘录 8000 字符 | adapt | 宿主 Read 工具；脚本只记录摘录哈希/长度 |
| 图片视觉分析 | adapt | 有视觉则描述，否则文件名 |
| 媒体 metadata 重命名 | adapt | MVP 可选；无标签则不建议改名 |
| 日期后缀作路径覆盖 | adapt | 可选开关，不写入规范类名 |
| 一致性二次 LLM pass | reject（MVP） | `ConsistencyPassService` 成本高，计划阶段用白名单+模式代替 |
| SQLite 学习库 | reject（MVP） | 无跨次记忆；可后续 |
| GGUF/Qt/云插件/更新器 | reject | 非规则 |
| 源提示词原文 | reject | AGPL 文本；语义重写 |
| 商标名作包名 | reject | `TRADEMARKS.md` |

## 6. 许可

- 版权：GNU AGPL-3.0（`LICENSE`）。
- 商标：不得用 `AI File Sorter`、`ai-file-sorter` 或图标品牌化衍生包（`TRADEMARKS.md:6-24`）。
- 本仓库 skill 用原创规则表述与原创 Python。README 做提名致谢。不把 `ref/repo/ai-file-sorter` 拷进 skill 包。

## 7. 与本仓库现有 skill 的边界

| 请求 | 所有者 |
|---|---|
| 整理 Downloads/杂乱目录、按类建文件夹、建议重命名 | `file-sorter`（本任务） |
| 清理 Windows 开发进程 | `windows-dev-process-cleanup` |
| 创建/删除 git worktree | `git-worktree` |
| 提交 | `git-commit` |
| 在仓库内重构源码布局 | 不是文件整理；走开发工作流 |

## 8. 建议的重复任务一句话

这个 skill 接收本地目录或同一父目录下的文件列表，用于按稳定分类和命名规则整理杂乱文件，输出可审阅计划（默认 dry-run；明确批准后才 apply），不处理桌面应用移植、项目根内源码移动、进程清理或 Git worktree。

## 9. 缺失证据

- Qiaomu 双目录先例检索（skills.sh / SkillsMP）尚未运行。
- 未对照源单元测试逐条复现（`tests/unit/test_file_scanner.cpp`、`test_protected_project_detector.cpp`、`test_whitelist_and_prompt.cpp`、`test_review_name_validator.cpp`、`test_review_file_naming.cpp`）。实施前应抽样这些测试作为行为夹具来源，而不是复制 C++。
- 未测量源应用在真实 Downloads 上的分类准确率。公开质量 claim 必须标 `missing evidence`。
