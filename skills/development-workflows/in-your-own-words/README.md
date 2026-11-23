# in-your-own-words

在写代码或动手改文件前，用自己的话把「**目标、要解决的问题、成功标准与关键假设/分叉**」四件事简明复述一遍并停下来等确认，用几句话的对齐成本拦住整段跑偏施工。

## 安装

使用 Skills CLI 从本仓库安装：

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill in-your-own-words
```

或在仓库本地通过项目安装器 live-link 到当前项目：

```bash
just install-projects --skill in-your-own-words
```

## 你可以直接这样说

- `/in-your-own-words`
- 「动手改代码前，先用你自己的话复述一遍我的目标和要解决的问题，确认没理解偏再开工。」
- 「先别写实现，讲讲你理解我这次到底想解决什么痛点、做到什么算成功。」
- "Before writing any code, restate in your own words what you think my goals are and what problem we're trying to solve."
- "Play back my brief in your own words, call out any assumptions or open forks, and wait for my confirmation."

## 前置依赖

- **对话复述本身零外部依赖**：纯对话场景下无需任何 CLI 或环境配置；涉及具体仓库文件时仅调用只读工具（`Read` / `Glob` / `Grep`）。
- **可选离线校验器**：`python >= 3.10`（仅标准库，用于运行 `scripts/check_playback.py` 对复述文本做确定性结构与反复读检测）。

## 输出契约与权限边界

- **工作流**：`S0 路由锁 → S1 按需只读查证 → S2 四段式复述（目标 / 问题 / 成功标准 / 关键假设与分叉） → S3 纠偏收口并硬停止`
- **权威边界（Playback-not-Execution）**：严格只读——**不修改业务文件、不输出长代码块或补丁、不执行变更命令、不「顺手先改可逆部分」**，必须等用户确认或纠偏后再动手。
- **反机械复读（Paraphrase-not-Echo）**：不得照抄用户原话或只做同义词替换，必须提炼因果与验收边界，且直接摊开 brief 中潜藏的矛盾或默认前提（至多 3 条分叉）。
- **宿主适配说明**：为兼容本仓库 `SKILL.md` frontmatter Schema，根 `SKILL.md` 未写入 `disable-model-invocation`；若你在 Cursor 或 Claude Code 中希望仅限 `/in-your-own-words` 显式调用，可在宿主本地配置中按需添加 `disable-model-invocation: true`。

## 参考与致谢

本技能在语义上受以下开源项目启发（按方法提炼与重铸，未照搬上游正文，遵循各自 MIT 许可）：

- `cursor/plugins@in-your-own-words (pstack); Yeachan-Heo/oh-my-claudecode@in-your-own-words; affaan-m/ECC@intent-driven-development; mattpocock/skills@grill-me`

## 验证命令

```bash
# 对复述输出做离线确定性检查（支持从 stdin 读取，并可选传入 --brief 比对机械复读）
python skills/development-workflows/in-your-own-words/scripts/check_playback.py --brief "你的原始需求" -

# 运行包内单元测试
python -m unittest discover -s skills/development-workflows/in-your-own-words/tests -p "test_*.py" -v

# 运行 Qiaomu Meta Skill 包门禁与触发评测
python .agents/skills/qiaomu-meta-skill/scripts/validate_skill.py skills/development-workflows/in-your-own-words
python .agents/skills/qiaomu-meta-skill/scripts/trigger_eval.py skills/development-workflows/in-your-own-words --cases evals/trigger_cases.json
python .agents/skills/qiaomu-meta-skill/scripts/release_check.py skills/development-workflows/in-your-own-words --phase local --run-tests

# 同步生成文档并跑仓库全量 CI
just docs-sync
just ci
```

## Troubleshooting

| 现象 | 原因 | 解决方法 |
| --- | --- | --- |
| 复述只是换几个词重复用户原句 | 直接复用原话措辞，未做因果和验收提炼 | 运行 `check_playback.py --brief ...` 核对 `verbatim_parroting`；改用「最终状态 + 阻塞根因 + 可观察验收」重写 |
| 复述完顺手开始改文件或贴出代码补丁 | 违反 `Playback-not-Execution` 硬停止边界 | 删去改动与代码块，以单句 drift-check 收口并等待确认 |
| 复述末尾抛出 5 个以上问题变成问卷 | 越界进入多轮需求审讯 | 压缩为不超过 3 条高杠杆假设/分叉；若确实需要多轮设计树追问，请改用 `grilling` 或 `laoyeye` |
| 在日常明确需求上也被意外触发 | 本地宿主未限制显式斜杠触发 | 在宿主插件适配层增加 `disable-model-invocation: true`，或仅在模糊/高风险任务前显式调用 `/in-your-own-words` |
