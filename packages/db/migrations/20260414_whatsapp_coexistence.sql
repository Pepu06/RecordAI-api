-- WhatsApp Coexistence: per-tenant phone number tracking
-- Apply in Supabase SQL Editor

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS whatsapp_display_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_waba_id text,
  ADD COLUMN IF NOT EXISTS whatsapp_coexistence_status text
    CHECK (whatsapp_coexistence_status IN ('not_connected', 'active', 'disconnected')),
  ADD COLUMN IF NOT EXISTS whatsapp_connected_at timestamptz;

-- Index for fast tenant lookup from webhook metadata.phone_number_id
CREATE INDEX IF NOT EXISTS idx_tenants_wa_phone_number_id
  ON tenants(whatsapp_phone_number_id)
  WHERE whatsapp_phone_number_id IS NOT NULL;

-- whatsapp_access_token is now deprecated in favor of META_SYSTEM_USER_TOKEN env var
-- Column kept for backward compat; ignored when META_SYSTEM_USER_TOKEN is set
COMMENT ON COLUMN tenants.whatsapp_access_token IS
  'DEPRECATED: centralized billing uses META_SYSTEM_USER_TOKEN env var. This column is ignored.';
