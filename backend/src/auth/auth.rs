use rocket::serde::json::Json;
use rocket::http::{Cookie, CookieJar};
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::State;
use mongodb::Collection;
use crate::models::user::{LoginResponse, User, LoginRequest, PasswordResetRequest, RegistrationRequest};
use mongodb::bson::doc; // Import the `doc` macro
use crate::auth::jwt::{Claims, verify_token, validate_refresh_token};
use crate::middleware::rate_limiter::RateLimiter;
use crate::utils::cloudinary::{delete_image_from_cloudinary, upload_image_to_cloudinary_from_file};
use jsonwebtoken::{encode, Header, EncodingKey};
use log::info;
use serde::{Deserialize, Serialize};
use rocket::fs::TempFile;
use rocket::form::Form;
use serde_json::Value;
use rocket::serde::json::json;

// Define the secure cost for bcrypt
const SECURE_COST: u32 = 12;

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
    pub username: String,
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

    match User::register(user.into_inner(), user_collection).await {
        Ok(new_user) => {
            let claims = Claims {
                sub: new_user.id.clone(),
                is_admin: new_user.is_admin,
                exp: (chrono::Utc::now() + chrono::Duration::minutes(30)).timestamp() as usize,
                token_type: "access".to_string(), // Set token type to "access"
            };

            let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.inner().as_ref()))
                .map_err(|_| (Status::InternalServerError, "Failed to generate token".to_string()))?;

            Ok(Json(TokenResponse { token }))
        }
        Err((status, message)) => Err((status, message)),
    }
}

