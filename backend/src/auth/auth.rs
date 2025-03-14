use rocket::serde::json::Json;
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::State;
use mongodb::Collection;
use crate::models::user::{LoginResponse, User, LoginRequest, PasswordResetRequest, RegistrationRequest};
use mongodb::bson::doc;
use crate::auth::jwt::verify_token; // Make sure this import exists
use log::info;
use serde::{Deserialize, Serialize};

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
    info!("Token: {}", token);
    info!("JWT Secret: {}", jwt_secret.inner());
    match verify_token(token, jwt_secret.inner()) {
        Ok(claims) => {
            info!("Claims: {:?}", claims);
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

#[get("/profile/<user_id>")]
pub async fn get_profile(user_id: String, user_collection: &State<Collection<User>>) -> Result<Json<UserProfile>, (Status, String)> {
    match user_collection.find_one(doc! { "_id": user_id }).await {
        Ok(Some(user)) => {
            let profile = UserProfile {
                name: user.username,
                email: user.email,
                bio: user.bio.unwrap_or_else(|| "No bio available".to_string()),
                profile_picture: if user.profile_picture.is_empty() { "No profile picture available".to_string() } else { user.profile_picture },
            };
            Ok(Json(profile))
        }
        Ok(None) => Err((Status::NotFound, "User not found".to_string())),
        Err(_) => Err((Status::InternalServerError, "Internal server error".to_string())),
    }
}
