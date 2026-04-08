-- Fix existing Google users: mark them as verified
-- Run this in Supabase SQL Editor to fix users who logged in with Google

UPDATE users 
SET email_verified = true 
WHERE google_access_token IS NOT NULL 
  AND email_verified = false;

-- Verify the update
SELECT 
  email, 
  email_verified, 
  google_access_token IS NOT NULL as has_google_token
FROM users 
WHERE google_access_token IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
