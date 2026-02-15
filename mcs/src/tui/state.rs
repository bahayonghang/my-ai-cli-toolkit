use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

use crate::config::platform::PlatformConfig;
use crate::model::{InstallStatus, ItemInfo};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ContentTab {
    Skills,
    Commands,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[allow(dead_code)]
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
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConfirmAction {
    Uninstall,
    BatchUninstall,
    UpdateOutdated,
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct ProgressState {
    pub current: usize,
    pub total: usize,
    pub label: String,
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
    pub focus: FocusTarget,

    // Progress
    pub progress: Option<ProgressState>,

    // Platform select cursor
    pub platform_cursor: usize,

    // Sidebar category cursor
    pub category_cursor: usize,

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
            focus: FocusTarget::Sidebar,
            progress: None,
            platform_cursor: 0,
            category_cursor: 0,
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
        if let Some(status) = self.status_filter {
            if item.status != status {
                return false;
            }
        }
        if let Some(ref cat) = self.selected_category {
            if item.category.as_deref() != Some(cat.as_str()) {
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
        for item in self.active_items() {
            if let Some(ref cat) = item.category {
                *map.entry(cat.clone()).or_default() += 1;
            }
        }
        let mut cats: Vec<_> = map.into_iter().collect();
        cats.sort_by(|a, b| a.0.cmp(&b.0));
        cats
    }

    /// Load items for current platform
    pub fn load_items(&mut self) {
        let Some(platform) = self.current_platform().cloned() else {
            return;
        };
        self.skills = crate::core::discovery::discover_skills(&self.project_root, &platform);
        self.commands = crate::core::discovery::discover_commands(&self.project_root, &platform);
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
}
