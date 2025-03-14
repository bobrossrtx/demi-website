use reqwest::Client;
use serde::Deserialize;
use std::env;
use std::fs::File;
use std::io::{self, Read};
use url::Url;
use sha2::{Sha256, Digest};
use hex;

#[derive(Deserialize)]
struct CloudinaryResponse {
    secure_url: String,
}

fn generate_signature(params: &str, api_secret: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(params.as_bytes());
    hasher.update(api_secret.as_bytes());
    hex::encode(hasher.finalize())
}

pub async fn upload_image_to_cloudinary(image_url: &str) -> Result<String, Box<dyn std::error::Error>> {
    let cloudinary_url = env::var("CLOUDINARY_URL").expect("CLOUDINARY_URL must be set");

    // Parse the Cloudinary URL
    let parsed_url = Url::parse(&cloudinary_url)?;
    let cloud_name = parsed_url.host_str().ok_or("Invalid Cloudinary URL")?.to_string();
    let api_key = parsed_url.username().to_string();
    let api_secret = parsed_url.password().ok_or("Invalid Cloudinary URL")?.to_string();

    println!("Parsed Cloudinary URL: {}", cloudinary_url);
    println!("Cloudinary credentials loaded: cloud_name={}, api_key={}, api_secret={}", cloud_name, api_key, api_secret);

    // Download the image from the URL
    let temp_image_path = "temp_image.jpg";
    let response = Client::new().get(image_url).send().await?;
    if !response.status().is_success() {
        return Err(Box::new(io::Error::new(io::ErrorKind::Other, "Failed to download image")));
    }
    println!("Image downloaded successfully: {}", image_url);
    let mut file = File::create(temp_image_path)?;
    let content = response.bytes().await?;
    io::copy(&mut content.as_ref(), &mut file)?;
    println!("Image downloaded successfully: {}", temp_image_path);

    // Read the file content as bytes
    let mut file = File::open(temp_image_path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;

    // Generate the signature
    let timestamp = chrono::Utc::now().timestamp();
    let params_to_sign = format!("timestamp={}&upload_preset=ml_default", timestamp);
    let signature = generate_signature(&params_to_sign, &api_secret);

    let client = Client::new();
    let form = reqwest::multipart::Form::new()
        .part("file", reqwest::multipart::Part::bytes(buffer))
        .text("upload_preset", "ml_default")
        .text("api_key", api_key.clone())
        .text("timestamp", timestamp.to_string())
        .text("signature", signature);

    println!("Uploading image to Cloudinary: {}", temp_image_path);

    let response = client.post(&format!("https://api.cloudinary.com/v1_1/{}/image/upload", cloud_name))
        .multipart(form)
        .send()
        .await?;

    println!("Cloudinary response status: {}", response.status());

    if response.status().is_success() {
        let cloudinary_response: CloudinaryResponse = response.json().await?;
        println!("Image uploaded successfully: {}", cloudinary_response.secure_url);
        Ok(cloudinary_response.secure_url)
    } else {
        let error_text = response.text().await?;
        println!("Failed to upload image: {}", error_text);
        Err(Box::new(io::Error::new(io::ErrorKind::Other, "Failed to upload image")))
    }
}