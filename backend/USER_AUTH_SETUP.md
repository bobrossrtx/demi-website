# User Authentication Setup

## SQLx and Database Integration

The backend now includes SQLx for PostgreSQL integration with user authentication.

## Setup Instructions

### 1. Install SQLx CLI

```bash
cargo install sqlx-cli --no-default-features --features postgres
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your database credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_here_change_this
```

**Generate a secure JWT secret:**

```bash
openssl rand -base64 32
```

### 3. Run Database Migrations

```bash
cd backend
sqlx migrate run
```

### 4. Build and Run

```bash
cargo build
cargo run
```

## API Endpoints

### Authentication

#### Register a new user
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "display_name": "John Doe"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "display_name": "John Doe",
    "bio": null,
    "avatar_url": null,
    "role": "user",
    "created_at": "2026-01-21T12:00:00Z"
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username_or_email": "john_doe",
  "password": "secure_password"
}
```

Response: Same as register

### User Endpoints

#### Get current user (requires authentication)
```bash
GET /api/users/me
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get user by username (public)
```bash
GET /api/users/john_doe
```

## Database Schema

### Users Table

- `id` - UUID (Primary Key)
- `username` - VARCHAR(50) (Unique, Not Null)
- `email` - VARCHAR(255) (Unique, Not Null)
- `password_hash` - VARCHAR(255) (Not Null)
- `display_name` - VARCHAR(100) (Optional)
- `bio` - TEXT (Optional)
- `avatar_url` - VARCHAR(500) (Optional)
- `created_at` - TIMESTAMP (Default: NOW)
- `updated_at` - TIMESTAMP (Default: NOW)
- `last_login` - TIMESTAMP (Optional)
- `is_active` - BOOLEAN (Default: true)
- `role` - VARCHAR(20) (Default: 'user', Options: 'user', 'moderator', 'admin')

## Security Features

- ✅ Password hashing with bcrypt (cost factor: 12)
- ✅ JWT tokens with 7-day expiration
- ✅ Protected routes with AuthGuard
- ✅ Role-based access control ready
- ✅ Input validation
- ✅ SQL injection protection via parameterized queries
- ✅ Unique constraints on username and email

## Testing with cURL

### Register:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "display_name": "Test User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "testuser",
    "password": "password123"
  }'
```

### Get Current User:
```bash
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

- [ ] Add email verification
- [ ] Add password reset functionality
- [ ] Add user profile update endpoints
- [ ] Add forum and blog post tables
- [ ] Add OAuth integration (Google, GitHub)
- [ ] Add rate limiting
- [ ] Add refresh tokens
