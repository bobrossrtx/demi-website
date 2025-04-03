use chrono::Utc;
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub is_admin: bool,
    pub exp: usize,
    pub token_type: String, // Added to distinguish between access and refresh tokens
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let validation = Validation::default();
    let token_data = decode::<Claims>(token, &DecodingKey::from_secret(secret.as_ref()), &validation)?;

    // Decode the expiry time
    let expiry_time = token_data.claims.exp;
    let current_time = Utc::now().timestamp() as usize;

    // Check if the token has expired
    if current_time > expiry_time {
        return Err(jsonwebtoken::errors::Error::from(jsonwebtoken::errors::ErrorKind::ExpiredSignature));
    }

    Ok(token_data.claims)
}

pub async fn validate_refresh_token(token: &str) -> Result<String, String> {
    let jwt_secret = std::env::var("JWT_SECRET").map_err(|_| "JWT_SECRET not set".to_string())?;

    // Decode the token
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| "Invalid or expired token".to_string())?;

    // Ensure the token type is "refresh"
    if token_data.claims.token_type != "refresh" {
        return Err("Invalid token type".to_string());
    }

    Ok(token_data.claims.sub) // Return the user ID (sub claim)
}