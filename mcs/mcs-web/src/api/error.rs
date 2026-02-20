use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

use crate::dto::{ApiError, ErrorDetail};

/// Application-level errors that map to HTTP responses
#[allow(dead_code)]
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, "not_found", msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "bad_request", msg),
            AppError::Internal(msg) => {
                tracing::error!("Internal error: {msg}");
                (StatusCode::INTERNAL_SERVER_ERROR, "internal_error", msg)
            }
        };

        let body = ApiError {
            error: ErrorDetail {
                code: code.into(),
                message,
            },
        };

        (status, axum::Json(body)).into_response()
    }
}
