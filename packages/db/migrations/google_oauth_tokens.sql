-- Add Google OAuth token fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

-- Index for performance when querying by Google tokens
CREATE INDEX IF NOT EXISTS idx_users_google_access_token ON users(google_access_token) WHERE google_access_token IS NOT NULL;
