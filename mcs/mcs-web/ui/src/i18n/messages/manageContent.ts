export const enManageContentMessages = {
  "manageContent.commandsTitle": "Manage commands and prompts for Claude and Codex",
  "manageContent.commandsSubtitle":
    "Inspect install status, compare source vs installed content, and manage command libraries without switching through platform pages.",
  "manageContent.agentsTitle": "Manage Claude and Codex agents from one control surface",
  "manageContent.agentsSubtitle":
    "Review install coverage, diff agent definitions, and edit source files where agent behavior lives.",
  "manageContent.platformSwitcher": "Platform",
  "manageContent.searchPlaceholder.commands": "Search commands or prompts",
  "manageContent.searchPlaceholder.agents": "Search agents",
  "manageContent.statusAll": "All statuses",
  "manageContent.statusInstalled": "Installed only",
  "manageContent.statusOutdated": "Outdated only",
  "manageContent.statusNotInstalled": "Not installed only",
  "manageContent.emptyTitle.commands": "No commands or prompts match this view",
  "manageContent.emptyDescription.commands":
    "Try a different filter, or switch platform to inspect the other command library.",
  "manageContent.emptyTitle.agents": "No agents match this view",
  "manageContent.emptyDescription.agents":
    "Try a different filter, or switch platform to inspect the other agent library.",
  "manageContent.selectionSummary":
    "{selected} selected · {visible} in view · {categories} categories",
  "manageContent.editAgent": "Edit agent",
  "manageContent.installSelected": "Install selected",
  "manageContent.uninstallSelected": "Uninstall selected",
  "manageContent.selectAllVisible": "Select all visible",
  "manageContent.currentTargetPath": "Current target path",
  "manageContent.platformUnavailable": "This content type is not configured for the selected platform.",
} as const;

export const zhManageContentMessages: Record<
  keyof typeof enManageContentMessages,
  string
> = {
  "manageContent.commandsTitle": "统一管理 Claude 与 Codex 的命令和提示词",
  "manageContent.commandsSubtitle":
    "直接查看安装状态、比较源文件与已安装内容，并管理命令库，无需先进入平台页再切换标签。",
  "manageContent.agentsTitle": "统一管理 Claude 与 Codex 的 Agents",
  "manageContent.agentsSubtitle":
    "在同一个控制面里查看安装覆盖、比较 Agent 定义差异，并直接编辑源文件。",
  "manageContent.platformSwitcher": "平台",
  "manageContent.searchPlaceholder.commands": "搜索命令或提示词",
  "manageContent.searchPlaceholder.agents": "搜索 Agents",
  "manageContent.statusAll": "全部状态",
  "manageContent.statusInstalled": "仅已安装",
  "manageContent.statusOutdated": "仅可更新",
  "manageContent.statusNotInstalled": "仅未安装",
  "manageContent.emptyTitle.commands": "当前视图下没有匹配的命令或提示词",
  "manageContent.emptyDescription.commands":
    "可以调整筛选条件，或切换平台查看另一侧的命令库。",
  "manageContent.emptyTitle.agents": "当前视图下没有匹配的 Agents",
  "manageContent.emptyDescription.agents":
    "可以调整筛选条件，或切换平台查看另一侧的 Agent 库。",
  "manageContent.selectionSummary": "已选 {selected} 项 · 当前 {visible} 项 · {categories} 个分类",
  "manageContent.editAgent": "编辑 Agent",
  "manageContent.installSelected": "安装所选项",
  "manageContent.uninstallSelected": "卸载所选项",
  "manageContent.selectAllVisible": "全选当前可见项",
  "manageContent.currentTargetPath": "当前目标路径",
  "manageContent.platformUnavailable": "当前平台未配置该类内容。",
};
