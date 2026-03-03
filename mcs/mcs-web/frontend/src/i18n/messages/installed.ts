export const enInstalledMessages = {
  "installed.installSkills": "Install Skills",
  "installed.categories": "CATEGORIES",
  "installed.allSkills": "All Skills",
  "installed.searchPlaceholder": "Search installed skills...",
  "installed.emptyTitle": "No installed skills found",
  "installed.editSkillMd": "Edit SKILL.md",
  "installed.uninstallSkillTitle": "Uninstall Skill",
  "installed.uninstallSkillMessage":
    "Uninstall \"{name}\" from {platform}? This cannot be undone.",
  "installed.uninstalledNotification": "Uninstalled \"{name}\"",
  "installed.reinstalledNotification": "Reinstalled \"{name}\" successfully",
  "installed.reinstallFailed": "Failed to reinstall: {error}",
  "installed.savedNotification": "Saved \"{name}\"",
} as const;

export const zhInstalledMessages: Record<
  keyof typeof enInstalledMessages,
  string
> = {
  "installed.installSkills": "安装技能",
  "installed.categories": "分类",
  "installed.allSkills": "全部技能",
  "installed.searchPlaceholder": "搜索已安装技能...",
  "installed.emptyTitle": "未找到已安装技能",
  "installed.editSkillMd": "编辑 SKILL.md",
  "installed.uninstallSkillTitle": "卸载技能",
  "installed.uninstallSkillMessage":
    "从 {platform} 卸载“{name}”？此操作不可撤销。",
  "installed.uninstalledNotification": "已卸载“{name}”",
  "installed.reinstalledNotification": "已成功重装“{name}”",
  "installed.reinstallFailed": "重装失败：{error}",
  "installed.savedNotification": "已保存“{name}”",
};
