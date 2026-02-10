#![feature(decl_macro)]
#[macro_use]
extern crate rocket;

////////////////////////////////////////////////////////////
/// RUST IMPORTS ///////////////////////////////////////////
////////////////////////////////////////////////////////////
pub mod doc_filters;
pub mod db;
pub mod models;
pub mod auth;
pub mod routes;

extern crate serde;

use std;
use std::path::{Path, PathBuf};
use std::env;

use rocket::fairing::{Fairing, Info, Kind};
use rocket::fs::NamedFile;
use rocket::http::Header;
use rocket::{Request, Response};

use dotenv::dotenv;

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
            "POST, GET, PUT, PATCH, DELETE, OPTIONS",
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
    
    // Get database URL and JWT secret from environment
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env file");
    
    let jwt_secret = env::var("JWT_SECRET")
        .unwrap_or_else(|_| {
            println!("Warning: JWT_SECRET not set, using default (INSECURE)");
            "insecure_default_secret_change_me".to_string()
        });
    
    // Create database pool
    let pool = db::create_pool(&database_url)
        .await
        .expect("Failed to create database pool");

    println!("✅ Database connected successfully");

    rocket::build()
        .manage(pool)
        .manage(jwt_secret)
        .attach(CORS)
        .mount("/api/auth", routes![
            routes::register,
            routes::login,
        ])
        .mount("/api/users", routes![
            routes::get_current_user,
            routes::get_user_by_username,
            routes::update_profile,
        ])
        .mount("/api/forum", routes![
            routes::get_categories,
            routes::get_category,
            routes::create_category,
            routes::update_category,
            routes::delete_category,
            routes::get_posts,
            routes::get_post,
            routes::create_post,
            routes::update_post,
            routes::delete_post,
            routes::pin_post,
            routes::unpin_post,
            routes::lock_post,
            routes::unlock_post,
            routes::get_comments,
            routes::create_comment,
            routes::toggle_bookmark,
            routes::get_post_tags,
            routes::update_comment,
            routes::delete_comment,
            routes::accept_comment,
            routes::toggle_vote,
            routes::get_user_bookmarks,
            routes::get_tags,
        ])
        .mount("/api", routes![getdocs, docpages])
        .mount("/static", routes![files, downloads, images])
        .mount("/", routes![index, fallback_url])
}
