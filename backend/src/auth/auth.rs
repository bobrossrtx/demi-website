use rocket::serde::json::Json;
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::State;
use mongodb::{bson, Collection};
use crate::models::user::{LoginResponse, User, LoginRequest, PasswordResetRequest, RegistrationRequest};
use mongodb::bson::doc;
use crate::auth::jwt::verify_token; // Make sure this import exists

pub const SECURE_COST: u32 = 12; // Set a secure cost value for bcrypt
use log::info;
use serde::{Deserialize, Serialize};
use rocket::fs::TempFile;
use rocket::form::Form;
use crate::utils::cloudinary::{delete_image_from_cloudinary, upload_image_to_cloudinary_from_file};
use jsonwebtoken::{encode, Header, EncodingKey};
use crate::auth::jwt::Claims;
use crate::middleware::rate_limiter::RateLimiter;

#[derive(Deserialize)]
pub struct EmailRequest {
    email: String,
}

#[derive(Serialize, Deserialize)]
pub struct TokenResponse {
    token: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    message: String,
}

#[derive(Serialize, Deserialize)]
pub struct UserProfile {
    pub name: String,
    pub email: String,
    pub email_private: bool,
    pub bio: String,
    pub profile_picture: String,
    pub profile_picture_public_id: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct ProfilePictureResponse {
    pub profile_picture: String,
    pub profile_picture_public_id: String,
}

#[derive(FromForm)]
pub struct ProfilePictureUpload<'f> {
    profile_picture: TempFile<'f>,
}

#[derive(Deserialize)]
pub struct ChangePasswordRequest {
    current_password: String,
    new_password: String,
}

#[derive(Deserialize)]
pub struct DeleteProfileRequest {
    password: String,
}


#[post("/register", data = "<user>")]
pub async fn register(
    user: Json<RegistrationRequest>,
    user_collection: &State<Collection<User>>,
    jwt_secret: &State<String>,
    rate_limiter: &RateLimiter,
) -> Result<Json<TokenResponse>, (Status, String)> {
    // Rate limiter check
    let client_id = "register"; // Use a unique identifier for this route
    if !rate_limiter.check_rate_limit(client_id) {
        return Err((Status::TooManyRequests, "Too many requests. Please try again later.".to_string()));
    }

    // Generate a unique ID for the user
    let user_id = bson::oid::ObjectId::new().to_hex();

    // Create the new user object
    let new_user = User {
        id: user_id.clone(), // Use the same ID for the database and the token
        username: user.username.clone(),
        email: user.email.clone(),
        password: bcrypt::hash(&user.password, SECURE_COST).map_err(|_| (Status::InternalServerError, "Failed to hash password".to_string()))?,
        is_admin: false,
        created_at: bson::DateTime::now().to_string(),
        updated_at: bson::DateTime::now().to_string(),
        bio: Some("No Bio Available".to_string()),
        name: None,
        profile_picture: "https://res.cloudinary.com/demi-website/image/upload/v1742299570/.tmpOhIOAf.jpg".to_string(),
        profile_picture_public_id: ".tmpOhIOAf.jpg".to_string(),
        email_private: true,
        verified: false,
    };

    // Insert the user into the database
    user_collection.insert_one(&new_user).await.map_err(|_| (Status::InternalServerError, "Failed to save user".to_string()))?;

    // Generate a verification token
    let claims = Claims {
        sub: new_user.id.clone(),
        is_admin: false,
        exp: (chrono::Utc::now() + chrono::Duration::minutes(30)).timestamp() as usize, // Set expiry to 30 minutes from now
    };
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.inner().as_ref()))
        .map_err(|_| (Status::InternalServerError, "Failed to generate token".to_string()))?;

    Ok(Json(TokenResponse { token }))
}

