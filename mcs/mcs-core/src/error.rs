#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Platform not found: {0}")]
    PlatformNotFound(String),

    #[error("Item not found: {0}")]
    ItemNotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),
}

pub type Result<T> = std::result::Result<T, AppError>;
