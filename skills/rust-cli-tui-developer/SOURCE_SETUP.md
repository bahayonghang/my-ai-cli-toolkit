# Source Setup Guide

This document explains how to set up the git submodules for the Rust CLI/TUI Developer skill.

## Current Submodule Status

The skill has been configured with the following git submodules:

### ✅ Already Added Submodules

1. **clap** - `git@github.com:clap-rs/clap.git`
   - Purpose: Command-line argument parsing
   - Branch: `master`
   - Location: `source/clap/`
   - Examples: Available in `examples/` directory

2. **inquire** - `git@github.com:mikaelmello/inquire.git`
   - Purpose: Interactive prompts and user input
   - Branch: `main`
   - Location: `source/inquire/`
   - Examples: Available in `examples/` directory

3. **ratatui** - `git@github.com:ratatui/ratatui.git`
   - Purpose: Rich terminal user interface
   - Branch: `main`
   - Location: `source/ratatui/`
   - Examples: Available in `examples/apps/` directory

## Verification Commands

To verify the submodules are properly initialized:

```bash
# Check submodule status
git submodule status

# Should show output similar to:
# bb0b2f17bf94ef94a1e3215e488be08b5668b15d source/clap (heads/master)
# d443a94684e5af971b5e05265c4b511a7f2f4854 source/inquire (heads/main)
# 1dc18bf3cf56a6db4c9f7211bffc0cb7f8b587d0 source/ratatui (heads/main)

# Verify source directories exist
ls source/
# Should output: clap  inquire  ratatui

# Verify each has content
ls source/clap/examples/ | head -5
ls source/inquire/examples/ | head -5
ls source/ratatui/examples/apps/ | head -5
```

## Available Examples

### Clap Examples (`source/clap/examples/`)
- `derive_ref/` - Derive macro examples
- `tutorial_derive/` - Step-by-step tutorial examples
- `cargo-example.rs` - Cargo integration example
- `demo.rs` - Comprehensive demonstration
- `find.rs` - Unix-like find command example

### Inquire Examples (`source/inquire/examples/`)
- `text_simple.rs` - Basic text input
- `select.rs` - Single selection from options
- `multiselect.rs` - Multiple selections
- `confirm.rs` - Yes/no confirmation
- `form.rs` - Complex form with multiple fields
- `custom_type.rs` - Custom input types with validation

### Ratatui Examples (`source/ratatui/examples/apps/`)
- `advanced-widget-impl/` - Custom widget implementation
- `async-github/` - Async data fetching with TUI
- `calendar-explorer/` - Calendar interface
- `chart/` - Data visualization
- `color-explorer/` - Color picker and themes
- `canvas/` - Drawing and graphics

## Updating Submodules

To update submodules to the latest versions:

```bash
# Update all submodules
git submodule update --remote

# Update specific submodule
git submodule update --remote source/clap
git submodule update --remote source/inquire
git submodule update --remote source/ratatui

# Or initialize if not already done
git submodule update --init --recursive
```

## Repository Structure

```
rust-cli-tui-developer/
├── SKILL.md                    # Main skill documentation
├── SOURCE_SETUP.md             # This setup guide
├── source/                     # Git submodules
│   ├── clap/                   # CLI argument parsing library
│   │   ├── examples/           # Usage examples
│   │   ├── docs/              # Documentation
│   │   └── ...
│   ├── inquire/               # Interactive prompts library
│   │   ├── examples/          # Usage examples
│   │   └── ...
│   └── ratatui/              # TUI framework
│       ├── examples/          # Usage examples
│       │   └── apps/         # Complete applications
│       └── ...
└── .gitmodules               # Git submodule configuration
```

## Sparse Checkout Configuration

The submodules are configured with git sparse checkout to minimize repository size:

```bash
# Each submodule includes only essential directories:
# - Examples and documentation
# - Source code
# - Configuration files

# Large files like test data, binaries, and CI artifacts are excluded
```

## Troubleshooting

### Common Issues

1. **Submodule not initialized**
   ```bash
   git submodule update --init --recursive
   ```

2. **Submodule in detached state**
   ```bash
   cd source/clap
   git checkout master
   cd ../inquire
   git checkout main
   cd ../ratatui
   git checkout main
   ```

3. **Update after branch changes**
   ```bash
   git submodule update --remote --merge
   ```

### Verification Scripts

Create a verification script to check everything is working:

```bash
#!/bin/bash
# verify-submodules.sh

echo "🔍 Verifying Rust CLI/TUI skill submodules..."

echo "📁 Checking source directories:"
ls -la source/

echo "📚 Clap examples:"
ls source/clap/examples/ | wc -l
echo "Available examples in clap: $(ls source/clap/examples/*.rs | wc -l)"

echo "🔧 Inquire examples:"
ls source/inquire/examples/ | wc -l
echo "Available examples in inquire: $(ls source/inquire/examples/*.rs | wc -l)"

echo "🖥️  Ratatui examples:"
ls source/ratatui/examples/apps/ | wc -l
echo "Available TUI apps in ratatui: $(ls source/ratatui/examples/apps/ | wc -l)"

echo "✅ Verification complete!"
```

Run this script to ensure all submodules are properly configured and have the expected content.