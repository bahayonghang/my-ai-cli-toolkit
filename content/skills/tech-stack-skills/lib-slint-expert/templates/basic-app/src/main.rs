// Basic Slint Application Template
// Based on official examples: @source/examples/memory/, @source/examples/todo/

slint::include_modules!();

fn main() -> Result<(), slint::PlatformError> {
    // Create the main window
    let main_window = MainWindow::new()?;

    // Set up any additional event handlers if needed
    // The UI logic is mostly handled in the .slint file for this template

    // Run the application
    main_window.run()
}

// WebAssembly support - uncomment for web deployment
#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub fn main_web() {
    // Initialize panic hook for better error messages in browser console
    console_error_panic_hook::set_once();

    // Run the main application
    main().expect("Failed to run application");
}

// Example of how to add more complex logic
// Uncomment and modify as needed:

/*
use slint::{SharedString, ModelRc, VecModel};
use std::rc::Rc;

fn main() -> Result<(), slint::PlatformError> {
    let main_window = MainWindow::new()?;

    // Example: Set up a data model
    let items = Rc::new(VecModel::from(vec![
        SharedString::from("Item 1"),
        SharedString::from("Item 2"),
        SharedString::from("Item 3"),
    ]));

    // main_window.set_items(ModelRc::from(items));

    // Example: Handle custom callbacks
    let main_window_weak = main_window.as_weak();
    main_window.on_custom_action(move || {
        if let Some(window) = main_window_weak.upgrade() {
            // Handle the action
            window.set_message(SharedString::from("Action performed!"));
        }
    });

    main_window.run()
}
*/