#[post("/login", data = "<login_request>")]
pub async fn login(
    login_request: Json<LoginRequest>,
    user_collection: &State<Collection<User>>,
    jwt_secret: &State<String>,
    rate_limiter: &RateLimiter,
) -> Result<Json<LoginResponse>, (Status, String)> {
    // Rate limiter check
    let client_id = "login"; // Use a unique identifier for this route
    if !rate_limiter.check_rate_limit(client_id) {
        return Err((Status::TooManyRequests, "Too many requests. Please try again later.".to_string()));
    }

    match User::login(login_request, user_collection, jwt_secret.inner()).await {
        Ok(user) => {
            let response = LoginResponse {
                id: user.id.to_string(), // Convert ObjectId to hex string
                token: user.token,
                is_admin: user.is_admin,
                email: user.email,
                name: user.name,
                bio: user.bio,
                created_at: user.created_at,
                updated_at: user.updated_at,
                username: user.username,
                profile_picture: user.profile_picture,
                profile_picture_public_id: user.profile_picture_public_id,
                email_private: user.email_private,
                verified: user.verified,
                verified_at: user.verified_at,
            };
            Ok(Json(response))
        }
        Err((status, message)) => Err((status, message)),
    }
}

#[post("/generate-reset-token", data = "<email_request>")]
pub async fn generate_reset_token(
    email_request: Json<EmailRequest>,
    user_collection: &State<Collection<User>>,
    jwt_secret: &State<String>,
    rate_limiter: &RateLimiter,
) -> Result<Json<TokenResponse>, (Status, String)> {
    // Rate limiter check
    let client_id = "generate-reset-token"; // Use a unique identifier for this route
    if !rate_limiter.check_rate_limit(client_id) {
        return Err((Status::TooManyRequests, "Too many requests. Please try again later.".to_string()));
    }

    match User::generate_password_reset_token(email_request.email.clone(), user_collection, jwt_secret.inner()).await {
        Ok(token) => Ok(Json(TokenResponse { token })),
        Err((status, e)) => Err((status, e))
    }
}

#[post("/reset-password", data = "<reset_data>")]
pub async fn reset_password(
    reset_data: Json<PasswordResetRequest>,
    user_collection: &State<Collection<User>>,
    jwt_secret: &State<String>,
    rate_limiter: &RateLimiter,
) -> Result<Status, (Status, String)> {
    // Rate limiter check
    let client_id = "reset-password"; // Use a unique identifier for this route
    if !rate_limiter.check_rate_limit(client_id) {
        return Err((Status::TooManyRequests, "Too many requests. Please try again later.".to_string()));
    }

    match User::reset_password(reset_data, user_collection, jwt_secret.inner()).await {
        Ok(_) => Ok(Status::Ok),
        Err((_, message)) => Err((Status::BadRequest, message))
    }
}

#[warn(private_interfaces)]
pub struct AuthHeader<'r>(pub &'r str);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthHeader<'r> {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        match request.headers().get_one("Authorization") {
            Some(auth_header) => Outcome::Success(AuthHeader(auth_header)),
            None => Outcome::Error((Status::Unauthorized, ())),
        }
    }
}

#[get("/verify-admin")]
pub async fn verify_admin(jwt_secret: &State<String>, auth_header: AuthHeader<'_>) -> Result<Status, (Status, String)> {
    let token = auth_header.0.trim_start_matches("Bearer ");
    match verify_token(token, jwt_secret.inner()) {
        Ok(claims) => {
            if claims.is_admin {
                Ok(Status::Ok)
            } else {
                Err((Status::Forbidden, "User is not an admin".to_string()))
            }
        },
        Err(err) => {
            info!("Error: {:?}", err);
            Err((Status::Unauthorized, format!("Invalid token: {}", token)))
        },
    }
}

