use std::path::Path;

/// Parsed SKILL.md frontmatter
#[derive(Debug, Clone, Default)]
pub struct SkillMeta {
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub version: Option<String>,
}

/// Parse YAML frontmatter from SKILL.md in the given directory.
/// Hand-rolled parser matching the Python version — no YAML crate needed.
pub fn parse_skill_frontmatter(skill_dir: &Path) -> SkillMeta {
    let dir_name = skill_dir
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default();

    let mut meta = SkillMeta {
        name: dir_name.clone(),
        ..Default::default()
    };

    let skill_md = skill_dir.join("SKILL.md");
    let content = match std::fs::read_to_string(&skill_md) {
        Ok(c) => c,
        Err(_) => return meta,
    };

    if !content.starts_with("---") {
        // Legacy fallback: search for description line
        for line in content.lines() {
            if let Some(rest) = line.strip_prefix("description:") {
                meta.description = Some(rest.trim().to_string());
                break;
            }
        }
        return meta;
    }

    // Split on --- delimiters
    let parts: Vec<&str> = content.splitn(3, "---").collect();
    if parts.len() < 3 {
        return meta;
    }

    let frontmatter = parts[1].trim();
    let mut current_key: Option<&str> = None;
    let mut multiline_buf: Vec<String> = Vec::new();

    for line in frontmatter.lines() {
        let stripped = line.trim();
        if stripped.is_empty() {
            if current_key == Some("description") {
                multiline_buf.push(String::new());
            }
            continue;
        }

        // Key: value line (not indented)
        if line.contains(':') && !line.starts_with(' ') && !line.starts_with('\t') {
            // Flush previous multiline
            flush_multiline(&mut meta, &mut current_key, &mut multiline_buf);

            let (key, value) = line.split_once(':').unwrap();
            let key = key.trim();
            let value = value.trim();

            match key {
                "name" => {
                    meta.name = if value.is_empty() {
                        dir_name.clone()
                    } else {
                        value.to_string()
                    }
                }
                "description" => {
                    if value.starts_with('|') {
                        current_key = Some("description");
                    } else {
                        meta.description = Some(value.to_string());
                    }
                }
                "category" => {
                    meta.category = if value.is_empty() {
                        None
                    } else {
                        Some(value.to_string())
                    }
                }
                "version" => {
                    meta.version = if value.is_empty() {
                        None
                    } else {
                        Some(value.to_string())
                    }
                }
                "tags" => {
                    if value.starts_with('[') && value.ends_with(']') {
                        meta.tags = value[1..value.len() - 1]
                            .split(',')
                            .map(|t| t.trim().to_string())
                            .filter(|t| !t.is_empty())
                            .collect();
                    } else if !value.is_empty() {
                        meta.tags = vec![value.to_string()];
                    } else {
                        current_key = Some("tags");
                    }
                }
                _ => {}
            }
        } else if current_key.is_some() {
            let content_line = stripped;
            if current_key == Some("tags") {
                if let Some(rest) = content_line.strip_prefix("- ") {
                    multiline_buf.push(rest.trim().to_string());
                }
            } else {
                multiline_buf.push(content_line.to_string());
            }
        }
    }

    flush_multiline(&mut meta, &mut current_key, &mut multiline_buf);
    meta
}

fn flush_multiline(meta: &mut SkillMeta, key: &mut Option<&str>, buf: &mut Vec<String>) {
    if let Some(k) = key.take() {
        match k {
            "description" => meta.description = Some(buf.join("\n").trim().to_string()),
            "tags" => meta.tags = buf.clone(),
            _ => {}
        }
    }
    buf.clear();
}
