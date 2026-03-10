# Touying

基于 Touying 的 Typst 演示文稿编写技能，适用于主题、版式和动画设计。

## 适用场景

- 编辑 `.typ` 幻灯片
- 组织 Touying deck 结构
- 配置主题与全局样式
- 添加动画与分步展示

## 技能重点

- 通过 theme import 与 `#show` 配置演示文稿
- 使用 multi-file 结构管理大型 deck
- 遵守 Touying 自身的布局与动画规则
- 结合 `docs/` 和 `references/` 中的资料进行修改

## 技能内主要导航

- `docs/start.md`
- `docs/multi-file.md`
- `docs/sections.md`
- `docs/global-settings.md`
- `docs/layout.md`
- `docs/dynamic/`
- `docs/themes/`
- `docs/integration/`
- `references/EXAMPLES.md`
- `references/TROUBLESHOOTING.md`

## 关键规则

- 使用 Touying 的 config helper，而不是直接 `set page`
- 公共 deck 配置集中管理
- 编辑前先提供有效的 `.typ` 目标路径