#[get("/profile/<user_id_or_username>")]
pub async fn get_profile(user_id_or_username: &str, user_collection: &State<Collection<User>>) -> Result<Json<UserProfile>, (Status, String)> {
    let filter = if user_id_or_username.starts_with("id:") {
        doc! { "id": &user_id_or_username[3..] }
    } else {
        doc! { "username": user_id_or_username }
    };

    match user_collection.find_one(filter).await {
        Ok(Some(user)) => {
            let is_own_profile = user_id_or_username.starts_with("id:");
            // If email is private and it's not the user's own profile, hide the email
            let email_to_display = if user.email_private && !is_own_profile {
                "Email hidden for privacy".to_string()
            } else {
                user.email
            };
            
            let profile = UserProfile {
                name: user.username,
                email: email_to_display,
                email_private: user.email_private,
                bio: user.bio.unwrap_or_else(|| "No bio available".to_string()),
                profile_picture: if user.profile_picture.is_empty() { "No profile picture available".to_string() } else { user.profile_picture },
                profile_picture_public_id: user.profile_picture_public_id,
                created_at: user.created_at,
                updated_at: user.updated_at,
            };
            Ok(Json(profile))
        }
        Ok(None) => Err((Status::NotFound, "User not found".to_string())),
        Err(_) => Err((Status::InternalServerError, "Internal server error".to_string())),
    }
}

#[put("/profile/<user_id>", data = "<profile>")]
pub async fn edit_profile(
    user_id: &str,
    profile: Json<UserProfile>,
    user_collection: &State<Collection<User>>,
) -> Result<Json<UserProfile>, (Status, String)> {
    let update_doc = doc! {
        "$set": {
            "username": &profile.name,
            "email": &profile.email,
            "bio": &profile.bio,
            "profile_picture": &profile.profile_picture,
            "profile_picture_public_id": &profile.profile_picture_public_id,
            "email_private": profile.email_private,
            "updated_at": chrono::Utc::now().to_string(),
        }
    };

    match user_collection.update_one(doc! { "id": user_id }, update_doc).await {
        Ok(_) => {
            match user_collection.find_one(doc! { "id": user_id }).await {
                Ok(Some(updated_user)) => {
                    let updated_profile = UserProfile {
                        name: updated_user.username,
                        email: updated_user.email,
                        email_private: updated_user.email_private,
                        bio: updated_user.bio.unwrap_or_else(|| "No bio available".to_string()),
                        profile_picture: if updated_user.profile_picture.is_empty() {
                            "https://res.cloudinary.com/demi-website/image/upload/v1742299570/.tmpOhIOAf.jpg".to_string()
                        } else {
                            updated_user.profile_picture
                        },
                        profile_picture_public_id: updated_user.profile_picture_public_id,
                        created_at: updated_user.created_at,
                        updated_at: updated_user.updated_at,
                    };
                    Ok(Json(updated_profile))
                }
                Ok(None) => Err((Status::NotFound, "User not found".to_string())),
                Err(_) => Err((Status::InternalServerError, "Failed to retrieve updated user".to_string())),
            }
        }
        Err(_) => Err((Status::InternalServerError, "Failed to update profile".to_string())),
    }
}

#[put("/profile/edit/<user_id>/profile_picture", data = "<profile_picture>")]
pub async fn update_profile_picture(
    user_id: &str,
    mut profile_picture: Form<ProfilePictureUpload<'_>>,
    user_collection: &State<Collection<User>>,
) -> Result<Json<ProfilePictureResponse>, (Status, String)> {
    // Save the file to a temporary location
    let temp_path = format!("/tmp/{}", uuid::Uuid::new_v4());
    profile_picture.profile_picture.persist_to(&temp_path).await.unwrap();

    let file_path = temp_path.as_str();

    // Upload the image to Cloudinary
    match upload_image_to_cloudinary_from_file(file_path).await {
        Ok((url, public_id)) => {
            // Update the user's profile picture in the database
            let update_result = user_collection.update_one(
                doc! { "id": user_id },
                doc! { "$set": { "profile_picture": url.clone(), "profile_picture_public_id": public_id.clone() } }
            ).await;

            match update_result {
                Ok(_) => Ok(Json(ProfilePictureResponse { profile_picture: url, profile_picture_public_id: public_id })),
                Err(_) => Err((Status::InternalServerError, "Failed to update profile picture".to_string())),
            }
        }
        Err(_) => Err((Status::InternalServerError, "Failed to upload image".to_string())),
    }
}


