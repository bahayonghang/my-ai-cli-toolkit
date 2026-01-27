fn main() {
    let mut config = slint_build::CompilerConfiguration::new();

    // Platform-specific configuration
    #[cfg(target_os = "windows")]
    {
        config = config.with_style("fluent");
        println!("cargo:rustc-link-arg-bins=/SUBSYSTEM:WINDOWS");
    }

    #[cfg(target_os = "macos")]
    {
        config = config.with_style("native");
    }

    #[cfg(target_os = "linux")]
    {
        config = config.with_style("material");
    }

    #[cfg(target_arch = "wasm32")]
    {
        config = config.with_style("material");
    }

    // Compile the UI
    slint_build::compile_with_config("ui/main.slint", config).unwrap();

    // Print target information for debugging
    println!("cargo:rerun-if-changed=ui/main.slint");
    println!("cargo:rerun-if-changed=build.rs");
}