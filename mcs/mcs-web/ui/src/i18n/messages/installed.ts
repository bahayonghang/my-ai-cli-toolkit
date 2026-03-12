export const enInstalledMessages = {
  "installed.installSkills": "Install Skills",
  "installed.categories": "CATEGORIES",
  "installed.allSkills": "All Skills",
  "installed.searchLabel": "Search installed skills",
  "installed.filterToggle": "Show filters",
  "installed.mobileListTitle": "Installed skills",
  "installed.searchPlaceholder": "Search installed skills...",
  "installed.emptyTitle": "No installed skills found",
  "installed.emptyDescription": "Try a different filter, or install new skills for this platform.",
  "installed.editSkillMd": "Edit SKILL.md",
  "installed.uninstallSkillTitle": "Uninstall Skill",
  "installed.uninstallSkillMessage":
    "Uninstall \"{name}\" from {platform}? This cannot be undone.",
  "installed.uninstalledNotification": "Uninstalled \"{name}\"",
  "installed.reinstalledNotification": "Reinstalled \"{name}\" successfully",
  "installed.reinstallFailed": "Failed to reinstall: {error}",
  "installed.savedNotification": "Saved \"{name}\"",
  "installed.installTargetChip": "{mode} · {path}",
  "installed.installTargetGlobal": "Global",
  "installed.installTargetProject": "Project",
  "installed.installTargetLoading": "Resolving install target...",
  "installed.installTargetFallbackWarning":
    "Project install target is invalid. Switched back to Global.",
} as const;

export const zhInstalledMessages: Record<
  keyof typeof enInstalledMessages,
  string
> = {
  "installed.installSkills": "安装技能",
  "installed.categories": "分类",
  "installed.allSkills": "全部技能",
  "installed.searchLabel": "搜索已安装技能",
  "installed.filterToggle": "显示筛选",
  "installed.mobileListTitle": "已安装技能",
  "installed.searchPlaceholder": "搜索已安装技能...",
  "installed.emptyTitle": "未找到已安装技能",
  "installed.emptyDescription": "可以尝试调整筛选条件，或为当前平台安装新的技能。",
  "installed.editSkillMd": "编辑 SKILL.md",
  "installed.uninstallSkillTitle": "卸载技能",
  "installed.uninstallSkillMessage":
    "从 {platform} 卸载“{name}”？此操作不可撤销。",
  "installed.uninstalledNotification": "已卸载“{name}”",
  "installed.reinstalledNotification": "已成功重装“{name}”",
  "installed.reinstallFailed": "重装失败：{error}",
  "installed.savedNotification": "已保存“{name}”",
  "installed.installTargetChip": "{mode} · {path}",
  "installed.installTargetGlobal": "全局",
  "installed.installTargetProject": "项目",
  "installed.installTargetLoading": "正在解析安装目录...",
  "installed.installTargetFallbackWarning": "项目安装目标无效，已切回全局安装目标。",
};
