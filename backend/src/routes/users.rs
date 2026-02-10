use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::PgPool;
use uuid::Uuid;
use serde::Deserialize;

use crate::auth::guards::AuthGuard;
use crate::models::user::{User, UserResponse};
use crate::routes::auth::ErrorResponse;

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub avatar_url: Option<String>,
    pub hide_username: Option<bool>,
}

#[get("/me")]
pub async fn get_current_user(
    auth: AuthGuard,
    pool: &State<PgPool>,
) -> Result<Json<UserResponse>, (Status, Json<ErrorResponse>)> {
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| {
        (
            Status::BadRequest,
            Json(ErrorResponse {
                error: "Invalid user ID".to_string(),
            }),
        )
    })?;

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_optional(pool.inner())
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(ErrorResponse {
                    error: "Database error".to_string(),
                }),
            )
        })?
        .ok_or_else(|| {
            (
                Status::NotFound,
                Json(ErrorResponse {
                    error: "User not found".to_string(),
                }),
            )
        })?;

    Ok(Json(user.into()))
}

#[get("/<username>")]
pub async fn get_user_by_username(
    username: String,
    pool: &State<PgPool>,
) -> Result<Json<UserResponse>, (Status, Json<ErrorResponse>)> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE username = $1")
        .bind(username)
        .fetch_optional(pool.inner())
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(ErrorResponse {
                    error: "Database error".to_string(),
                }),
            )
        })?
        .ok_or_else(|| {
            (
                Status::NotFound,
                Json(ErrorResponse {
                    error: "User not found".to_string(),
                }),
            )
        })?;

    // Create response with username handling
    let response: UserResponse = user.into();
    
    // If user has hide_username enabled, replace username with display name
    if response.hide_username && response.display_name.is_some() {
        // Keep the actual username hidden in public views, but still return it
        // The frontend will handle displaying display_name appropriately
    }

    Ok(Json(response))
}

#[put("/me", data = "<update_data>")]
pub async fn update_profile(
    auth: AuthGuard,
    update_data: Json<UpdateProfileRequest>,
    pool: &State<PgPool>,
) -> Result<Json<UserResponse>, (Status, Json<ErrorResponse>)> {
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| {
        (
            Status::BadRequest,
            Json(ErrorResponse {
                error: "Invalid user ID".to_string(),
            }),
        )
    })?;

    // Validate username uniqueness if provided
    if let Some(ref username) = update_data.username {
        let username_lower = username.to_lowercase();
        
        // Check if username is taken by another user (case-insensitive)
        let existing_user = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM users WHERE LOWER(username) = $1 AND id != $2"
        )
        .bind(&username_lower)
        .bind(user_id)
        .fetch_one(pool.inner())
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(ErrorResponse {
                    error: "Database error".to_string(),
                }),
            )
        })?;

        if existing_user > 0 {
            return Err((
                Status::Conflict,
                Json(ErrorResponse {
                    error: "Username is already taken".to_string(),
                }),
            ));
        }
    }

    // Validate display name uniqueness if provided
    if let Some(ref display_name) = update_data.display_name {
        let display_name_lower = display_name.to_lowercase();
        
        // Check if display name is taken by another user (case-insensitive)
        let existing_display_name = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM users WHERE LOWER(display_name) = $1 AND id != $2"
        )
        .bind(&display_name_lower)
        .bind(user_id)
        .fetch_one(pool.inner())
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(ErrorResponse {
                    error: "Database error".to_string(),
                }),
            )
        })?;

        if existing_display_name > 0 {
            return Err((
                Status::Conflict,
                Json(ErrorResponse {
                    error: "Display name is already taken".to_string(),
                }),
            ));
        }

        // Check if display name matches another user's username (case-insensitive)
        // Allow it to match own username
        let matching_other_username = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM users WHERE LOWER(username) = $1 AND id != $2"
        )
        .bind(&display_name_lower)
        .bind(user_id)
        .fetch_one(pool.inner())
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(ErrorResponse {
                    error: "Database error".to_string(),
                }),
            )
        })?;

        if matching_other_username > 0 {
            return Err((
                Status::Conflict,
                Json(ErrorResponse {
                    error: "Display name cannot match another user's username".to_string(),
                }),
            ));
        }
    }

    let user = sqlx::query_as::<_, User>(
        r#"
        UPDATE users 
        SET username = COALESCE($2, username),
            display_name = COALESCE($3, display_name),
            bio = COALESCE($4, bio),
            avatar_url = COALESCE($5, avatar_url),
            hide_username = COALESCE($6, hide_username),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        "#,
    )
    .bind(user_id)
    .bind(&update_data.username)
    .bind(&update_data.display_name)
    .bind(&update_data.bio)
    .bind(&update_data.avatar_url)
    .bind(&update_data.hide_username)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| {
        // Check if it's a unique constraint violation
        if e.to_string().contains("duplicate key value") || e.to_string().contains("unique constraint") {
            return (
                Status::Conflict,
                Json(ErrorResponse {
                    error: "Username is already taken".to_string(),
                }),
            );
        }
        (
            Status::InternalServerError,
            Json(ErrorResponse {
                error: "Database error".to_string(),
            }),
        )
    })?
    .ok_or_else(|| {
        (
            Status::NotFound,
            Json(ErrorResponse {
                error: "User not found".to_string(),
            }),
        )
    })?;

    Ok(Json(user.into()))
}
