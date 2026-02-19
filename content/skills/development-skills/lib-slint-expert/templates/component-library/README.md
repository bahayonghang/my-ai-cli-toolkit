# Slint Component Library Template

A comprehensive template for building reusable UI component libraries with Slint. This template demonstrates best practices for component design, organization, and distribution.

## Features

- ✅ Modular component architecture
- ✅ Reusable UI components (Button, Card, Toggle Switch)
- ✅ Consistent styling and theming
- ✅ Component library structure
- ✅ Demo application for testing components
- ✅ Hover states and animations
- ✅ Accessibility considerations
- ✅ Testing framework setup

## Project Structure

```
slint-component-library/
├── Cargo.toml              # Project configuration
├── build.rs                # Build script with library path configuration
├── README.md               # This file
└── src/
    ├── main.rs             # Demo application
    └── ui/
        ├── main.slint      # Demo UI using components
        └── components/
            ├── lib.slint               # Component library exports
            ├── primary-button.slint    # Primary button component
            ├── secondary-button.slint  # Secondary button component
            ├── info-card.slint         # Info card component
            └── toggle-switch.slint     # Toggle switch component
```

## Quick Start

1. **Copy this template** to your project directory
2. **Build and run**:
   ```bash
   cargo run
   ```
3. **Explore the demo** to see all components in action
4. **Customize components** for your specific needs

## Components

### PrimaryButton

A styled primary action button with hover and pressed states.

```slint
PrimaryButton {
    text: "Click Me";
    width: 120px;
    height: 40px;
    background-color: #3498db;
    clicked => { /* handle click */ }
}
```

**Properties:**
- `text` (string): Button text
- `enabled` (bool): Enable/disable button
- `width` (length): Button width
- `height` (length): Button height
- `background-color` (color): Custom background color

**Callbacks:**
- `clicked`: Emitted when button is clicked

### SecondaryButton

An outline-style secondary action button.

```slint
SecondaryButton {
    text: "Cancel";
    clicked => { /* handle click */ }
}
```

**Properties:**
- `text` (string): Button text
- `enabled` (bool): Enable/disable button
- `width` (length): Button width
- `height` (length): Button height
- `border-color` (color): Custom border color
- `text-color` (color): Custom text color

### InfoCard

A reusable card component with title, content, and action button.

```slint
InfoCard {
    title: "Card Title";
    content: "Card description goes here";
    button-text: "Learn More";
    width: 200px;
    height: 150px;
    button-clicked => { /* handle action */ }
}
```

**Properties:**
- `title` (string): Card title
- `content` (string): Card content
- `button-text` (string): Action button text
- `width` (length): Card width
- `height` (length): Card height

**Callbacks:**
- `button-clicked`: Emitted when action button is clicked

### ToggleSwitch

A customizable toggle switch with smooth animations.

```slint
ToggleSwitch {
    checked: false;
    active-color: #3498db;
    toggled => { /* handle toggle */ }
}
```

**Properties:**
- `checked` (bool): Current toggle state
- `enabled` (bool): Enable/disable toggle
- `width` (length): Switch width
- `height` (length): Switch height
- `active-color` (color): Color when checked
- `inactive-color` (color): Color when unchecked

**Callbacks:**
- `toggled(bool)`: Emitted when toggle state changes

## Creating New Components

### 1. Component Structure

Create a new `.slint` file in `src/ui/components/`:

```slint
// my-component.slint
export component MyComponent inherits Rectangle {
    // Public properties
    property <string> text: "Default Text";
    property <bool> enabled: true;

    // Public callbacks
    callback clicked;

    // Component styling
    background: white;
    border-radius: 8px;

    // Component content
    Text {
        text: root.text;
        horizontal-alignment: center;
        vertical-alignment: center;
    }

    // Interaction
    TouchArea {
        enabled: root.enabled;
        clicked => { root.clicked(); }
    }
}
```

### 2. Export Component

Add your component to `src/ui/components/lib.slint`:

```slint
import { MyComponent } from "my-component.slint";

// Add to existing export statement
export { PrimaryButton, SecondaryButton, InfoCard, ToggleSwitch, MyComponent };
```

### 3. Use Component

Import and use in your main UI:

```slint
import { MyComponent } from "components";

// In your component tree
MyComponent {
    text: "Hello, World!";
    clicked => { /* handle click */ }
}
```

## Component Design Guidelines

### Consistency

- **Naming**: Use PascalCase for component names
- **Properties**: Use kebab-case for property names
- **Callbacks**: Use verb phrases for callback names
- **Styling**: Maintain consistent colors and spacing

### Accessibility

- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Focus States**: Provide clear visual feedback for focus
- **Text Contrast**: Ensure sufficient color contrast
- **Semantic Names**: Use meaningful text and labels

### Performance

- **Minimal Animations**: Use animations sparingly and efficiently
- **Simple Properties**: Keep property calculations simple
- **Efficient Layouts**: Use appropriate layout containers
- **Avoid Nesting**: Minimize deep component nesting

## Testing Components

The template includes testing setup for components:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use slint_testing::*;

    #[test]
    fn test_primary_button_click() {
        let app = ComponentLibraryDemo::new().unwrap();

        // Simulate button click
        app.get_primary_button().clicked().emit();

        // Verify notification text updated
        assert_eq!(app.get_notification_text(), "Primary button clicked!");
    }
}
```

## Customization

### Theming

Update component colors and styles:

```slint
// Define theme colors
export global Theme {
    in-out property <color> primary: #3498db;
    in-out property <color> secondary: #6c757d;
    in-out property <color> success: #28a745;
    in-out property <color> danger: #dc3545;
}

// Use in components
background: Theme.primary;
```

### Component Variants

Create different style variants:

```slint
export component PrimaryButton inherits Rectangle {
    property <string> variant: "default"; // "default", "large", "small"

    // Size variants
    width: variant == "large" ? 160px : (variant == "small" ? 100px : 120px);
    height: variant == "large" ? 48px : (variant == "small" ? 32px : 40px);
}
```

## Building for Distribution

To distribute your component library:

1. **Create a library crate** in your `Cargo.toml`:
   ```toml
   [lib]
   name = "my-ui-components"
   path = "src/lib.rs"
   ```

2. **Create public API** in `src/lib.rs`:
   ```rust
   #![cfg_attr(not(test), no_std)]

   pub use slint::include_modules!;

   // Re-export components for external use
   slint::include_modules!();
   ```

3. **Publish to crates.io** or use as a local path dependency

## Best Practices

### Component Design

- **Single Responsibility**: Each component should have one clear purpose
- **Composable**: Components should work well together
- **Configurable**: Use properties for customization
- **Accessible**: Follow accessibility guidelines
- **Testable**: Design components that can be tested

### API Design

- **Consistent Naming**: Use consistent property and callback names
- **Documentation**: Document all public properties and callbacks
- **Backward Compatibility**: Avoid breaking changes in updates
- **Type Safety**: Use appropriate Slint types

### Performance

- **Lazy Loading**: Load components only when needed
- **Efficient Updates**: Minimize unnecessary re-renders
- **Memory Management**: Clean up resources properly
- **Animation Performance**: Use efficient animation techniques

## Next Steps

- 🎨 **Add more components**: Expand your library with more UI elements
- 🧪 **Write tests**: Add comprehensive tests for all components
- 📚 **Create documentation**: Document usage examples and patterns
- 🚀 **Build examples**: Create example applications using your components
- 📦 **Package for distribution**: Prepare your library for sharing

---

*Ready to build your own component library? Start customizing these templates and add your own components!*