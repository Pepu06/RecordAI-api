-- Email verification fields for users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token_hash) WHERE email_verification_token_hash IS NOT NULL;
