use rocket::request::{FromRequest, Outcome, Request};
use crate::auth::jwt::decode_token;
use crate::models::forum::UserRole;

pub struct AuthGuard {
    pub user_id: String,
    pub username: String,
    pub role: String,
}

impl AuthGuard {
    pub fn get_role(&self) -> UserRole {
        UserRole::from_str(&self.role)
    }

    pub fn is_admin(&self) -> bool {
        self.get_role() == UserRole::Admin
    }

    pub fn is_moderator_or_admin(&self) -> bool {
        matches!(self.get_role(), UserRole::Admin | UserRole::Moderator)
    }
}

#[derive(Debug)]
pub enum AuthError {
    Missing,
    Invalid,
    Forbidden,
}

// Request guards for different permission levels
pub struct AdminGuard {
    pub user_id: String,
    pub username: String,
}

pub struct ModeratorGuard {
    pub user_id: String,
    pub username: String,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthGuard {
    type Error = AuthError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let token = req.headers().get_one("Authorization");
        
        match token {
            Some(token) => {
                // Remove "Bearer " prefix if present
                let token = token.trim_start_matches("Bearer ");
                
                // Get JWT secret from Rocket config
                let secret = match req.rocket().state::<String>() {
                    Some(s) => s,
                    None => return Outcome::Forward(()),
                };

                match decode_token(token, secret) {
                    Ok(claims) => Outcome::Success(AuthGuard {
                        user_id: claims.sub,
                        username: claims.username,
                        role: claims.role,
                    }),
                    Err(_) => Outcome::Forward(()),
                }
            }
            None => Outcome::Forward(()),
        }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AdminGuard {
    type Error = AuthError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let auth_guard = match req.guard::<AuthGuard>().await {
            Outcome::Success(guard) => guard,
            Outcome::Forward(()) => return Outcome::Forward(()),
            Outcome::Failure(e) => return Outcome::Failure(e),
        };

        if auth_guard.is_admin() {
            Outcome::Success(AdminGuard {
                user_id: auth_guard.user_id,
                username: auth_guard.username,
            })
        } else {
            Outcome::Forward(())
        }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for ModeratorGuard {
    type Error = AuthError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let auth_guard = match req.guard::<AuthGuard>().await {
            Outcome::Success(guard) => guard,
            Outcome::Forward(()) => return Outcome::Forward(()),
            Outcome::Failure(e) => return Outcome::Failure(e),
        };

        if auth_guard.is_moderator_or_admin() {
            Outcome::Success(ModeratorGuard {
                user_id: auth_guard.user_id,
                username: auth_guard.username,
            })
        } else {
            Outcome::Forward(())
        }
    }
}
