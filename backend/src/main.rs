#![feature(decl_macro)]
#[macro_use] extern crate rocket;

////////////////////////////////////////////////////////////
/// RUST IMPORTS ///////////////////////////////////////////
////////////////////////////////////////////////////////////

extern crate serde;

use std;
use std::path::{Path, PathBuf};

use rocket::fs::NamedFile;
use rocket::http::Header;
use rocket::{Request, Response};
use rocket::fairing::{Fairing, Info, Kind};

////////////////////////////////////////////////////////////
/// API IMPLEMENTATION /////////////////////////////////////
////////////////////////////////////////////////////////////

// #[derive(Debug, FromForm, Deserialize)]
// struct Book {
//     title: String,
//     author: String,
//     isbn: String,
// }

// #[post("/book", data = "<book_form>")]
// fn new_book(book_form: Json<Book>) -> String {
//     println!("{:?}", book_form);
//     format!("Book {} by {} with ISBN {}",
//         book_form.title,
//         book_form.author,
//         book_form.isbn
//     )
// }

// #[get("/last_update")]
// fn last_update() -> Json<String> {
//     // const test: Date = ;
//     // let test = Utc::now();
//     Json(format!("last_update: {{test}}").parse().unwrap())
// }

////////////////////////////////////////////////////////////
/// CORS CONFIGURATION /////////////////////////////////////
////////////////////////////////////////////////////////////

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new("Access-Control-Allow-Methods", "POST, GET, PATCH, OPTIONS"));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}

////////////////////////////////////////////////////////////
/// DOCUMENTATION API //////////////////////////////////////
////////////////////////////////////////////////////////////

#[get("/docs", rank=3)]
async fn getdocs() -> Option<NamedFile> {
    let paged_directory_path = format!("{}/static/docs/", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join("pages.json")).await.ok()
}

#[get("/docs/<page..>", rank=4)]
async fn docpages(page: PathBuf) -> Option<NamedFile> {
    let paged_directory_path = format!("{}/static/docs/", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join(page)).await.ok()
}

////////////////////////////////////////////////////////////
/// FRONTEND INTERACTION ///////////////////////////////////
////////////////////////////////////////////////////////////

#[get("/<_..>", rank = 5)]
async fn index() -> Option<NamedFile> {
    let paged_directory_path = format!("{}/../frontend/build", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join("index.html")).await.ok()
}

#[get("/<_..>", rank = 6)]
pub(crate) fn fallback_url() -> &'static str {
    "Hey, this is the fallback url"
}


#[get("/<file..>", rank = 1)]
async fn files(file: PathBuf) -> Option<NamedFile> {
    let paged_directory_path = format!("{}/../frontend/build/static", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join(file)).await.ok()
}

#[get("/downloads/<file..>", rank= 2)]
async fn downloads(file: PathBuf) -> Option<NamedFile> {
    let paged_directory_path = format!("{}/static/downloads", env!("CARGO_MANIFEST_DIR"));
    NamedFile::open(Path::new(&paged_directory_path).join(file)).await.ok()
}


#[launch]
fn rocket() -> _ {
    rocket::build()
        .attach(CORS)
        .mount("/api", routes![getdocs, docpages])
        .mount("/static", routes![files, downloads])
        .mount("/", routes![index, fallback_url])
}