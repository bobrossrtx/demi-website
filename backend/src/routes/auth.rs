use bcrypt::{hash, verify, DEFAULT_COST};
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::PgPool;

use crate::auth::jwt::create_token;
use crate::models::user::{AuthResponse, LoginRequest, RegisterRequest, User};

#[derive(serde::Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[post("/register", data = "<register_data>")]
pub async fn register(
    register_data: Json<RegisterRequest>,
    pool: &State<PgPool>,
    jwt_secret: &State<String>,
) -> Result<Json<AuthResponse>, (Status, Json<ErrorResponse>)> {
    // Validate input
    if register_data.username.len() < 3 {
        return Err((
            Status::BadRequest,
            Json(ErrorResponse {
                error: "Username must be at least 3 characters".to_string(),
            }),
        ));
    }

    if register_data.password.len() < 8 {
        return Err((
            Status::BadRequest,
            Json(ErrorResponse {
                error: "Password must be at least 8 characters".to_string(),
            }),
        ));
    }

    // Hash password
    let password_hash = match hash(&register_data.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => {
            return Err((
                Status::InternalServerError,
                Json(ErrorResponse {
                    error: "Failed to hash password".to_string(),
                }),
            ))
        }
    };

    // Insert user
    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (username, email, password_hash, display_name)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(&register_data.username)
    .bind(&register_data.email)
    .bind(&password_hash)
    .bind(&register_data.display_name)
    .fetch_one(pool.inner())
    .await
    .map_err(|e| {
        let error_msg = if e.to_string().contains("users_username_key") {
            "Username already exists"
        } else if e.to_string().contains("users_email_key") {
            "Email already exists"
        } else {
            "Failed to create user"
        };
        
        (
            Status::BadRequest,
            Json(ErrorResponse {
                error: error_msg.to_string(),
            }),
        )
    })?;

    // Generate JWT
    let token = create_token(user.id, user.username.clone(), user.role.clone(), jwt_secret.inner())
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(ErrorResponse {
                    error: "Failed to generate token".to_string(),
                }),
            )
        })?;

    Ok(Json(AuthResponse {
        token,
        user: user.into(),
    }))
}

#[post("/login", data = "<login_data>")]
pub async fn login(
    login_data: Json<LoginRequest>,
    pool: &State<PgPool>,
    jwt_secret: &State<String>,
) -> Result<Json<AuthResponse>, (Status, Json<ErrorResponse>)> {
    // Find user by username or email
    let user = sqlx::query_as::<_, User>(
        r#"
        SELECT * FROM users
        WHERE username = $1 OR email = $1
        "#,
    )
    .bind(&login_data.username_or_email)
    .fetch_optional(pool.inner())
    .await
    .map_err(|_| {
        (
            Status::InternalServerError,
            Json(ErrorResponse {
                error: "Database error".to_string(),
            }),
        )
    })?;

    let user = user.ok_or_else(|| {
        (
            Status::Unauthorized,
            Json(ErrorResponse {
                error: "Invalid username/email or password".to_string(),
            }),
        )
    })?;

    // Verify password
    let password_valid = verify(&login_data.password, &user.password_hash).map_err(|_| {
        (
            Status::InternalServerError,
            Json(ErrorResponse {
                error: "Failed to verify password".to_string(),
            }),
        )
    })?;

    if !password_valid {
        return Err((
            Status::Unauthorized,
            Json(ErrorResponse {
                error: "Invalid username/email or password".to_string(),
            }),
        ));
    }

    // Check if user is active
    if !user.is_active {
        return Err((
            Status::Forbidden,
            Json(ErrorResponse {
                error: "Account is disabled".to_string(),
            }),
        ));
    }

    // Update last login
    let _ = sqlx::query("UPDATE users SET last_login = NOW() WHERE id = $1")
        .bind(user.id)
        .execute(pool.inner())
        .await;

    // Generate JWT
    let token = create_token(user.id, user.username.clone(), user.role.clone(), jwt_secret.inner())
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(ErrorResponse {
                    error: "Failed to generate token".to_string(),
                }),
            )
        })?;

    Ok(Json(AuthResponse {
        token,
        user: user.into(),
    }))
}
