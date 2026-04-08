# Deep-read mode

Deep-read mode is the main single-paper workflow. It turns a normalized
`paper-record` plus an optional `researcher-profile` into a strategic analysis
artifact.

## Required input

- one normalized `paper-record`
- use a `researcher-profile` when available; if not, ask for missing profile
  fields before producing the “与我研究的战略关联” section

## Output shape

### 1. 快速预判

Use the same five fields as `scan` mode.

### 2. 思辨性深度解构

- `A1. 理论坐标定位`
- `A2. 论证逻辑拆解`
- `A3. 方法论审视`
- `A4. 学术贡献与潜在影响`

### 3. 与我研究的战略关联

- `B1. 理论工具`
- `B2. 方法启示`
- `B3. 证据支持`
- `B4. 对话定位`

### 4. 可直接复用的输出

- `C1. 文献摘要卡片`
- `C2. 批判性摘要`

## Rules

- Clearly separate `作者观点` from `系统分析`
- `B3. 证据支持` may cite page anchors only when they are grounded in
  `content.page_chunks`; otherwise use `[信息待核实]`
- The final card must be reusable on its own without the rest of the report
