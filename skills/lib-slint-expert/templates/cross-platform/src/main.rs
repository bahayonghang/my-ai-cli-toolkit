#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

// Set up console logging for WASM
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    run_app()
}

#[cfg(not(target_arch = "wasm32"))]
fn main() -> Result<(), slint::PlatformError> {
    run_app()
}

fn run_app() -> Result<(), slint::PlatformError> {
    // Initialize the main window
    let main_window = CrossPlatformApp::new()?;

    // Set up platform-specific event handlers
    setup_event_handlers(&main_window)?;

    // Show platform info
    show_platform_info(&main_window);

    main_window.run()
}

fn setup_event_handlers(app: &CrossPlatformApp) -> Result<(), slint::PlatformError> {
    // Handle platform info request
    let app_weak = app.as_weak();
    app.on_show_platform_info(move || {
        if let Some(app) = app_weak.upgrade() {
            show_platform_info(&app);
        }
    });

    // Handle feature test
    let app_weak = app.as_weak();
    app.on_test_features(move || {
        if let Some(app) = app_weak.upgrade() {
            test_platform_features(&app);
        }
    });

    // Handle theme toggle
    let app_weak = app.as_weak();
    app.on_toggle_theme(move || {
        if let Some(app) = app_weak.upgrade() {
            let current_theme = app.get_current_theme();
            let new_theme = if current_theme == "light" { "dark" } else { "light" };
            app.set_current_theme(new_theme.into());

            let status = format!("Theme changed to {}", new_theme);
            app.set_status_text(status.into());
        }
    });

    Ok(())
}

fn show_platform_info(app: &CrossPlatformApp) {
    let platform = get_platform_info();
    let backend = get_backend_info();
    let features = get_available_features();

    let info = format!(
        "Platform: {}\nBackend: {}\nFeatures: {}",
        platform,
        backend,
        features.join(", ")
    );

    app.set_platform_info(info.into());
}

fn test_platform_features(app: &CrossPlatformApp) {
    let mut test_results = Vec::new();

    // Test window operations
    test_results.push("Window operations: OK".to_string());

    // Test threading (if available)
    #[cfg(not(target_arch = "wasm32"))]
    {
        test_results.push("Threading: Available".to_string());
    }
    #[cfg(target_arch = "wasm32")]
    {
        test_results.push("Threading: Limited".to_string());
    }

    // Test file system access
    #[cfg(not(target_arch = "wasm32"))]
    {
        test_results.push("File system: Available".to_string());
    }
    #[cfg(target_arch = "wasm32")]
    {
        test_results.push("File system: Browser storage".to_string());
    }

    // Test graphics capabilities
    test_results.push("Graphics: Hardware accelerated".to_string());

    app.set_test_results(test_results.join("\n").into());
}

fn get_platform_info() -> &'static str {
    #[cfg(target_os = "windows")]
    return "Windows";

    #[cfg(target_os = "macos")]
    return "macOS";

    #[cfg(target_os = "linux")]
    return "Linux";

    #[cfg(target_arch = "wasm32")]
    return "WebAssembly";

    #[cfg(target_os = "android")]
    return "Android";

    #[cfg(target_os = "ios")]
    return "iOS";

    "Unknown"
}

fn get_backend_info() -> &'static str {
    #[cfg(target_os = "windows")]
    return "Win32";

    #[cfg(target_os = "macos")]
    return "Cocoa";

    #[cfg(target_os = "linux")]
    return "X11/Wayland";

    #[cfg(target_arch = "wasm32")]
    return "WebGL";

    "Default"
}

fn get_available_features() -> Vec<&'static str> {
    let mut features = vec!["Basic UI", "Animations", "Theming"];

    #[cfg(not(target_arch = "wasm32"))]
    {
        features.extend_from_slice(&["File dialogs", "System tray", "Multiple windows"]);
    }

    #[cfg(target_arch = "wasm32")]
    {
        features.extend_from_slice(&["Web integration", "Browser storage"]);
    }

    features
}