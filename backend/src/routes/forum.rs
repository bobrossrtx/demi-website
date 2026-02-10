use rocket::serde::json::Json;
use rocket::{State, http::Status};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::guards::{AuthGuard, AdminGuard, ModeratorGuard};
use crate::models::forum::*;

#[derive(serde::Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

// ========== Category Routes ==========

#[get("/categories")]
pub async fn get_categories(db: &State<PgPool>) -> Result<Json<Vec<Category>>, Status> {
    let categories = sqlx::query_as::<_, Category>(
        "SELECT * FROM categories ORDER BY name ASC"
    )
    .fetch_all(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    Ok(Json(categories))
}

#[get("/categories/<slug>")]
pub async fn get_category(db: &State<PgPool>, slug: String) -> Result<Json<Category>, Status> {
    let category = sqlx::query_as::<_, Category>(
        "SELECT * FROM categories WHERE slug = $1"
    )
    .bind(&slug)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::NotFound)?;

    Ok(Json(category))
}

#[post("/categories", data = "<request>")]
pub async fn create_category(
    db: &State<PgPool>,
    admin: AdminGuard,
    request: Json<CreateCategoryRequest>,
) -> Result<Json<Category>, (Status, Json<ErrorResponse>)> {
    let category = sqlx::query_as::<_, Category>(
        "INSERT INTO categories (name, slug, description, icon, color, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *"
    )
    .bind(&request.name)
    .bind(&request.slug)
    .bind(&request.description)
    .bind(&request.icon)
    .bind(&request.color)
    .bind(Uuid::parse_str(&admin.user_id).map_err(|e| {
        eprintln!("Failed to parse UUID: {}", e);
        (Status::BadRequest, Json(ErrorResponse {
            error: "Invalid user ID".to_string(),
        }))
    })?)
    .fetch_one(db.inner())
    .await
    .map_err(|e| {
        eprintln!("Database error creating category: {}", e);
        (Status::InternalServerError, Json(ErrorResponse {
            error: format!("Failed to create category: {}", e),
        }))
    })?;

    Ok(Json(category))
}

#[put("/categories/<id>", data = "<request>")]
pub async fn update_category(
    db: &State<PgPool>,
    _admin: AdminGuard,
    id: String,
    request: Json<UpdateCategoryRequest>,
) -> Result<Json<Category>, Status> {
    let id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;

    let category = sqlx::query_as::<_, Category>(
        "UPDATE categories 
         SET name = COALESCE($1, name),
             slug = COALESCE($2, slug),
             description = COALESCE($3, description),
             icon = COALESCE($4, icon),
             color = COALESCE($5, color),
             updated_at = NOW()
         WHERE id = $6
         RETURNING *"
    )
    .bind(&request.name)
    .bind(&request.slug)
    .bind(&request.description)
    .bind(&request.icon)
    .bind(&request.color)
    .bind(id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::NotFound)?;

    Ok(Json(category))
}

#[delete("/categories/<id>")]
pub async fn delete_category(
    db: &State<PgPool>,
    _admin: AdminGuard,
    id: String,
) -> Result<Status, Status> {
    let id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;

    sqlx::query("DELETE FROM categories WHERE id = $1")
        .bind(id)
        .execute(db.inner())
        .await
        .map_err(|_| Status::InternalServerError)?;

    Ok(Status::NoContent)
}

// ========== Post Routes ==========

