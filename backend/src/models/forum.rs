use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// ========== User Roles ==========
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum UserRole {
    User,
    Moderator,
    Admin,
}

impl UserRole {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "admin" => UserRole::Admin,
            "moderator" => UserRole::Moderator,
            _ => UserRole::User,
        }
    }

    pub fn as_str(&self) -> &str {
        match self {
            UserRole::Admin => "admin",
            UserRole::Moderator => "moderator",
            UserRole::User => "user",
        }
    }

    pub fn can_delete_any_post(&self) -> bool {
        matches!(self, UserRole::Admin | UserRole::Moderator)
    }

    pub fn can_pin_post(&self) -> bool {
        matches!(self, UserRole::Admin | UserRole::Moderator)
    }

    pub fn can_lock_post(&self) -> bool {
        matches!(self, UserRole::Admin | UserRole::Moderator)
    }

    pub fn can_manage_categories(&self) -> bool {
        matches!(self, UserRole::Admin)
    }

    pub fn can_manage_tags(&self) -> bool {
        matches!(self, UserRole::Admin | UserRole::Moderator)
    }
}

// ========== Categories ==========
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Category {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub post_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub created_by: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCategoryRequest {
    pub name: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
}

// ========== Posts ==========
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Post {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub category_id: Uuid,
    pub author_id: Uuid,
    pub upvote_count: i32,
    pub view_count: i32,
    pub comment_count: i32,
    pub is_pinned: bool,
    pub is_locked: bool,
    pub is_deleted: bool,
    pub deleted_at: Option<DateTime<Utc>>,
    pub deleted_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_activity_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct PostWithDetails {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub category_id: Uuid,
    pub author_id: Uuid,
    pub upvote_count: i32,
    pub view_count: i32,
    pub comment_count: i32,
    pub is_pinned: bool,
    pub is_locked: bool,
    pub is_deleted: bool,
    pub deleted_at: Option<DateTime<Utc>>,
    pub deleted_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_activity_at: DateTime<Utc>,
    pub author_username: String,
    pub author_display_name: Option<String>,
    pub author_avatar_url: Option<String>,
    pub category_name: String,
    pub category_slug: String,
    #[serde(skip)]
    #[sqlx(skip)]
    pub tags: Vec<Tag>,
    pub user_upvoted: bool,
    pub user_bookmarked: bool,
    pub bookmark_count: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreatePostRequest {
    pub title: String,
    pub content: String,
    pub category_id: Uuid,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePostRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub category_id: Option<Uuid>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct PostQueryParams {
    pub category: Option<Uuid>,
    pub tag: Option<String>,
    pub author: Option<Uuid>,
    pub sort: Option<String>, // "recent", "popular", "trending"
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

// ========== Comments ==========
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Comment {
    pub id: Uuid,
    pub post_id: Uuid,
    pub author_id: Uuid,
    pub content: String,
    pub parent_comment_id: Option<Uuid>,
    pub upvote_count: i32,
    pub is_accepted: bool,
    pub is_deleted: bool,
    pub deleted_at: Option<DateTime<Utc>>,
    pub deleted_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct CommentWithDetails {
    pub id: Uuid,
    pub post_id: Uuid,
    pub author_id: Uuid,
    pub content: String,
    pub parent_comment_id: Option<Uuid>,
    pub upvote_count: i32,
    pub is_accepted: bool,
    pub is_deleted: bool,
    pub deleted_at: Option<DateTime<Utc>>,
    pub deleted_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub author_username: String,
    pub author_display_name: Option<String>,
    pub author_avatar_url: Option<String>,
    pub user_upvoted: bool,
    #[serde(skip)]
    #[sqlx(skip)]
    pub replies: Vec<CommentWithDetails>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCommentRequest {
    pub content: String,
    pub parent_comment_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCommentRequest {
    pub content: String,
}

// ========== Votes ==========
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Vote {
    pub id: Uuid,
    pub user_id: Uuid,
    pub post_id: Option<Uuid>,
    pub comment_id: Option<Uuid>,
    pub vote_type: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct VoteRequest {
    pub post_id: Option<Uuid>,
    pub comment_id: Option<Uuid>,
}

// ========== Tags ==========
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Tag {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub usage_count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTagRequest {
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
}

// ========== Bookmarks ==========
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Bookmark {
    pub id: Uuid,
    pub user_id: Uuid,
    pub post_id: Uuid,
    pub created_at: DateTime<Utc>,
}

// ========== Response Types ==========
#[derive(Debug, Serialize)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub limit: i64,
    pub total_pages: i64,
}

impl<T> PaginatedResponse<T> {
    pub fn new(items: Vec<T>, total: i64, page: i64, limit: i64) -> Self {
        let total_pages = (total as f64 / limit as f64).ceil() as i64;
        Self {
            items,
            total,
            page,
            limit,
            total_pages,
        }
    }
}