#[delete("/profile/<user_id>/profile_picture")]
pub async fn delete_profile_picture(
    user_id: &str,
    user_collection: &State<Collection<User>>,
) -> Result<Status, (Status, String)> {
    // Fetch the user's current profile picture URL
    let user = user_collection.find_one(doc! { "id": user_id }).await.map_err(|_| (Status::InternalServerError, "Database error".to_string()))?;
    
    if let Some(user) = user {       
        // Confirm that the profile picture isn't default
        if user.profile_picture == "https://res.cloudinary.com/demi-website/image/upload/v1742299570/.tmpOhIOAf.jpg" {
            return Err((Status::BadRequest, "Cannot delete default profile picture".to_string()));
        }

        // Delete the image from Cloudinary
        if let Err(_) = delete_image_from_cloudinary(&user.profile_picture_public_id).await {
            eprintln!("Failed to delete image from Cloudinary");
            return Err((Status::InternalServerError, "Failed to delete image from Cloudinary".to_string()));
        }

        // Update the user's profile picture URL in the database
        let update_result = user_collection.update_one(
            doc! { "id": user_id },
            doc! { "$set": { "profile_picture": "", "profile_picture_public_id": "" } }
        ).await;

        match update_result {
            Ok(_) => Ok(Status::Ok),
            Err(_) => Err((Status::InternalServerError, "Failed to update profile picture".to_string())),
        }
    } else {
        Err((Status::NotFound, "User not found".to_string()))
    }
}

#[put("/change-password/<user_id>", data = "<change_request>")]
pub async fn change_password(
    user_id: &str,
    change_request: Json<ChangePasswordRequest>,
    user_collection: &State<Collection<User>>,
    auth_header: AuthHeader<'_>
) -> Result<Status, (Status, Json<ErrorResponse>)> {
    // Verify the authentication token
    let token = auth_header.0.trim_start_matches("Bearer ");
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    
    match verify_token(token, &jwt_secret) {
        Ok(claims) => {
            // Make sure the user is changing their own password or is an admin
            if claims.sub != user_id && !claims.is_admin {
                return Err((Status::Forbidden, Json(ErrorResponse { message: "Unauthorized to change this user's password".to_string() })));
            }
            
            // Fetch the user from the database
            let user_result = user_collection.find_one(doc! { "id": user_id }).await;
            
            match user_result {
                Ok(Some(user)) => {
                    // Verify the current password
                    match bcrypt::verify(&change_request.current_password, &user.password) {
                        Ok(true) => {
                            // Hash the new password
                            let hashed_password = match bcrypt::hash(&change_request.new_password, SECURE_COST) {
                                Ok(hashed) => hashed,
                                Err(_) => return Err((Status::InternalServerError, Json(ErrorResponse { message: "Failed to hash new password".to_string() }))),
                            };
                            
                            // Update the password in the database
                            let update_result = user_collection.update_one(
                                doc! { "id": user_id },
                                doc! { "$set": { "password": hashed_password } }
                            ).await;
                            
                            match update_result {
                                Ok(_) => Ok(Status::Ok),
                                Err(_) => Err((Status::InternalServerError, Json(ErrorResponse { message: "Failed to update password".to_string() }))),
                            }
                        },
                        Ok(false) => {
                            Err((Status::Unauthorized, Json(ErrorResponse { message: "Current password is incorrect".to_string() })))
                        },
                        Err(_) => Err((Status::InternalServerError, Json(ErrorResponse { message: "Password verification failed".to_string() }))),
                    }
                },
                Ok(None) => Err((Status::NotFound, Json(ErrorResponse { message: "User not found".to_string() }))),
                Err(_) => Err((Status::InternalServerError, Json(ErrorResponse { message: "Database error".to_string() }))),
            }
        },
        Err(_) => Err((Status::Unauthorized, Json(ErrorResponse { message: "Invalid authentication token".to_string() }))),
    }
}