#[get("/posts")]
pub async fn get_posts(
    db: &State<PgPool>,
    auth: Option<AuthGuard>,
) -> Result<Json<PaginatedResponse<PostWithDetails>>, Status> {
    let page = 1;
    let limit = 20;
    let offset = 0;
    let user_id = auth.as_ref().and_then(|a| Uuid::parse_str(&a.user_id).ok());
    let user_id_param = user_id.unwrap_or_else(|| Uuid::nil());

    let posts = sqlx::query_as::<_, PostWithDetails>(
        "SELECT p.*, u.username as author_username, u.display_name as author_display_name, 
                u.avatar_url as author_avatar_url, c.name as category_name, c.slug as category_slug,
                COALESCE((SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id AND v.user_id = $1) > 0, false) as user_upvoted,
                COALESCE((SELECT COUNT(*) FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = $1) > 0, false) as user_bookmarked,
                (SELECT COUNT(*) FROM bookmarks b WHERE b.post_id = p.id) as bookmark_count
         FROM posts p
         JOIN users u ON p.author_id = u.id
         JOIN categories c ON p.category_id = c.id
         WHERE p.is_deleted = false
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3"
    )
    .bind(user_id_param)
    .bind(limit)
    .bind(offset)
    .fetch_all(db.inner())
    .await
    .map_err(|e| {
        eprintln!("Error fetching posts: {:?}", e);
        Status::InternalServerError
    })?;

    // Get total count
    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM posts WHERE is_deleted = false")
        .fetch_one(db.inner())
        .await
        .unwrap_or(0);

    Ok(Json(PaginatedResponse::new(posts, total, page, limit)))
}

#[get("/posts/<id>")]
pub async fn get_post(
    db: &State<PgPool>,
    auth: Option<AuthGuard>,
    id: String,
) -> Result<Json<PostWithDetails>, Status> {
    let post_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;
    let user_id = auth.as_ref().and_then(|a| Uuid::parse_str(&a.user_id).ok());

    // Track view for this user/post combo (only once per user)
    if let Some(uid) = user_id {
        sqlx::query(
            "INSERT INTO post_views (post_id, user_id) 
             VALUES ($1, $2) 
             ON CONFLICT (post_id, user_id) DO NOTHING"
        )
        .bind(post_id)
        .bind(uid)
        .execute(db.inner())
        .await
        .ok();

        // Update post view_count based on unique views
        sqlx::query(
            "UPDATE posts 
             SET view_count = (SELECT COUNT(*) FROM post_views WHERE post_id = $1)
             WHERE id = $1"
        )
        .bind(post_id)
        .execute(db.inner())
        .await
        .ok();
    } else {
        // For anonymous users, just increment (legacy behavior)
        sqlx::query("UPDATE posts SET view_count = view_count + 1 WHERE id = $1")
            .bind(post_id)
            .execute(db.inner())
            .await
            .ok();
    }

    let user_id_param = user_id.unwrap_or_else(|| Uuid::nil());

    let post = sqlx::query_as::<_, PostWithDetails>(
        "SELECT p.*, u.username as author_username, u.display_name as author_display_name,
                u.avatar_url as author_avatar_url, c.name as category_name, c.slug as category_slug,
                COALESCE((SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id AND v.user_id = $2) > 0, false) as user_upvoted,
                COALESCE((SELECT COUNT(*) FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = $2) > 0, false) as user_bookmarked,
                (SELECT COUNT(*) FROM bookmarks b WHERE b.post_id = p.id) as bookmark_count
         FROM posts p
         JOIN users u ON p.author_id = u.id
         JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1 AND p.is_deleted = false"
    )
    .bind(post_id)
    .bind(user_id_param)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::NotFound)?;

    Ok(Json(post))
}