#[post("/login", data = "<login_request>")]
pub async fn login(
    login_request: Json<LoginRequest>,
    user_collection: &State<Collection<User>>,
    jwt_secret: &State<String>,
    rate_limiter: &RateLimiter,
    cookies: &CookieJar<'_>, // Added CookieJar for setting cookies
) -> Result<Json<LoginResponse>, (Status, String)> {
    info!("Login endpoint hit with username: {}", login_request.username);

    // Rate limiter check
    let client_id = "login"; // Use a unique identifier for this route
    if !rate_limiter.check_rate_limit(client_id) {
        info!("Rate limit exceeded for client_id: {}", client_id);
        return Err((Status::TooManyRequests, "Too many requests. Please try again later.".to_string()));
    }

    match User::login(login_request, user_collection, jwt_secret.inner()).await {
        Ok(user) => {
            info!("User logged in successfully: {}", user.email);

            let access_claims = Claims {
                sub: user.id.clone(),
                is_admin: user.is_admin,
                exp: (chrono::Utc::now() + chrono::Duration::minutes(15)).timestamp() as usize,
                token_type: "access".to_string(),
            };

            let refresh_claims = Claims {
                sub: user.id.clone(),
                is_admin: user.is_admin,
                exp: (chrono::Utc::now() + chrono::Duration::days(7)).timestamp() as usize,
                token_type: "refresh".to_string(),
            };

            let access_token = encode(&Header::default(), &access_claims, &EncodingKey::from_secret(jwt_secret.inner().as_ref()))
                .map_err(|_| (Status::InternalServerError, "Failed to generate access token".to_string()))?;

            let refresh_token = encode(&Header::default(), &refresh_claims, &EncodingKey::from_secret(jwt_secret.inner().as_ref()))
                .map_err(|_| (Status::InternalServerError, "Failed to generate refresh token".to_string()))?;

            // Set the refresh token as a secure, HTTP-only cookie
            let mut cookie = Cookie::new("refresh_token", refresh_token.clone());
            cookie.set_http_only(true);
            cookie.set_secure(true);
            cookie.set_path("/");
            cookies.add(cookie);

            info!("Refresh token set in cookies for user: {}", user.email);

            let response = LoginResponse {
                id: user.id.to_string(),
                token: access_token,
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
                refresh_token: Some(refresh_token), // Still included in the response for now
            };
            Ok(Json(response))
        }
        Err((status, message)) => {
            info!("Login failed with status: {:?}, message: {}", status, message);
            Err((status, message))
        }
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
    cookies: &CookieJar<'_>,
) -> Result<Status, (Status, String)> {
    // Rate limiter check
    let client_id = "reset-password"; // Use a unique identifier for this route
    if !rate_limiter.check_rate_limit(client_id) {
        return Err((Status::TooManyRequests, "Too many requests. Please try again later.".to_string()));
    }
    match User::reset_password(reset_data, user_collection, jwt_secret.inner(), cookies).await {
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
pub async fn verify_admin(jwt_secret: &State<String>, cookies: &CookieJar<'_>) -> Result<Status, (Status, String)> {
    let refresh_token = match cookies.get("refresh_token") {
        Some(cookie) => cookie.value().to_string(),
        None => return Err((Status::Unauthorized, "Refresh token not found".to_string())),
    };

    match verify_token(&refresh_token, jwt_secret.inner()) {
        Ok(claims) => {
            if !claims.is_admin {
                return Err((Status::Forbidden, "User is not an admin".to_string()));
            }
        }
        Err(_) => return Err((Status::Unauthorized, "Invalid or expired refresh token".to_string())),
    };

    Ok(Status::Ok)
}

#[get("/profile/<user_id_or_username>")]
pub async fn get_profile(
    user_id_or_username: &str,
    user_collection: &State<Collection<User>>,
    cookies: &CookieJar<'_>,
    jwt_secret: &State<String>,
) -> Result<Json<UserProfile>, (Status, String)> {
    info!("Fetching profile for: {}", user_id_or_username);

    // Attempt to verify the access token first
    let access_token = cookies.get("access_token").map(|cookie| cookie.value().to_string());
    let mut user_id = None;

    if let Some(token) = access_token {
        if let Ok(claims) = verify_token(&token, jwt_secret.inner()) {
            user_id = Some(claims.sub);
        }
    }

    // If access token is invalid or not provided, verify the refresh token
    if user_id.is_none() {
        let refresh_token = cookies.get("refresh_token").map(|cookie| cookie.value().to_string());

        if let Some(token) = refresh_token {
            if let Ok(claims) = verify_token(&token, jwt_secret.inner()) {
                if claims.token_type == "refresh" {
                    user_id = Some(claims.sub.clone());
                }
            }
        }
    }

    let filter = if user_id_or_username.starts_with("id:") {
        doc! { "id": &user_id_or_username[3..] }
    } else {
        doc! { "username": user_id_or_username }
    };

    match user_collection.find_one(filter).await {
        Ok(Some(user)) => {
            info!("User found: {}", user.username);

            let is_own_profile = user_id_or_username.starts_with("id:") && user_id.as_deref() == Some(&user_id_or_username[3..]);
            let email_to_display = if user.email_private && !is_own_profile {
                "Email hidden for privacy".to_string()
            } else {
                user.email
            };

            // Only return public details if not the user's own profile
            if !is_own_profile {
                let public_profile = UserProfile {
                    username: user.username,
                    email: email_to_display,
                    email_private: user.email_private,
                    bio: user.bio.unwrap_or_else(|| "No bio available".to_string()),
                    profile_picture: if user.profile_picture.is_empty() { "No profile picture available".to_string() } else { user.profile_picture },
                    profile_picture_public_id: user.profile_picture_public_id,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                };
                return Ok(Json(public_profile));
            }

            // Return full profile for the user's own profile
            let profile = UserProfile {
                username: user.username,
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
        Ok(None) => {
            info!("No user found for: {}", user_id_or_username);
            Err((Status::NotFound, "User not found".to_string()))
        }
        Err(_) => {
            info!("Database error while fetching profile for: {}", user_id_or_username);
            Err((Status::InternalServerError, "Internal server error".to_string()))
        }
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
            "username": &profile.username,
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
                        username: updated_user.username,
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
    cookies: &CookieJar<'_>,
    jwt_secret: &State<String>,
) -> Result<Status, (Status, Json<ErrorResponse>)> {
    // Retrieve the refresh token from cookies
    let refresh_token = match cookies.get("refresh_token") {
        Some(cookie) => cookie.value().to_string(),
        None => {
            return Err((
                Status::Unauthorized,
                Json(ErrorResponse {
                    message: "Refresh token not found".to_string(),
                }),
            ))
        }
    };

    // Verify the refresh token
    match verify_token(&refresh_token, jwt_secret.inner()) {
        Ok(claims) => {
            // Ensure the user is changing their own password or is an admin
            if claims.sub != user_id && !claims.is_admin {
                return Err((
                    Status::Forbidden,
                    Json(ErrorResponse {
                        message: "Unauthorized to change this user's password".to_string(),
                    }),
                ));
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
                                Err(_) => {
                                    return Err((
                                        Status::InternalServerError,
                                        Json(ErrorResponse {
                                            message: "Failed to hash new password".to_string(),
                                        }),
                                    ))
                                }
                            };

                            // Update the password in the database
                            let update_result = user_collection
                                .update_one(
                                    doc! { "id": user_id },
                                    doc! { "$set": { "password": hashed_password } },
                                )
                                .await;

                            match update_result {
                                Ok(_) => Ok(Status::Ok),
                                Err(_) => Err((
                                    Status::InternalServerError,
                                    Json(ErrorResponse {
                                        message: "Failed to update password".to_string(),
                                    }),
                                )),
                            }
                        }
                        Ok(false) => Err((
                            Status::Unauthorized,
                            Json(ErrorResponse {
                                message: "Current password is incorrect".to_string(),
                            }),
                        )),
                        Err(_) => Err((
                            Status::InternalServerError,
                            Json(ErrorResponse {
                                message: "Password verification failed".to_string(),
                            }),
                        )),
                    }
                }
                Ok(None) => Err((
                    Status::NotFound,
                    Json(ErrorResponse {
                        message: "User not found".to_string(),
                    }),
                )),
                Err(_) => Err((
                    Status::InternalServerError,
                    Json(ErrorResponse {
                        message: "Database error".to_string(),
                    }),
                )),
            }
        }
        Err(_) => Err((
            Status::Unauthorized,
            Json(ErrorResponse {
                message: "Invalid or expired refresh token".to_string(),
            }),
        )),
    }
}

#[delete("/profile/<user_id>", data = "<delete_request>")]
pub async fn delete_profile(
    user_id: &str,
    delete_request: Json<DeleteProfileRequest>,
    user_collection: &State<Collection<User>>,
    cookies: &CookieJar<'_>,
    jwt_secret: &State<String>,
) -> Result<Status, (Status, Json<ErrorResponse>)> {
    // Retrieve the refresh token from cookies
    let refresh_token = match cookies.get("refresh_token") {
        Some(cookie) => cookie.value().to_string(),
        None => {
            return Err((
                Status::Unauthorized,
                Json(ErrorResponse {
                    message: "Refresh token not found".to_string(),
                }),
            ))
        }
    };

    match verify_token(&refresh_token, jwt_secret.inner()) {
        Ok(claims) => {
            // Ensure the user is deleting their own account or is an admin
            if claims.sub != user_id && !claims.is_admin {
                return Err((
                    Status::Forbidden,
                    Json(ErrorResponse {
                        message: "Unauthorized to delete this user's profile".to_string(),
                    }),
                ));
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
                                if let Err(_) =
                                    delete_image_from_cloudinary(&user.profile_picture_public_id)
                                        .await
                                {
                                    eprintln!(
                                        "Failed to delete profile picture from Cloudinary during account deletion"
                                    );
                                    // Continue with account deletion even if image deletion fails
                                }
                            }

                            // Delete the user from the database
                            let delete_result =
                                user_collection.delete_one(doc! { "id": user_id }).await;

                            match delete_result {
                                Ok(_) => Ok(Status::Ok),
                                Err(_) => Err((
                                    Status::InternalServerError,
                                    Json(ErrorResponse {
                                        message: "Failed to delete profile".to_string(),
                                    }),
                                )),
                            }
                        }
                        Ok(false) => Err((
                            Status::Unauthorized,
                            Json(ErrorResponse {
                                message: "Password is incorrect".to_string(),
                            }),
                        )),
                        Err(_) => Err((
                            Status::InternalServerError,
                            Json(ErrorResponse {
                                message: "Password verification failed".to_string(),
                            }),
                        )),
                    }
                }
                Ok(None) => Err((
                    Status::NotFound,
                    Json(ErrorResponse {
                        message: "User not found".to_string(),
                    }),
                )),
                Err(_) => Err((
                    Status::InternalServerError,
                    Json(ErrorResponse {
                        message: "Database error".to_string(),
                    }),
                )),
            }
        }
        Err(_) => Err((
            Status::Unauthorized,
            Json(ErrorResponse {
                message: "Invalid or expired refresh token".to_string(),
            }),
        )),
    }
}

