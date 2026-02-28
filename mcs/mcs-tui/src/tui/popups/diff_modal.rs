use std::path::{Path, PathBuf};

use crate::tui::state::AppState;
use crate::tui::style_system;
use crate::tui::theme::StyleRole;
use mcs_core::model::{ItemInfo, ItemType};
use ratatui::prelude::*;
use ratatui::widgets::*;
use similar::TextDiff;

pub struct DiffRenderData<'a> {
    pub item_index: usize,
    pub installed: bool,
    pub diff_text: &'a str,
    pub load_error: Option<&'a str>,
}

pub fn draw(
    frame: &mut Frame,
    area: Rect,
    state: &AppState,
    data: DiffRenderData<'_>,
    scroll: u16,
) {
    let block = style_system::modal_block("Diff");
    let inner = block.inner(area);
    frame.render_widget(block, area);
    let chunks = Layout::vertical([Constraint::Min(1), Constraint::Length(1)]).split(inner);

    if state.active_items().get(data.item_index).is_none() {
        return;
    }
    if !data.installed {
        frame.render_widget(
            Paragraph::new(" Not installed - no diff")
                .style(style_system::style(StyleRole::TextMuted)),
            chunks[0],
        );
        frame.render_widget(
            Paragraph::new(" j/k Scroll  PgUp/PgDn Page  Esc Close")
                .style(style_system::style(StyleRole::HintText)),
            chunks[1],
        );
        return;
    }

    if let Some(error) = data.load_error {
        frame.render_widget(
            Paragraph::new(format!(" Failed to load diff:\n {error}"))
                .style(style_system::style(StyleRole::StatusError)),
            chunks[0],
        );
        frame.render_widget(
            Paragraph::new(" Esc Close").style(style_system::style(StyleRole::HintText)),
            chunks[1],
        );
        return;
    }

    if data.diff_text.is_empty() {
        frame.render_widget(
            Paragraph::new(" Files are identical")
                .style(style_system::style(StyleRole::StatusSuccess)),
            chunks[0],
        );
        frame.render_widget(
            Paragraph::new(" j/k Scroll  PgUp/PgDn Page  Esc Close")
                .style(style_system::style(StyleRole::HintText)),
            chunks[1],
        );
        return;
    }

    let lines: Vec<Line> = data.diff_text.lines().map(styled_diff_line).collect();
    frame.render_widget(Paragraph::new(lines).scroll((scroll, 0)), chunks[0]);
    frame.render_widget(
        Paragraph::new(" j/k Scroll  PgUp/PgDn Page  Esc Close")
            .style(style_system::style(StyleRole::HintText)),
        chunks[1],
    );
}

pub fn compute_diff_for_item(item: &ItemInfo) -> Result<String, String> {
    if !item.is_installed() {
        return Ok(String::new());
    }
    match item.item_type {
        ItemType::Skill => {
            build_skill_diff_text(&item.source_path, &item.target_path).map_err(|e| e.to_string())
        }
        ItemType::Command => {
            build_file_diff_text(&item.source_path, &item.target_path).map_err(|e| e.to_string())
        }
    }
}

fn build_file_diff_text(source: &Path, target: &Path) -> Result<String, std::io::Error> {
    let src = std::fs::read_to_string(source)?;
    let tgt = std::fs::read_to_string(target)?;
    let diff = TextDiff::from_lines(&tgt, &src)
        .unified_diff()
        .header("installed", "source")
        .to_string();
    Ok(diff)
}

fn build_skill_diff_text(source_dir: &Path, target_dir: &Path) -> Result<String, std::io::Error> {
    let src_skill_md = std::fs::read_to_string(source_dir.join("SKILL.md"))?;
    let tgt_skill_md = std::fs::read_to_string(target_dir.join("SKILL.md"))?;
    let skill_md_diff = TextDiff::from_lines(&tgt_skill_md, &src_skill_md)
        .unified_diff()
        .header("installed/SKILL.md", "source/SKILL.md")
        .to_string();

    let src_manifest = build_skill_snapshot(source_dir);
    let tgt_manifest = build_skill_snapshot(target_dir);
    let manifest_diff = TextDiff::from_lines(&tgt_manifest, &src_manifest)
        .unified_diff()
        .header("installed/manifest", "source/manifest")
        .to_string();

    let mut out = String::new();
    if !skill_md_diff.is_empty() {
        out.push_str("# SKILL.md\n");
        out.push_str(&skill_md_diff);
        out.push('\n');
    }
    if !manifest_diff.is_empty() {
        out.push_str("# Skill files snapshot\n");
        out.push_str(&manifest_diff);
    }
    Ok(out)
}

fn build_skill_snapshot(root: &Path) -> String {
    if !root.exists() {
        return String::new();
    }

    let mut files = collect_files(root);
    files.sort();

    let mut lines = Vec::new();
    for file in files {
        let rel = file
            .strip_prefix(root)
            .ok()
            .unwrap_or(file.as_path())
            .to_string_lossy()
            .replace('\\', "/");
        let (size, mtime) = match file.metadata() {
            Ok(meta) => {
                let size = meta.len();
                let mtime = meta
                    .modified()
                    .ok()
                    .and_then(|m| m.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| format!("{}.{:09}", d.as_secs(), d.subsec_nanos()))
                    .unwrap_or_else(|| "0.000000000".to_string());
                (size, mtime)
            }
            Err(_) => (0, "0.000000000".to_string()),
        };
        lines.push(format!("{rel}|{size}|{mtime}"));
    }
    lines.join("\n")
}

fn collect_files(root: &Path) -> Vec<PathBuf> {
    mcs_core::core::fs_utils::walkdir_files(root)
}

fn styled_diff_line(line: &str) -> Line<'static> {
    let style = if line.starts_with('+') {
        style_system::style(StyleRole::StatusSuccess)
    } else if line.starts_with('-') {
        style_system::style(StyleRole::StatusError)
    } else if line.starts_with('@') || line.starts_with('#') {
        style_system::style(StyleRole::HintKey).add_modifier(Modifier::BOLD)
    } else {
        style_system::style(StyleRole::TextPrimary)
    };
    Line::styled(line.to_string(), style)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "mcs_diff_modal_{}_{}_{}",
            name,
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or_default()
        ));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn skill_snapshot_contains_nested_file() {
        let root = temp_dir("snapshot");
        std::fs::create_dir_all(root.join("scripts")).unwrap();
        std::fs::write(root.join("SKILL.md"), "name: a").unwrap();
        std::fs::write(root.join("scripts").join("run.sh"), "echo hi").unwrap();

        let snap = build_skill_snapshot(&root);
        assert!(snap.contains("SKILL.md"));
        assert!(snap.contains("scripts/run.sh"));

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn skill_diff_detects_changed_manifest() {
        let src = temp_dir("src");
        let tgt = temp_dir("tgt");
        std::fs::write(src.join("SKILL.md"), "name: demo").unwrap();
        std::fs::write(tgt.join("SKILL.md"), "name: demo").unwrap();
        std::fs::write(src.join("extra.txt"), "new").unwrap();

        let diff = build_skill_diff_text(&src, &tgt).unwrap();
        assert!(!diff.is_empty());
        assert!(diff.contains("Skill files snapshot"));

        let _ = std::fs::remove_dir_all(src);
        let _ = std::fs::remove_dir_all(tgt);
    }
}
