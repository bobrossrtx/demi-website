use rocket::fs::NamedFile;
use crate::middleware::admin::AdminUser;

#[get("/admin")]
pub async fn admin_dashboard(_admin: AdminUser) -> Option<NamedFile>{
    NamedFile::open("admin/index.html").await.ok()
}

// This is where all the ADMIN api calls 
// and server specific routes take place