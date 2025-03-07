use rocket::get;
use rocket::serde::json::{from_str, Json};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::Read;

#[derive(Debug, Serialize, Deserialize)]
pub struct DocMetadata {
    pub tags: Vec<String>,
    pub category: String,
    pub author: String,
    // Add other metadata fields you have
}

#[get("/docs?<filters>")]
pub async fn get_filtered_docs(filters: Option<String>) -> Json<Vec<DocMetadata>> {
    let mut filtered = Vec::new();

    // Get all docs (you'll need to implement this)
    let all_docs = load_all_docs().await;

    if let Some(filter_str) = filters {
        let filters: HashMap<String, String> = serde_urlencoded::from_str(&filter_str).unwrap();

        for doc in all_docs {
            if apply_filters(&doc, &filters) {
                filtered.push(doc);
            }
        }
    }

    Json(filtered)
}

fn apply_filters(doc: &DocMetadata, filters: &HashMap<String, String>) -> bool {
    filters.iter().all(|(key, value)| match key.as_str() {
        "tag" => doc.tags.contains(value),
        "category" => doc.category == *value,
        "author" => doc.author == *value,
        _ => true,
    })
}

async fn load_all_docs() -> Vec<DocMetadata> {
    let file_path = "docs/pages.json";
    let mut file = File::open(file_path).unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    let docs: Vec<DocMetadata> = from_str(&contents).unwrap();
    docs
}
