use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CloudinaryResponse {
    pub secure_url: String,
    pub public_id: String,
}

#[derive(Serialize)]
pub struct CloudinaryAPIResponse<T> {
    pub status: u16,
    pub message: String,
    pub data: Option<T>,
}

#[derive(Serialize)]
pub struct CloudinaryErrorResponse {
    pub status: u16,
    pub message: String,
    pub data: Option<String>,
}