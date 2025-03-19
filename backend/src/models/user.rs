use serde::{Deserialize, Serialize};
use bcrypt::{hash, verify, DEFAULT_COST};
use mongodb::{bson::{self, doc}, Collection};
use rocket::http::Status;
use rocket::serde::json::Json;
use jsonwebtoken::{encode, Header, EncodingKey};
use chrono;

use crate::auth::jwt::verify_token;
use crate::utils::cloudinary::upload_image_to_cloudinary_from_url;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id")]
    pub id: String,
    pub username: String,
    pub email: String,
    pub password: String,
    #[serde(default)]
    pub is_admin: bool,
    pub created_at: String,
    pub updated_at: String,
    pub bio: Option<String>,
    pub name: Option<String>,
    pub profile_picture: String, // Add profile picture field
    pub profile_picture_public_id: String, // Add public ID for the profile picture
    #[serde(default = "default_email_private")]
    pub email_private: bool, // Changed to default to true
}

// Add a function to provide the default value
fn default_email_private() -> bool {
    true
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    pub bio: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub token: String,
    pub username: String,
    pub is_admin: bool,
    pub profile_picture: String,
    pub profile_picture_public_id: String, // Add public ID for the profile picture
    pub email_private: bool, // Include email privacy setting
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub is_admin: bool,
    pub exp: usize,
}

#[derive(Debug, Deserialize)]
pub struct PasswordResetRequest {
    pub token: String,
    pub new_password: String,
}

#[derive(Debug, Deserialize)]
pub struct RegistrationRequest {
    pub username: String,
    pub email: String,
    pub password: String,
    #[serde(default)]
    pub is_admin: bool,
    pub bio: Option<String>,
    pub name: Option<String>,
}

impl User {
    pub async fn register(
        registration_request: Json<RegistrationRequest>,
        db: &Collection<User>,
    ) -> Result<Status, (Status, String)> {
        // Check if username already exists
        match db.find_one(doc! { "username": &registration_request.username }).await {
            Ok(Some(_)) => {
                // Username already exists
                return Err((Status::Conflict, "Username already exists".to_string()));
            }
            Ok(None) => {
                // Username is available, proceed with registration
                let hashed_password = match hash(&registration_request.password, DEFAULT_COST) {
                    Ok(hp) => hp,
                    Err(err) => {
                        eprintln!("Password hashing error: {:?}", err);
                        return Err((Status::InternalServerError, "Failed to hash password".to_string()));
                    }
                };

                // Upload default profile picture to Cloudinary
                println!("Uploading default profile picture to Cloudinary...");
                let pub_id;

                let profile_picture_url = match upload_image_to_cloudinary_from_url("http://127.0.0.1:8000/static/images/default-avatar.jpg").await {
                    Ok((url, public_id)) => {
                        println!("Profile picture uploaded successfully: {}", url);
                        pub_id = public_id;
                        url
                    },
                    Err(err) => {
                        eprintln!("Image upload error: {:?}", err);
                        return Err((Status::InternalServerError, "Failed to upload profile picture".to_string()));
                    }
                };

                let new_user = User {
                    id: bson::oid::ObjectId::new().to_hex(),
                    username: registration_request.username.clone(),
                    email: registration_request.email.clone(),
                    password: hashed_password,
                    is_admin: registration_request.is_admin,
                    created_at: bson::DateTime::now().to_string(),
                    updated_at: bson::DateTime::now().to_string(),
                    bio: registration_request.bio.clone(),
                    name: registration_request.name.clone(),
                    profile_picture: profile_picture_url, // Set profile picture URL
                    profile_picture_public_id: pub_id, // Set default public ID
                    email_private: true, // Explicitly set to true for new registrations
                };

                match db.insert_one(new_user).await {
                    Ok(_) => Ok(Status::Created),
                    Err(err) => {
                        eprintln!("MongoDB insertion error: {:?}", err);
                        Err((Status::InternalServerError, format!("Database error: {:?}", err)))
                    }
                }
            }
            Err(err) => {
                eprintln!("MongoDB find error: {:?}", err);
                Err((Status::InternalServerError, format!("Database error: {:?}", err)))
            }
        }
    }

    pub async fn login(login_request: Json<LoginRequest>, db: &Collection<User>, jwt_secret: &str) -> Result<LoginResponse, (Status, String)> {
        let stored_user = db.find_one(doc! { "username": &login_request.username }).await
            .map_err(|_| (Status::InternalServerError, "Database error".to_string()))?
            .ok_or((Status::Unauthorized, "Invalid username or password".to_string()))?;
    
        let valid = verify(&login_request.password, &stored_user.password)
            .map_err(|_| (Status::InternalServerError, "Password verification error".to_string()))?;
    
        if !valid {
            return Err((Status::Unauthorized, "Invalid username or password".to_string()));
        }

        let claims = Claims {
            sub: stored_user.id.clone(),
            is_admin: stored_user.is_admin,
            exp: (chrono::Utc::now() + chrono::Duration::hours(24)).timestamp() as usize,
        };
    
        let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.as_ref()))
            .map_err(|_| (Status::InternalServerError, "Token creation error".to_string()))?;
    
        Ok(LoginResponse {
            token,
            is_admin: stored_user.is_admin,
            username: stored_user.username,
            email: stored_user.email,
            name: stored_user.name,
            bio: stored_user.bio,
            created_at: stored_user.created_at,
            updated_at: stored_user.updated_at,
            id: stored_user.id.clone(),
            profile_picture: stored_user.profile_picture,
            profile_picture_public_id: stored_user.profile_picture_public_id,
            email_private: stored_user.email_private, // Include email privacy setting
        })
    }

    pub async fn generate_password_reset_token(
        email: String,
        db: &Collection<User>,
        jwt_secret: &str,
    ) -> Result<String, (Status, String)> {
        let user = db.find_one(doc! { "email": &email }).await
            .map_err(|_| (Status::InternalServerError, "Database error".to_string()))?
            .ok_or((Status::NotFound, "User not found".to_string()))?;
    
        let claims = Claims {
            sub: user.id.clone(),
            is_admin: user.is_admin,
            exp: (chrono::Utc::now() + chrono::Duration::hours(1)).timestamp() as usize,
        };
    
        let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.as_ref()))
            .map_err(|_| (Status::InternalServerError, "Token creation error".to_string()))?;
    
        // Here you would send the token to the user's email address
        // but instead, we handle this on the frontend for simplicity.
        Ok(token)
    }

    pub async fn reset_password(
        reset_data: Json<PasswordResetRequest>,
        db: &Collection<User>,
        jwt_secret: &str,
    ) -> Result<Status, (Status, String)> {
        let token = reset_data.token.trim_start_matches("Bearer ");
        let claims = verify_token(token, jwt_secret).map_err(|_| (Status::Unauthorized, "Invalid token".to_string()))?;
    
        let hashed_password = hash(&reset_data.new_password, DEFAULT_COST)
            .map_err(|_| (Status::InternalServerError, "Password hashing error".to_string()))?;
    
        let filter = doc! { "_id": bson::oid::ObjectId::parse_str(&claims.sub).unwrap() };
        let update = doc! { "$set": { "password": hashed_password } };
    
        db.update_one(filter, update).await
            .map_err(|_| (Status::InternalServerError, "Database error".to_string()))?;
    
        Ok(Status::Ok)
    }
}