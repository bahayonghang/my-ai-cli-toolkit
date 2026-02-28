use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::Value;

use crate::dto::{ApiError, ErrorDetail};

/// Application-level errors that map to HTTP responses
#[allow(dead_code)]
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    BadRequestWithDetails { message: String, details: Value },
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message, details) = match self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, "not_found", msg, None),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "bad_request", msg, None),
            AppError::BadRequestWithDetails { message, details } => (
                StatusCode::BAD_REQUEST,
                "bad_request",
                message,
                Some(details),
            ),
            AppError::Internal(msg) => {
                tracing::error!("Internal error: {msg}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "internal_error",
                    msg,
                    None,
                )
            }
        };

        let body = ApiError {
            error: ErrorDetail {
                code: code.into(),
                message,
                details,
            },
        };

        (status, axum::Json(body)).into_response()
    }
}
