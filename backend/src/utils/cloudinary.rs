use reqwest::multipart::Part;
use reqwest::Client;
use std::collections::HashMap;
use std::env;
use std::fs::File;
use std::io::{self};
use url::Url;
use tokio::io::AsyncReadExt;
use sha1::{Sha1, Digest};
use tempfile::NamedTempFile;
use hex;

use crate::models::cloudinary::CloudinaryResponse;

enum ParamValue {
    Str(String),
    Int(i64),
}

fn generate_signature(params: HashMap<&str, ParamValue>, api_secret: &str) -> String {
    // Step 1: Sort the parameters by keys and concatenate them
    let mut sorted_keys: Vec<&&str> = params.keys().collect();
    sorted_keys.sort();
    let mut sorted_params = String::new();
    for key in sorted_keys {
        if !sorted_params.is_empty() {
            sorted_params.push('&');
        }
        let value = match &params[key] {
            ParamValue::Str(s) => s.clone(),
            ParamValue::Int(i) => i.to_string(),
        };
        sorted_params.push_str(&format!("{}={}", key, value));
    }

    // Step 2: Concatenate the sorted parameters and the API secret
    let string_to_sign = format!("{}{}", sorted_params, api_secret);

    // Step 3: Generate an SHA-1 hash of the concatenated string
    let mut hasher = Sha1::new();
    hasher.update(string_to_sign.as_bytes());

    // Step 4: Return the hex-encoded result
    hex::encode(hasher.finalize())
}

pub async fn upload_image_to_cloudinary_from_url(image_url: &str) -> Result<(String, String), Box<dyn std::error::Error + Send + Sync>> {
    // Load the Cloudinary URL from environment variables
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

    // Save the image to a temporary file
    let mut file = File::create(temp_image_path)?;
    let content = response.bytes().await?;
    io::copy(&mut content.as_ref(), &mut file)?;
    // Create a temporary file for the image
    let temp_file = NamedTempFile::new()?;

    // Generate the signature
    let timestamp = chrono::Utc::now().timestamp();
    let public_id = temp_file
        .path()
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("file")
        .to_string();
    let mut params_to_sign = HashMap::new();
    params_to_sign.insert("public_id", ParamValue::Str(public_id.clone()));
    params_to_sign.insert("timestamp", ParamValue::Int(timestamp));
    let signature = generate_signature(params_to_sign, &api_secret);

    let mut file = tokio::fs::File::open(temp_image_path).await?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).await?;
    let part = Part::bytes(buffer).file_name(public_id.clone());

    let client = Client::new();
    let form = reqwest::multipart::Form::new()
        .text("public_id", public_id.clone())
        .text("timestamp", timestamp.to_string())
        .text("signature", signature)
        .text("api_key", api_key)
        .part("file", part);

    println!("Uploading image to Cloudinary: {}", temp_image_path);

    let response = client
        .post(&format!(
            "https://api.cloudinary.com/v1_1/{}/image/upload",
            cloud_name
        ))
        .multipart(form)
        .send()
        .await?;

    println!("Cloudinary response status: {}", response.status());

    if response.status().is_success() {
        let cloudinary_response: CloudinaryResponse = response.json().await?;
        println!("Image uploaded successfully: {}", cloudinary_response.secure_url);

        // Clean up the temporary file
        tokio::fs::remove_file(temp_image_path).await?;

        Ok((cloudinary_response.secure_url, public_id))
    } else {
        let error_text = response.text().await?;
        println!("Failed to upload image: {}", error_text);

        // Clean up the temporary file
        tokio::fs::remove_file(temp_image_path).await?;
        Err(Box::new(io::Error::new(io::ErrorKind::Other, "Failed to upload image")))
    }
}