#[delete("/profile/<user_id>", data = "<delete_request>")]
pub async fn delete_profile(
    user_id: &str,
    delete_request: Json<DeleteProfileRequest>,
    user_collection: &State<Collection<User>>,
    auth_header: AuthHeader<'_>
) -> Result<Status, (Status, Json<ErrorResponse>)> {
    // Verify the authentication token
    let token = auth_header.0.trim_start_matches("Bearer ");
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    
    match verify_token(token, &jwt_secret) {
        Ok(claims) => {
            // Make sure the user is deleting their own account or is an admin
            if claims.sub != user_id && !claims.is_admin {
                return Err((Status::Forbidden, Json(ErrorResponse { message: "Unauthorized to delete this user's profile".to_string() })));
            }
            
            // Fetch the user from the database
            let user_result = user_collection.find_one(doc! { "id": user_id }).await;
            
            match user_result {
                Ok(Some(user)) => {
                    // Verify the password
                    match bcrypt::verify(&delete_request.password, &user.password) {
                        Ok(true) => {
                            // Delete the profile picture from Cloudinary if it exists
                            if !user.profile_picture_public_id.is_empty() {
                                if let Err(_) = delete_image_from_cloudinary(&user.profile_picture_public_id).await {
                                    eprintln!("Failed to delete profile picture from Cloudinary during account deletion");
                                    // Continue with account deletion even if image deletion fails
                                }
                            }
                            
                            // Delete the user from the database
                            let delete_result = user_collection.delete_one(doc! { "id": user_id }).await;
                            
                            match delete_result {
                                Ok(_) => Ok(Status::Ok),
                                Err(_) => Err((Status::InternalServerError, Json(ErrorResponse { message: "Failed to delete profile".to_string() }))),
                            }
                        },
                        Ok(false) => {
                            Err((Status::Unauthorized, Json(ErrorResponse { message: "Password is incorrect".to_string() })))
                        },
                        Err(_) => Err((Status::InternalServerError, Json(ErrorResponse { message: "Password verification failed".to_string() }))),
                    }
                },
                Ok(None) => Err((Status::NotFound, Json(ErrorResponse { message: "User not found".to_string() }))),
                Err(_) => Err((Status::InternalServerError, Json(ErrorResponse { message: "Database error".to_string() }))),
            }
        },
        Err(_) => Err((Status::Unauthorized, Json(ErrorResponse { message: "Invalid authentication token".to_string() }))),
    }
}

#[get("/verify-account?<token>")]
pub async fn verify_account(
    token: &str,
    user_collection: &State<Collection<User>>,
    jwt_secret: &State<String>,
) -> Result<Status, (Status, String)> {
    // Decode and verify the token
    match verify_token(token, jwt_secret.inner()) {
        Ok(claims) => {
            // Log the sub claim for debugging
            println!("Token sub claim: {}", claims.sub);

            // Query the database using the `id` field
            println!("Querying database with id: {}", claims.sub);
            match user_collection
                .update_one(
                    doc! { "id": &claims.sub },
                    doc! { "$set": { "verified": true, "verified_at": chrono::Utc::now().to_string() } }
                )
                .await
            {
                Ok(update_result) => {
                    println!("Update result: {:?}", update_result);
                    if update_result.matched_count == 0 {
                        println!("No user found with id: {}", claims.sub);
                        Err((Status::NotFound, "User not found".to_string()))
                    } else {
                        println!("User with id: {} successfully verified", claims.sub);
                        Ok(Status::Ok)
                    }
                }
                Err(err) => {
                    eprintln!("Database update error: {:?}", err);
                    Err((Status::InternalServerError, "Failed to verify account".to_string()))
                }
            }
        }
        Err(err) => {
            eprintln!("Token verification error: {:?}", err);
            Err((Status::Unauthorized, "Invalid or expired token".to_string()))
        }
    }
}