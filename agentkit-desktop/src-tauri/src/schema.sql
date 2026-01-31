-- AgentKit Desktop Database Schema
-- SQLite 3

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('skill', 'command', 'agent')),
    description TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('local', 'git', 'npm', 'pip', 'vercel')),
    source_path TEXT,
    source_url TEXT,
    source_branch TEXT,
    source_package TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Platforms table
CREATE TABLE IF NOT EXISTS platforms (
    platform TEXT PRIMARY KEY,
    detected INTEGER NOT NULL DEFAULT 0,
    base_path TEXT,
    link_mode TEXT NOT NULL DEFAULT 'symlink' CHECK (link_mode IN ('symlink', 'junction', 'copy')),
    last_detected_at TEXT
);

-- Resource-Platform status table
CREATE TABLE IF NOT EXISTS resource_platform_status (
    resource_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_installed' CHECK (status IN ('not_installed', 'synced', 'outdated', 'conflict', 'not_supported')),
    target_path TEXT,
    synced_at TEXT,
    PRIMARY KEY (resource_id, platform),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (platform) REFERENCES platforms(platform) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Resource-Categories junction table
CREATE TABLE IF NOT EXISTS resource_categories (
    resource_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    PRIMARY KEY (resource_id, category_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Resource-Tags junction table
CREATE TABLE IF NOT EXISTS resource_tags (
    resource_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (resource_id, tag_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- External skills registry cache
CREATE TABLE IF NOT EXISTS external_skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('git', 'npm', 'pip', 'vercel')),
    package TEXT,
    repo TEXT,
    branch TEXT,
    homepage TEXT,
    license TEXT,
    supported_platforms TEXT NOT NULL DEFAULT '[]', -- JSON array
    cached_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Settings table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('default_link_mode', '"symlink"'),
    ('theme', '"system"'),
    ('language', '"english"'),
    ('auto_detect_platforms', 'true');

-- Insert all supported platforms
INSERT OR IGNORE INTO platforms (platform, detected, link_mode) VALUES
    ('claude', 0, 'symlink'),
    ('codex', 0, 'symlink'),
    ('gemini', 0, 'symlink'),
    ('cursor', 0, 'symlink'),
    ('windsurf', 0, 'symlink'),
    ('antigravity', 0, 'symlink'),
    ('qwen', 0, 'symlink'),
    ('amp', 0, 'symlink'),
    ('cline', 0, 'symlink'),
    ('kiro', 0, 'symlink'),
    ('trae', 0, 'symlink'),
    ('opencode', 0, 'symlink');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name);
CREATE INDEX IF NOT EXISTS idx_resource_platform_status_status ON resource_platform_status(status);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag ON resource_tags(tag_id);

-- Trigger to update updated_at on resources
CREATE TRIGGER IF NOT EXISTS update_resources_timestamp
AFTER UPDATE ON resources
FOR EACH ROW
BEGIN
    UPDATE resources SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- ============================================
-- Marketplace Skills Cache (SkillsMP API)
-- ============================================

-- Marketplace skills cache table
CREATE TABLE IF NOT EXISTS marketplace_skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner TEXT NOT NULL,
    repo TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    downloads INTEGER,
    categories TEXT,  -- JSON array
    platforms TEXT,   -- JSON array
    source TEXT CHECK (source IN ('vercel-labs', 'community', 'official')),
    updated_at TEXT,
    installed INTEGER DEFAULT 0,
    cached_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Cache metadata for TTL management
CREATE TABLE IF NOT EXISTS marketplace_cache_meta (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for marketplace queries
CREATE INDEX IF NOT EXISTS idx_marketplace_skills_stars ON marketplace_skills(stars DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_skills_updated ON marketplace_skills(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_skills_source ON marketplace_skills(source);
CREATE INDEX IF NOT EXISTS idx_marketplace_skills_name ON marketplace_skills(name);

-- Insert default cache TTL (1 hour = 3600 seconds)
INSERT OR IGNORE INTO marketplace_cache_meta (key, value, updated_at) VALUES
    ('cache_ttl_seconds', '3600', datetime('now')),
    ('last_refresh', NULL, datetime('now'));