pub async fn upload_image_to_cloudinary_from_file(file_path: &str) -> Result<(String, String), Box<dyn std::error::Error + Send + Sync>> {
    // Load the Cloudinary URL from environment variables
    let cloudinary_url = env::var("CLOUDINARY_URL").expect("CLOUDINARY_URL must be set");

    // Parse the Cloudinary URL
    let parsed_url = Url::parse(&cloudinary_url)?;
    let cloud_name = parsed_url.host_str().ok_or("Invalid Cloudinary URL")?.to_string();
    let api_key = parsed_url.username().to_string();
    let api_secret = parsed_url.password().ok_or("Invalid Cloudinary URL")?.to_string();

    println!("Parsed Cloudinary URL: {}", cloudinary_url);
    println!("Cloudinary credentials loaded: cloud_name={}, api_key={}, api_secret={}", cloud_name, api_key, api_secret);

    // Create a temporary file for the image
    let temp_file = NamedTempFile::new()?;

    // Generate the signature
    let timestamp = chrono::Utc::now().timestamp();
    let public_id = temp_file
        .path()
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("file")
        .to_string();
    let mut params_to_sign = HashMap::new();
    params_to_sign.insert("public_id", ParamValue::Str(public_id.clone()));
    params_to_sign.insert("timestamp", ParamValue::Int(timestamp));
    let signature = generate_signature(params_to_sign, &api_secret);

    println!("Public ID: {}", public_id);
    println!("Timestamp: {}", timestamp);
    println!("Signature: {}", signature);

    // Read the file into a buffer
    let mut file = tokio::fs::File::open(file_path).await?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).await?;
    let part = Part::bytes(buffer).file_name(public_id.clone());

    let client = Client::new();
    let form = reqwest::multipart::Form::new()
        .text("public_id", public_id.to_string())
        .text("timestamp", timestamp.to_string())
        .text("signature", signature)
        .text("api_key", api_key)
        .part("file", part);
    println!("Uploading image to Cloudinary: {}", file_path);
    let response = client
        .post(&format!(
            "https://api.cloudinary.com/v1_1/{}/image/upload",
            cloud_name
        ))
        .multipart(form)
        .send()
        .await?;
    println!("Cloudinary response status: {}", response.status());
    if response.status().is_success() {
        let cloudinary_response: CloudinaryResponse = response.json().await?;
        println!("Image uploaded successfully: {}", cloudinary_response.secure_url);

        // Clean up the temporary file
        tokio::fs::remove_file(temp_file.path()).await?;

        Ok((cloudinary_response.secure_url, public_id))
    } else {
        let error_text = response.text().await?;
        println!("Failed to upload image: {}", error_text);

        // Clean up the temporary file
        tokio::fs::remove_file(temp_file.path()).await?;
        Err(Box::new(io::Error::new(io::ErrorKind::Other, "Failed to upload image")))
    }
}

pub async fn delete_image_from_cloudinary(image_url: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Load the Cloudinary URL from environment variables
    let cloudinary_url = env::var("CLOUDINARY_URL").expect("CLOUDINARY_URL must be set");

    // Parse the Cloudinary URL
    let parsed_url = Url::parse(&cloudinary_url)?;
    let cloud_name = parsed_url.host_str().ok_or("Invalid Cloudinary URL")?.to_string();
    let api_key = parsed_url.username().to_string();
    let api_secret = parsed_url.password().ok_or("Invalid Cloudinary URL")?.to_string();

    // Extract the public ID from the image URL
    let public_id = image_url.split('/').last().unwrap_or("");

    println!("Public ID: {}", public_id);

    // Generate the signature
    let timestamp = chrono::Utc::now().timestamp();
    let mut params_to_sign = HashMap::new();
    params_to_sign.insert("public_id", ParamValue::Str(public_id.to_string()));
    params_to_sign.insert("timestamp", ParamValue::Int(timestamp));
    let signature = generate_signature(params_to_sign, &api_secret);

    // Create a JSON body for the delete request
    let body = serde_json::json!({
        "public_id": public_id,
        "timestamp": timestamp,
        "signature": signature,
        "api_key": api_key,
    });

    // Send the delete request to Cloudinary
    let client = Client::new();
    let response = client
        .post(&format!(
            "https://api.cloudinary.com/v1_1/{}/image/destroy",
            cloud_name
        ))
        .json(&body)
        .send()
        .await?;

    if response.status().is_success() {
        println!("Image deleted successfully: {}", image_url);
        Ok(())
    } else {
        let error_text = response.text().await?;
        println!("Failed to delete image: {}", error_text);
        Err(Box::new(io::Error::new(io::ErrorKind::Other, "Failed to delete image")))
    }
}