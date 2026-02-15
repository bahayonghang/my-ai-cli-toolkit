mod config;
mod core;
mod error;
mod model;
mod tui;

fn main() {
    if std::env::args().any(|a| a == "--version" || a == "-V") {
        println!("mcs {}", env!("CARGO_PKG_VERSION"));
        return;
    }

    let project_root = config::paths::detect_project_root().unwrap_or_else(|| {
        eprintln!("Error: Could not detect project root (no skills/ directory found).");
        eprintln!("Run this binary from within the my-claude-code-settings project.");
        std::process::exit(1);
    });

    if let Err(e) = tui::run(project_root) {
        eprintln!("Error: {e}");
        std::process::exit(1);
    }
}
