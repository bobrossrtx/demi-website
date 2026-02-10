-- Add hide_username column to users table
ALTER TABLE users ADD COLUMN hide_username BOOLEAN DEFAULT FALSE;

-- Create index for username uniqueness checks (case-insensitive)
CREATE UNIQUE INDEX idx_users_username_lower ON users(LOWER(username));

-- Note: Display names can't match any existing username (enforced in application logic)
