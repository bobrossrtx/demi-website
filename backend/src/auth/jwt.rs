use jsonwebtoken::{decode, DecodingKey, Validation, errors::Error};
use serde::{Deserialize, Serialize};
use tracing;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub is_admin: bool,
    pub exp: usize,
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, Error> {
    tracing::debug!("Attempting to verify token");
    let key = DecodingKey::from_secret(secret.as_bytes());
    let validation = Validation::default();
    match decode::<Claims>(token, &key, &validation) {
        Ok(token_data) => {
            tracing::debug!("Token successfully decoded");
            Ok(token_data.claims)
        }
        Err(err) => {
            tracing::error!("Token verification failed: {:?}", err);
            Err(err)
        }
    }
}