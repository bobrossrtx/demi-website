use rocket::Request;
use rocket::http::Status;
use rocket::request::{self, FromRequest, Outcome};
use jsonwebtoken::{decode, Validation, DecodingKey};
use crate::auth::jwt::Claims; // Import the Claims struct

#[allow(dead_code)]
pub struct AdminUser(pub Claims);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AdminUser {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let jwt_secret = request.rocket().state::<String>().unwrap();
        let auth_header = request.headers().get_one("Authorization").and_then(|header| header.strip_prefix("Bearer "));

        if let Some(token) = auth_header {
            let token_data = decode::<Claims>(&token, &DecodingKey::from_secret(jwt_secret.as_ref()), &Validation::default()).ok();
            if let Some(data) = token_data {
                if data.claims.is_admin {
                    return Outcome::Success(AdminUser(data.claims));
                }
            }
        }

        Outcome::Error((Status::Unauthorized, ()))
    }
}

async fn is_admin(request: &Request<'_>) -> Result<(), Status> {
    let jwt_secret = request.rocket().state::<String>().unwrap();
    let auth_header = request.headers().get_one("Authorization").and_then(|header| header.strip_prefix("Bearer "));

    if let Some(token) = auth_header {
        let token_data = decode::<Claims>(&token, &DecodingKey::from_secret(jwt_secret.as_ref()), &Validation::default()).ok();
        if let Some(data) = token_data {
            if data.claims.is_admin {
                return Ok(());
            }
        }
    }

    Err(Status::Unauthorized)
}