#[post("/posts", data = "<request>")]
pub async fn create_post(
    db: &State<PgPool>,
    auth: AuthGuard,
    request: Json<CreatePostRequest>,
) -> Result<Json<Post>, Status> {
    let author_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    let post = sqlx::query_as::<_, Post>(
        "INSERT INTO posts (title, content, category_id, author_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *"
    )
    .bind(&request.title)
    .bind(&request.content)
    .bind(&request.category_id)
    .bind(author_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    // Handle tags if provided
    if let Some(tags) = &request.tags {
        for tag_name in tags {
            let tag_slug = tag_name.to_lowercase().replace(" ", "-");
            
            // Insert or get existing tag
            let tag_id: Uuid = sqlx::query_scalar(
                "INSERT INTO tags (name, slug) VALUES ($1, $2)
                 ON CONFLICT (slug) DO UPDATE SET slug = tags.slug
                 RETURNING id"
            )
            .bind(tag_name)
            .bind(&tag_slug)
            .fetch_one(db.inner())
            .await
            .map_err(|_| Status::InternalServerError)?;

            // Link tag to post
            sqlx::query("INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)")
                .bind(post.id)
                .bind(tag_id)
                .execute(db.inner())
                .await
                .ok();
        }
    }

    Ok(Json(post))
}

#[put("/posts/<id>", data = "<request>")]
pub async fn update_post(
    db: &State<PgPool>,
    auth: AuthGuard,
    id: String,
    request: Json<UpdatePostRequest>,
) -> Result<Json<Post>, Status> {
    let post_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    // Check if user owns the post or is admin/moderator
    let existing_post: Post = sqlx::query_as("SELECT * FROM posts WHERE id = $1")
        .bind(post_id)
        .fetch_one(db.inner())
        .await
        .map_err(|_| Status::NotFound)?;

    if existing_post.author_id != user_id && !auth.is_moderator_or_admin() {
        return Err(Status::Forbidden);
    }

    let post = sqlx::query_as::<_, Post>(
        "UPDATE posts 
         SET title = COALESCE($1, title),
             content = COALESCE($2, content),
             category_id = COALESCE($3, category_id),
             updated_at = NOW()
         WHERE id = $4
         RETURNING *"
    )
    .bind(&request.title)
    .bind(&request.content)
    .bind(&request.category_id)
    .bind(post_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    // Update tags if provided
    if let Some(tags) = &request.tags {
        // Remove existing tags
        sqlx::query("DELETE FROM post_tags WHERE post_id = $1")
            .bind(post_id)
            .execute(db.inner())
            .await
            .ok();

        // Add new tags
        for tag_name in tags {
            let tag_slug = tag_name.to_lowercase().replace(" ", "-");
            
            let tag_id: Uuid = sqlx::query_scalar(
                "INSERT INTO tags (name, slug) VALUES ($1, $2)
                 ON CONFLICT (slug) DO UPDATE SET slug = tags.slug
                 RETURNING id"
            )
            .bind(tag_name)
            .bind(&tag_slug)
            .fetch_one(db.inner())
            .await
            .map_err(|_| Status::InternalServerError)?;

            sqlx::query("INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)")
                .bind(post_id)
                .bind(tag_id)
                .execute(db.inner())
                .await
                .ok();
        }
    }

    Ok(Json(post))
}

#[delete("/posts/<id>")]
pub async fn delete_post(
    db: &State<PgPool>,
    auth: AuthGuard,
    id: String,
) -> Result<Status, Status> {
    let post_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    // Check if user owns the post or has permission to delete
    let existing_post: Post = sqlx::query_as("SELECT * FROM posts WHERE id = $1")
        .bind(post_id)
        .fetch_one(db.inner())
        .await
        .map_err(|_| Status::NotFound)?;

    if existing_post.author_id != user_id && !auth.get_role().can_delete_any_post() {
        return Err(Status::Forbidden);
    }

    // Soft delete
    sqlx::query(
        "UPDATE posts SET is_deleted = true, deleted_at = NOW(), deleted_by = $1 WHERE id = $2"
    )
    .bind(user_id)
    .bind(post_id)
    .execute(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    Ok(Status::NoContent)
}

#[post("/posts/<id>/pin")]
pub async fn pin_post(
    db: &State<PgPool>,
    _moderator: ModeratorGuard,
    id: String,
) -> Result<Json<Post>, Status> {
    let post_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;

    let post = sqlx::query_as::<_, Post>(
        "UPDATE posts SET is_pinned = true, updated_at = NOW() WHERE id = $1 RETURNING *"
    )
    .bind(post_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::NotFound)?;

    Ok(Json(post))
}

#[post("/posts/<id>/unpin")]
pub async fn unpin_post(
    db: &State<PgPool>,
    _moderator: ModeratorGuard,
    id: String,
) -> Result<Json<Post>, Status> {
    let post_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;

    let post = sqlx::query_as::<_, Post>(
        "UPDATE posts SET is_pinned = false, updated_at = NOW() WHERE id = $1 RETURNING *"
    )
    .bind(post_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::NotFound)?;

    Ok(Json(post))
}

#[post("/posts/<id>/lock")]
pub async fn lock_post(
    db: &State<PgPool>,
    _moderator: ModeratorGuard,
    id: String,
) -> Result<Json<Post>, Status> {
    let post_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;

    let post = sqlx::query_as::<_, Post>(
        "UPDATE posts SET is_locked = true, updated_at = NOW() WHERE id = $1 RETURNING *"
    )
    .bind(post_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::NotFound)?;

    Ok(Json(post))
}

#[post("/posts/<id>/unlock")]
pub async fn unlock_post(
    db: &State<PgPool>,
    _moderator: ModeratorGuard,
    id: String,
) -> Result<Json<Post>, Status> {
    let post_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;

    let post = sqlx::query_as::<_, Post>(
        "UPDATE posts SET is_locked = false, updated_at = NOW() WHERE id = $1 RETURNING *"
    )
    .bind(post_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::NotFound)?;

    Ok(Json(post))
}

// ========== Comment Routes ==========

#[get("/posts/<post_id>/comments")]
pub async fn get_comments(
    db: &State<PgPool>,
    auth: Option<AuthGuard>,
    post_id: String,
) -> Result<Json<Vec<CommentWithDetails>>, Status> {
    let post_id = Uuid::parse_str(&post_id).map_err(|_| Status::BadRequest)?;
    let user_id = auth.as_ref().and_then(|a| Uuid::parse_str(&a.user_id).ok());

    // Get all top-level comments (no parent)
    let user_id_param = user_id.unwrap_or_else(|| Uuid::nil());

    let comments = sqlx::query_as::<_, CommentWithDetails>(
        "SELECT c.*, u.username as author_username, u.display_name as author_display_name,
                u.avatar_url as author_avatar_url,
                COALESCE((SELECT COUNT(*) FROM votes v WHERE v.comment_id = c.id AND v.user_id = $2) > 0, false) as user_upvoted
         FROM comments c
         JOIN users u ON c.author_id = u.id
         WHERE c.post_id = $1 AND c.parent_comment_id IS NULL AND c.is_deleted = false
         ORDER BY c.is_accepted DESC, c.upvote_count DESC, c.created_at ASC"
    )
    .bind(post_id)
    .bind(user_id_param)
    .fetch_all(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    // TODO: Fetch replies for each comment (nested structure)
    // For now, returning flat structure

    Ok(Json(comments))
}

#[post("/posts/<post_id>/comments", data = "<request>")]
pub async fn create_comment(
    db: &State<PgPool>,
    auth: AuthGuard,
    post_id: String,
    request: Json<CreateCommentRequest>,
) -> Result<Json<Comment>, Status> {
    let post_id = Uuid::parse_str(&post_id).map_err(|_| Status::BadRequest)?;
    let author_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    // Check if post is locked
    let is_locked: bool = sqlx::query_scalar("SELECT is_locked FROM posts WHERE id = $1")
        .bind(post_id)
        .fetch_one(db.inner())
        .await
        .map_err(|_| Status::NotFound)?;

    if is_locked && !auth.is_moderator_or_admin() {
        return Err(Status::Forbidden);
    }

    let comment = sqlx::query_as::<_, Comment>(
        "INSERT INTO comments (post_id, author_id, content, parent_comment_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *"
    )
    .bind(post_id)
    .bind(author_id)
    .bind(&request.content)
    .bind(&request.parent_comment_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    Ok(Json(comment))
}

#[put("/comments/<id>", data = "<request>")]
pub async fn update_comment(
    db: &State<PgPool>,
    auth: AuthGuard,
    id: String,
    request: Json<UpdateCommentRequest>,
) -> Result<Json<Comment>, Status> {
    let comment_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    // Check ownership
    let existing_comment: Comment = sqlx::query_as("SELECT * FROM comments WHERE id = $1")
        .bind(comment_id)
        .fetch_one(db.inner())
        .await
        .map_err(|_| Status::NotFound)?;

    if existing_comment.author_id != user_id {
        return Err(Status::Forbidden);
    }

    let comment = sqlx::query_as::<_, Comment>(
        "UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *"
    )
    .bind(&request.content)
    .bind(comment_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    Ok(Json(comment))
}

#[delete("/comments/<id>")]
pub async fn delete_comment(
    db: &State<PgPool>,
    auth: AuthGuard,
    id: String,
) -> Result<Status, Status> {
    let comment_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    // Check ownership or permission
    let existing_comment: Comment = sqlx::query_as("SELECT * FROM comments WHERE id = $1")
        .bind(comment_id)
        .fetch_one(db.inner())
        .await
        .map_err(|_| Status::NotFound)?;

    if existing_comment.author_id != user_id && !auth.get_role().can_delete_any_post() {
        return Err(Status::Forbidden);
    }

    // Soft delete
    sqlx::query(
        "UPDATE comments SET is_deleted = true, deleted_at = NOW(), deleted_by = $1 WHERE id = $2"
    )
    .bind(user_id)
    .bind(comment_id)
    .execute(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    Ok(Status::NoContent)
}

#[post("/comments/<id>/accept")]
pub async fn accept_comment(
    db: &State<PgPool>,
    auth: AuthGuard,
    id: String,
) -> Result<Json<Comment>, Status> {
    let comment_id = Uuid::parse_str(&id).map_err(|_| Status::BadRequest)?;
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    // Check if user is the post author
    let post_author_id: Uuid = sqlx::query_scalar(
        "SELECT p.author_id FROM posts p 
         JOIN comments c ON c.post_id = p.id 
         WHERE c.id = $1"
    )
    .bind(comment_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::NotFound)?;

    if post_author_id != user_id {
        return Err(Status::Forbidden);
    }

    let comment = sqlx::query_as::<_, Comment>(
        "UPDATE comments SET is_accepted = true, updated_at = NOW() WHERE id = $1 RETURNING *"
    )
    .bind(comment_id)
    .fetch_one(db.inner())
    .await
    .map_err(|_| Status::NotFound)?;

    Ok(Json(comment))
}

// ========== Vote Routes ==========

#[post("/vote", data = "<request>")]
pub async fn toggle_vote(
    db: &State<PgPool>,
    auth: AuthGuard,
    request: Json<VoteRequest>,
) -> Result<Json<serde_json::Value>, Status> {
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    if request.post_id.is_none() && request.comment_id.is_none() {
        return Err(Status::BadRequest);
    }

    // Check if vote exists
    let existing_vote: Option<Vote> = if let Some(post_id) = request.post_id {
        sqlx::query_as("SELECT * FROM votes WHERE user_id = $1 AND post_id = $2")
            .bind(user_id)
            .bind(post_id)
            .fetch_optional(db.inner())
            .await
            .map_err(|_| Status::InternalServerError)?
    } else {
        sqlx::query_as("SELECT * FROM votes WHERE user_id = $1 AND comment_id = $2")
            .bind(user_id)
            .bind(request.comment_id.unwrap())
            .fetch_optional(db.inner())
            .await
            .map_err(|_| Status::InternalServerError)?
    };

    if let Some(vote) = existing_vote {
        // Remove vote (toggle off)
        sqlx::query("DELETE FROM votes WHERE id = $1")
            .bind(vote.id)
            .execute(db.inner())
            .await
            .map_err(|_| Status::InternalServerError)?;

        Ok(Json(serde_json::json!({"voted": false})))
    } else {
        // Add vote
        sqlx::query(
            "INSERT INTO votes (user_id, post_id, comment_id, vote_type)
             VALUES ($1, $2, $3, 'upvote')"
        )
        .bind(user_id)
        .bind(request.post_id)
        .bind(request.comment_id)
        .execute(db.inner())
        .await
        .map_err(|_| Status::InternalServerError)?;

        Ok(Json(serde_json::json!({"voted": true})))
    }
}

// ========== Bookmark Routes ==========

#[post("/posts/<post_id>/bookmark")]
pub async fn toggle_bookmark(
    db: &State<PgPool>,
    auth: AuthGuard,
    post_id: String,
) -> Result<Json<serde_json::Value>, Status> {
    let post_id = Uuid::parse_str(&post_id).map_err(|_| Status::BadRequest)?;
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    // Check if bookmark exists
    let existing: Option<Bookmark> = sqlx::query_as(
        "SELECT * FROM bookmarks WHERE user_id = $1 AND post_id = $2"
    )
    .bind(user_id)
    .bind(post_id)
    .fetch_optional(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    if let Some(bookmark) = existing {
        // Remove bookmark
        sqlx::query("DELETE FROM bookmarks WHERE id = $1")
            .bind(bookmark.id)
            .execute(db.inner())
            .await
            .map_err(|_| Status::InternalServerError)?;

        Ok(Json(serde_json::json!({"bookmarked": false})))
    } else {
        // Add bookmark
        sqlx::query("INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)")
            .bind(user_id)
            .bind(post_id)
            .execute(db.inner())
            .await
            .map_err(|_| Status::InternalServerError)?;

        Ok(Json(serde_json::json!({"bookmarked": true})))
    }
}

#[get("/bookmarks")]
pub async fn get_user_bookmarks(
    db: &State<PgPool>,
    auth: AuthGuard,
) -> Result<Json<Vec<PostWithDetails>>, Status> {
    let user_id = Uuid::parse_str(&auth.user_id).map_err(|_| Status::BadRequest)?;

    let posts = sqlx::query_as::<_, PostWithDetails>(
        "SELECT p.*, u.username as author_username, u.display_name as author_display_name,
                u.avatar_url as author_avatar_url, c.name as category_name, c.slug as category_slug,
                true as user_upvoted, true as user_bookmarked
         FROM bookmarks b
         JOIN posts p ON b.post_id = p.id
         JOIN users u ON p.author_id = u.id
         JOIN categories c ON p.category_id = c.id
         WHERE b.user_id = $1 AND p.is_deleted = false
         ORDER BY b.created_at DESC"
    )
    .bind(user_id)
    .fetch_all(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    Ok(Json(posts))
}

// ========== Tag Routes ==========

#[get("/tags")]
pub async fn get_tags(db: &State<PgPool>) -> Result<Json<Vec<Tag>>, Status> {
    let tags = sqlx::query_as::<_, Tag>(
        "SELECT * FROM tags ORDER BY usage_count DESC LIMIT 50"
    )
    .fetch_all(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    Ok(Json(tags))
}

#[get("/posts/<post_id>/tags")]
pub async fn get_post_tags(
    db: &State<PgPool>,
    post_id: String,
) -> Result<Json<Vec<Tag>>, Status> {
    let post_id = Uuid::parse_str(&post_id).map_err(|_| Status::BadRequest)?;

    let tags = sqlx::query_as::<_, Tag>(
        "SELECT t.* FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = $1
         ORDER BY t.name ASC"
    )
    .bind(post_id)
    .fetch_all(db.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    Ok(Json(tags))
}
