fn main() {
    // Configure the compiler to include our component library
    let mut config = slint_build::CompilerConfiguration::new();

    // Add library path for our components
    let library_paths = std::collections::HashMap::from([
        ("components".to_string(),
         std::path::Path::new(&std::env::var_os("CARGO_MANIFEST_DIR").unwrap())
             .join("ui")
             .join("components")
             .join("lib.slint")),
    ]);

    config = config.with_library_paths(library_paths);

    // Compile with our configuration
    slint_build::compile_with_config("ui/main.slint", config).unwrap();
}