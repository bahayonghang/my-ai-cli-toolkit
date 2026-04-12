slint::include_modules!();

fn main() -> Result<(), slint::PlatformError> {
    let app = ComponentLibraryDemo::new()?;

    // Demo app interaction handlers
    let window_weak = app.as_weak();
    app.on_primary_button_clicked(move || {
        let window = window_weak.unwrap();
        window.set_notification_text("Primary button clicked!");
    });

    let window_weak = app.as_weak();
    app.on_secondary_button_clicked(move || {
        let window = window_weak.unwrap();
        window.set_notification_text("Secondary button clicked!");
    });

    let window_weak = app.as_weak();
    app.on_card_button_clicked(move |card_index| {
        let window = window_weak.unwrap();
        let message = format!("Card {} clicked!", card_index);
        window.set_notification_text(message.into());
    });

    let window_weak = app.as_weak();
    app.on_switch_toggled(move |is_on| {
        let window = window_weak.unwrap();
        let status = if is_on { "ON" } else { "OFF" };
        let message = format!("Switch is now {}", status);
        window.set_notification_text(message.into());
    });

    app.run()
}