#[post("/refresh-token")]
pub async fn refresh_token(
    cookies: &CookieJar<'_>, // Use CookieJar to access cookies
    jwt_secret: &State<String>,
) -> Result<Json<TokenResponse>, (Status, String)> {
    info!("Refresh token endpoint hit");

    let refresh_token = match cookies.get("refresh_token") {
        Some(cookie) => {
            info!("Refresh token found in cookies");
            cookie.value().to_string()
        }
        None => {
            info!("No refresh token found in cookies");
            return Err((Status::Unauthorized, "Refresh token not found".to_string()));
        }
    };

    match verify_token(&refresh_token, jwt_secret.inner()) {
        Ok(claims) => {
            info!("Refresh token verified for user: {}", claims.sub);

            if claims.token_type != "refresh" {
                info!("Invalid token type: {}", claims.token_type);
                return Err((Status::Unauthorized, "Invalid token type".to_string()));
            }

            let new_access_claims = Claims {
                sub: claims.sub.clone(),
                is_admin: claims.is_admin,
                exp: (chrono::Utc::now() + chrono::Duration::minutes(15)).timestamp() as usize, // New short-lived access token
                token_type: "access".to_string(),
            };

            let new_access_token = encode(&Header::default(), &new_access_claims, &EncodingKey::from_secret(jwt_secret.inner().as_ref()))
                .map_err(|_| (Status::InternalServerError, "Failed to generate new access token".to_string()))?;

            info!("New access token generated for user: {}", claims.sub);

            Ok(Json(TokenResponse { token: new_access_token }))
        }
        Err(_) => {
            info!("Invalid or expired refresh token");
            Err((Status::Unauthorized, "Invalid or expired refresh token".to_string()))
        }
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

#[post("/user-by-refresh-token")]
pub async fn user_by_refresh_token(
    cookies: &CookieJar<'_>,
    jwt_secret: &State<String>,
    user_collection: &State<Collection<User>>,
) -> Result<Json<User>, (Status, String)> {
    info!("User by refresh token endpoint hit");

    let refresh_token = match cookies.get("refresh_token") {
        Some(cookie) => {
            info!("Refresh token found in cookies");
            cookie.value().to_string()
        }
        None => {
            info!("No refresh token found in cookies");
            return Err((Status::Unauthorized, "Refresh token not found".to_string()));
        }
    };

    match verify_token(&refresh_token, jwt_secret.inner()) {
        Ok(claims) => {
            info!("Refresh token verified for user: {}", claims.sub);

            if claims.token_type != "refresh" {
                info!("Invalid token type: {}", claims.token_type);
                return Err((Status::Unauthorized, "Invalid token type".to_string()));
            }

            match user_collection.find_one(doc! { "id": &claims.sub }).await {
                Ok(Some(user)) => Ok(Json(user)),
                Ok(None) => Err((Status::NotFound, "User not found".to_string())),
                Err(_) => Err((Status::InternalServerError, "Database error".to_string())),
            }
        }
        Err(_) => {
            info!("Invalid or expired refresh token");
            Err((Status::Unauthorized, "Invalid or expired refresh token".to_string()))
        }
    }
}

#[post("/logout")]
pub async fn logout(cookies: &CookieJar<'_>) -> Status {
    // Remove the refresh_token cookie
    if cookies.get("refresh_token").is_some() {
        cookies.remove(Cookie::build("refresh_token").build());
        info!("Refresh token cookie removed successfully.");
    } else {
        info!("No refresh token cookie found to remove.");
    }

    Status::Ok
}

#[get("/is_authenticated")]
pub async fn is_authenticated(cookies: &CookieJar<'_>) -> Json<Value> {
    if let Some(refresh_token) = cookies.get("refresh_token") {
        let token = refresh_token.value();

        // Validate the refresh token
        match validate_refresh_token(token).await {
            Ok(user_id) => {
                return Json(json!({ "authenticated": true, "user_id": user_id }));
            }
            Err(_) => {
                return Json(json!({ "authenticated": false }));
            }
        }
    }

    Json(json!({ "authenticated": false }))
}