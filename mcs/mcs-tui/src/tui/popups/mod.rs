pub mod confirm_modal;
pub mod detail_modal;
pub mod diff_modal;
pub mod install_modal;
pub mod multi_sync;
pub mod platform_config;
pub mod prompt_modal;

use ratatui::prelude::*;
use ratatui::widgets::*;

use crate::tui::state::{AppState, PopupKind};
use crate::tui::style_system;

pub fn draw(frame: &mut Frame, popup: &PopupKind, state: &AppState) {
    let mut area = match popup {
        PopupKind::Install { .. } => centered_rect(80, 80, frame.area()),
        _ => centered_rect(60, 60, frame.area()),
    };
    let metrics = style_system::layout_metrics();
    let pad = metrics
        .popup_padding
        .min(area.width / 8)
        .min(area.height / 8);
    area.x += pad;
    area.y += pad;
    area.width = area.width.saturating_sub(pad * 2);
    area.height = area.height.saturating_sub(pad * 2);
    frame.render_widget(Clear, area);

    match popup {
        PopupKind::Install {
            items,
            mode,
            path_input,
        } => install_modal::draw(frame, area, items, mode, path_input),
        PopupKind::Confirm {
            title,
            message,
            items,
            danger,
            ..
        } => confirm_modal::draw(frame, area, title, message, items, *danger),
        PopupKind::Detail { item_index } => {
            detail_modal::draw(frame, area, state, *item_index, state.popup_scroll)
        }
        PopupKind::Diff {
            item_index,
            installed,
            diff_text,
            load_error,
        } => {
            let data = diff_modal::DiffRenderData {
                item_index: *item_index,
                installed: *installed,
                diff_text,
                load_error: load_error.as_deref(),
            };
            diff_modal::draw(frame, area, state, data, state.popup_scroll)
        }
        PopupKind::Prompt {
            has_diff,
            diff_text,
        } => prompt_modal::draw(frame, area, *has_diff, diff_text, state.popup_scroll),
        PopupKind::PlatformConfig => platform_config::draw(frame, area, state),
        PopupKind::MultiSync {
            selected_platforms,
            cursor,
        } => multi_sync::draw(frame, area, state, selected_platforms, *cursor),
    }
}

fn centered_rect(pct_x: u16, pct_y: u16, area: Rect) -> Rect {
    let w = area.width * pct_x / 100;
    let h = area.height * pct_y / 100;
    let x = (area.width.saturating_sub(w)) / 2;
    let y = (area.height.saturating_sub(h)) / 2;
    Rect::new(x, y, w, h)
}
