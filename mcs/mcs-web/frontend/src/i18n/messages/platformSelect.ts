export const enPlatformSelectMessages = {
  "platformSelect.subtitle": "Select a platform to manage",
  "platformSelect.refreshTooltip": "Refresh content and platform list",
  "platformSelect.refreshButton": "Refresh",
  "platformSelect.unifiedInstallTitle": "Open Unified Install Hub",
  "platformSelect.unifiedInstallLabel": "Unified Install",
  "platformSelect.dashboardTitle": "View Global Dashboard",
  "platformSelect.dashboardLabel": "Dashboard",
} as const;

export const zhPlatformSelectMessages: Record<
  keyof typeof enPlatformSelectMessages,
  string
> = {
  "platformSelect.subtitle": "选择要管理的平台",
  "platformSelect.refreshTooltip": "刷新内容与平台列表",
  "platformSelect.refreshButton": "刷新",
  "platformSelect.unifiedInstallTitle": "打开统一安装中心",
  "platformSelect.unifiedInstallLabel": "统一安装",
  "platformSelect.dashboardTitle": "查看全局仪表盘",
  "platformSelect.dashboardLabel": "仪表盘",
};
