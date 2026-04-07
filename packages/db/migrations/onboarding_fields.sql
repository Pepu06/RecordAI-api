-- Columnas para trackear el progreso del onboarding por tenant
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 0;

-- Marcar como completados los tenants que ya tienen el negocio configurado
UPDATE tenants SET onboarding_completed = TRUE WHERE business_name IS NOT NULL AND business_name != '';
