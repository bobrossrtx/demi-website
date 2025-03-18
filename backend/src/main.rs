#[macro_use]
extern crate rocket;

////////////////////////////////////////////////////////////
/// RUST IMPORTS ///////////////////////////////////////////
////////////////////////////////////////////////////////////
pub mod doc_filters;
mod middleware;

use auth::auth::{delete_profile_picture, edit_profile, generate_reset_token, get_profile, reset_password, update_profile_picture, verify_admin};

mod models;
mod auth;
mod utils;

extern crate serde;

use std;
use std::path::{Path, PathBuf};

use rocket::fairing::{Fairing, Info, Kind};
use rocket::fs::NamedFile;
use rocket::http::Header;
use rocket::{Request, Response};
use dotenv::dotenv;
use auth::admin::admin_dashboard;
use std::env;
use crate::models::user::User;
use mongodb::Client;
use crate::auth::auth::{register, login};
use rocket::data::{ByteUnit, Limits};
use rocket::config::Config;

////////////////////////////////////////////////////////////
/// CORS CONFIGURATION /////////////////////////////////////
////////////////////////////////////////////////////////////

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, GET, PATCH, OPTIONS",
        ));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}

////////////////////////////////////////////////////////////
/// DOCUMENTATION API //////////////////////////////////////
////////////////////////////////////////////////////////////

#[get("/docs", rank = 3)]
async fn getdocs() -> Option<NamedFile> {
    let paged_directory_path = format!("{}/static/docs/", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join("pages.json"))
        .await
        .ok()
}

#[get("/docs/<page..>", rank = 4)]
async fn docpages(page: PathBuf) -> Option<NamedFile> {
    let paged_directory_path = format!("{}/static/docs/", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join(page))
        .await
        .ok()
}

////////////////////////////////////////////////////////////
/// FRONTEND INTERACTION ///////////////////////////////////
////////////////////////////////////////////////////////////

#[get("/<_..>", rank = 5)]
async fn index() -> Option<NamedFile> {
    let paged_directory_path = format!("{}/../frontend/build", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join("index.html"))
        .await
        .ok()
}

#[get("/<_..>", rank = 6)]
pub(crate) fn fallback_url() -> &'static str {
    "Hey, this is the fallback url"
}

#[get("/<file..>", rank = 2)]
async fn files(file: PathBuf) -> Option<NamedFile> {
    let paged_directory_path = format!("{}/../frontend/build/static", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join(file))
        .await
        .ok()
}

#[get("/downloads/<file..>", rank = 1)]
async fn downloads(file: PathBuf) -> Option<NamedFile> {
    let paged_directory_path = format!("{}/static/downloads", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join(file))
        .await
        .ok()
}

#[get("/images/<file..>", rank = 1)]
async fn images(file: PathBuf) -> Option<NamedFile> {
    let paged_directory_path = format!("{}/static/images", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join(file))
        .await
        .ok()
}

#[launch]
async fn rocket() -> _ {
    dotenv().ok();
    println!("Environment variables loaded:");

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    
    let client = Client::with_uri_str(&database_url).await.expect("Failed to initialize client");
    let db = client.database("demi_db");
    let user_collection = db.collection::<User>("users");

    let config = Config::figment()
        .merge(("address", "0.0.0.0"))
        .merge(("port", 8000))
        .merge(("workers", 4))
        .merge(("keep_alive", 5))
        .merge(("limits", Limits::new()
            .limit("forms", ByteUnit::Byte(10 * 1024 * 1024))
            .limit("data", ByteUnit::Byte(20 * 1024 * 1024))
            .limit("data-form", ByteUnit::Byte(10 * 1024 * 1024))
            .limit("file", ByteUnit::Byte(10 * 1024 * 1024))));

    rocket::custom(config)
        .attach(CORS)
        .manage(user_collection)
        .manage(jwt_secret)
        .mount("/api/auth", routes![register, login, verify_admin, generate_reset_token, reset_password, get_profile, edit_profile, update_profile_picture, delete_profile_picture])
        .mount("/api/admin", routes![admin_dashboard])
        .mount("/api", routes![getdocs, docpages])
        .mount("/static", routes![files, downloads, images])
        .mount("/", routes![index, fallback_url])
}
