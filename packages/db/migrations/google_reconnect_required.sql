-- Flag to surface Google Calendar reconnect prompt when refresh token is revoked
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_reconnect_required BOOLEAN NOT NULL DEFAULT FALSE;
