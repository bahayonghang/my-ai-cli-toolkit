use std::collections::{HashMap, HashSet, VecDeque};
use std::path::PathBuf;

use mcs_core::config::platform::PlatformConfig;
use mcs_core::model::{InstallStatus, ItemInfo, ItemType};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ContentTab {
    Skills,
    Commands,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Screen {
    PlatformSelect,
    Main,
    Dashboard,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FocusTarget {
    Sidebar,
    ItemList,
    SearchInput,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InstallMode {
    Global,
    Directory,
}

#[derive(Debug, Clone)]
pub enum PopupKind {
    Install {
        items: Vec<String>,
        mode: InstallMode,
        path_input: String,
    },
    Confirm {
        title: String,
        message: String,
        items: Vec<String>,
        danger: bool,
        action: ConfirmAction,
    },
    Detail {
        item_index: usize,
    },
    Diff {
        item_index: usize,
    },
    Prompt {
        has_diff: bool,
        diff_text: String,
    },
    PlatformConfig,
    MultiSync {
        selected_platforms: HashSet<String>,
        cursor: usize,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConfirmAction {
    Uninstall,
    BatchUninstall,
    UpdateOutdated,
}

#[derive(Debug, Clone)]
pub struct ProgressState {
    pub current: usize,
    pub total: usize,
    pub label: String,
    pub success: usize,
    pub failed: usize,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NotificationLevel {
    Info,
    Success,
    Warning,
    Error,
}

#[derive(Debug, Clone)]
pub struct Notification {
    pub level: NotificationLevel,
    pub message: String,
}

#[derive(Debug, Clone)]
pub enum BatchTaskKind {
    Install {
        platform: PlatformConfig,
        name: String,
        item_type: ItemType,
    },
    Uninstall {
        platform: PlatformConfig,
        name: String,
        item_type: ItemType,
    },
    PromptUpdate {
        platform: PlatformConfig,
    },
}

#[derive(Debug, Clone)]
pub struct BatchTask {
    pub label: String,
    pub kind: BatchTaskKind,
}

#[derive(Debug, Clone)]
pub struct PendingBatch {
    pub label: String,
    pub tasks: Vec<BatchTask>,
    pub current: usize,
    pub success: usize,
    pub failures: Vec<String>,
    pub reload_after: bool,
}

pub struct DashboardStats {
    pub platform_name: String,
    pub skills_installed: usize,
    pub skills_total: usize,
    pub commands_installed: usize,
    pub commands_total: usize,
    pub outdated: usize,
    pub has_prompt: bool,
}

pub struct AppState {
    pub project_root: PathBuf,
    pub platforms: HashMap<String, PlatformConfig>,

    // Current platform
    pub platform: Option<String>,

    // Items
    pub skills: Vec<ItemInfo>,
    pub commands: Vec<ItemInfo>,

    // View state
    pub active_tab: ContentTab,
    pub selected_category: Option<String>,
    pub search_query: String,
    pub status_filter: Option<InstallStatus>,

    // Selection
    pub selected_indices: HashSet<usize>,
    pub cursor: usize,

    // UI mode
    pub screen: Screen,
    pub popup: Option<PopupKind>,
    pub popup_scroll: u16,
    pub focus: FocusTarget,

    // Batch execution state
    pub pending_batch: Option<PendingBatch>,
    pub progress: Option<ProgressState>,
    pub notifications: VecDeque<Notification>,

    // Platform select cursor
    pub platform_cursor: usize,

    // Sidebar category cursor
    pub category_cursor: usize,

    // Dashboard cache
    pub dashboard_cache: Option<Vec<DashboardStats>>,

    // Should quit
    pub quit: bool,
}

impl AppState {
    pub fn new(project_root: PathBuf, platforms: HashMap<String, PlatformConfig>) -> Self {
        Self {
            project_root,
            platforms,
            platform: None,
            skills: Vec::new(),
            commands: Vec::new(),
            active_tab: ContentTab::Skills,
            selected_category: None,
            search_query: String::new(),
            status_filter: None,
            selected_indices: HashSet::new(),
            cursor: 0,
            screen: Screen::PlatformSelect,
            popup: None,
            popup_scroll: 0,
            focus: FocusTarget::Sidebar,
            pending_batch: None,
            progress: None,
            notifications: VecDeque::new(),
            platform_cursor: 0,
            category_cursor: 0,
            dashboard_cache: None,
            quit: false,
        }
    }

    pub fn current_platform(&self) -> Option<&PlatformConfig> {
        self.platform.as_ref().and_then(|n| self.platforms.get(n))
    }

    pub fn active_items(&self) -> &[ItemInfo] {
        match self.active_tab {
            ContentTab::Skills => &self.skills,
            ContentTab::Commands => &self.commands,
        }
    }

    /// Get filtered indices into active_items()
    pub fn filtered_indices(&self) -> Vec<usize> {
        self.active_items()
            .iter()
            .enumerate()
            .filter(|(_, item)| self.matches_filter(item))
            .map(|(i, _)| i)
            .collect()
    }

    fn matches_filter(&self, item: &ItemInfo) -> bool {
        if let Some(status) = self.status_filter
            && item.status != status
        {
            return false;
        }
        if let Some(ref cat) = self.selected_category {
            if cat == "default" {
                if !item.is_default {
                    return false;
                }
            } else if item.category.as_deref() != Some(cat.as_str()) {
                return false;
            }
        }
        if !self.search_query.is_empty() {
            let q = self.search_query.to_lowercase();
            if !item.name.to_lowercase().contains(&q) {
                return false;
            }
        }
        true
    }

    /// Get unique categories with counts from active items
    pub fn categories(&self) -> Vec<(String, usize)> {
        let mut map: HashMap<String, usize> = HashMap::new();
        // Add virtual "default" category for skills
        if matches!(self.active_tab, ContentTab::Skills) {
            let default_count = self.active_items().iter().filter(|i| i.is_default).count();
            if default_count > 0 {
                map.insert("default".into(), default_count);
            }
        }
        for item in self.active_items() {
            if let Some(ref cat) = item.category {
                *map.entry(cat.clone()).or_default() += 1;
            }
        }
        // Partition: "default" first, then rest sorted
        let default_entry = map.remove("default");
        let mut cats: Vec<_> = map.into_iter().collect();
        cats.sort_by(|a, b| a.0.cmp(&b.0));
        if let Some(count) = default_entry {
            cats.insert(0, ("default".into(), count));
        }
        cats
    }

    /// Load items for current platform
    pub fn load_items(&mut self) {
        let Some(platform) = self.current_platform().cloned() else {
            return;
        };
        self.skills = mcs_core::core::discovery::discover_skills(&self.project_root, &platform);
        self.commands = mcs_core::core::discovery::discover_commands(&self.project_root, &platform);
        self.cursor = 0;
        self.selected_indices.clear();
        self.selected_category = None;
        self.search_query.clear();
        self.status_filter = None;
    }

    /// Reload items (after install/uninstall)
    pub fn reload_items(&mut self) {
        self.load_items();
    }

    pub fn push_notification(&mut self, level: NotificationLevel, message: impl Into<String>) {
        if self.notifications.len() >= 5 {
            self.notifications.pop_front();
        }
        self.notifications.push_back(Notification {
            level,
            message: message.into(),
        });
    }

    pub fn latest_notification(&self) -> Option<&Notification> {
        self.notifications.back()
    }

    pub fn selected_names(&self) -> Vec<String> {
        let items = self.active_items();
        let mut names: Vec<String> = self
            .selected_indices
            .iter()
            .filter_map(|&i| items.get(i).map(|item| item.name.clone()))
            .collect();
        names.sort_unstable();
        names
    }

    pub fn focused_name(&self) -> Option<String> {
        let filtered = self.filtered_indices();
        filtered
            .get(self.cursor)
            .and_then(|&i| self.active_items().get(i).map(|item| item.name.clone()))
    }

    /// Refresh dashboard cache by running discovery once for all platforms
    pub fn refresh_dashboard(&mut self) {
        let mut stats = Vec::new();
        let mut names: Vec<_> = self.platforms.keys().cloned().collect();
        names.sort();
        for name in names {
            let p = &self.platforms[&name];
            let skills = mcs_core::core::discovery::discover_skills(&self.project_root, p);
            let commands = mcs_core::core::discovery::discover_commands(&self.project_root, p);
            stats.push(DashboardStats {
                platform_name: name,
                skills_installed: skills.iter().filter(|i| i.is_installed()).count(),
                skills_total: skills.len(),
                commands_installed: commands.iter().filter(|i| i.is_installed()).count(),
                commands_total: commands.len(),
                outdated: skills.iter().filter(|i| i.needs_update()).count(),
                has_prompt: p.prompt_file.is_some(),
            });
        }
        self.dashboard_cache = Some(stats);
    }
}
