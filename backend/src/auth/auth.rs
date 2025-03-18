use rocket::serde::json::Json;
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::State;
use mongodb::Collection;
use crate::models::user::{LoginResponse, User, LoginRequest, PasswordResetRequest, RegistrationRequest};
use mongodb::bson::{doc, DateTime};
use crate::auth::jwt::verify_token; // Make sure this import exists
use log::info;
use serde::{Deserialize, Serialize};
use rocket::fs::TempFile;
use rocket::form::Form;
use crate::utils::cloudinary::{delete_image_from_cloudinary, upload_image_to_cloudinary_from_file};

#[derive(Deserialize)]
pub struct EmailRequest {
    email: String,
}

#[derive(Serialize, Deserialize)]
pub struct TokenResponse {
    token: String,
}

#[derive(Serialize, Deserialize)]
pub struct UserProfile {
    pub name: String,
    pub email: String,
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

#[post("/register", data = "<user>")]
pub async fn register(user: Json<RegistrationRequest>, user_collection: &State<Collection<User>>) -> Result<Status, (Status, String)> {
    User::register(user, user_collection).await
}

#[post("/login", data = "<login_request>")]
pub async fn login(
    login_request: Json<LoginRequest>,
    user_collection: &State<Collection<User>>,
    jwt_secret: &State<String>
) -> Result<Json<LoginResponse>, (Status, String)> {
    match User::login(login_request, user_collection, jwt_secret.inner()).await {
        Ok(user) => {
            let response = LoginResponse {
                token: user.token,
                is_admin: user.is_admin,
                id: user.id.to_string(), // Convert ObjectId to hex string
                email: user.email,
                name: user.name,
                bio: user.bio,
                created_at: user.created_at,
                updated_at: user.updated_at,
                username: user.username,
                profile_picture: user.profile_picture,
                profile_picture_public_id: user.profile_picture_public_id,
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
    jwt_secret: &State<String>
) -> Result<Json<TokenResponse>, (Status, String)> {
    match User::generate_password_reset_token(email_request.email.clone(), user_collection, jwt_secret.inner()).await {
        Ok(token) => Ok(Json(TokenResponse { token })),
        Err((status, e)) => Err((status, e))
    }
}

#[post("/reset-password", data = "<reset_data>")]
pub async fn reset_password(
    reset_data: Json<PasswordResetRequest>,
    user_collection: &State<Collection<User>>,
    jwt_secret: &State<String>
) -> Result<Status, (Status, String)> {
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
        doc! { "_id": &user_id_or_username[3..] }
    } else {
        doc! { "username": user_id_or_username }
    };

    match user_collection.find_one(filter).await {
        Ok(Some(user)) => {
            let profile = UserProfile {
                name: user.username,
                email: user.email,
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
            "updated_at": chrono::Utc::now().to_string(),
        }
    };

    match user_collection.update_one(doc! { "_id": user_id }, update_doc).await {
        Ok(_) => {
            let updated_user = user_collection.find_one(doc! { "_id": user_id }).await.unwrap().unwrap();
            let updated_profile = UserProfile {
                name: updated_user.username,
                email: updated_user.email,
                bio: updated_user.bio.unwrap_or_else(|| "No bio available".to_string()),
                profile_picture: if updated_user.profile_picture.is_empty() { "No profile picture available".to_string() } else { updated_user.profile_picture },
                profile_picture_public_id: updated_user.profile_picture_public_id,
                created_at: updated_user.created_at,
                updated_at: updated_user.updated_at
            };
            Ok(Json(updated_profile))
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
                doc! { "_id": user_id },
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
    let user = user_collection.find_one(doc! { "_id": user_id }).await.map_err(|_| (Status::InternalServerError, "Database error".to_string()))?;
    
    if let Some(user) = user {
        // Delete the image from Cloudinary
        if let Err(_) = delete_image_from_cloudinary(&user.profile_picture_public_id).await {
            eprintln!("Failed to delete image from Cloudinary");
            return Err((Status::InternalServerError, "Failed to delete image from Cloudinary".to_string()));
        }

        // Update the user's profile picture URL in the database
        let update_result = user_collection.update_one(
            doc! { "_id": user_id },
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