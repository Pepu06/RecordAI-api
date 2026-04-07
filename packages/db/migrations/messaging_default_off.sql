-- Cambiar el default de messaging_enabled a FALSE para nuevos tenants
ALTER TABLE tenants ALTER COLUMN messaging_enabled SET DEFAULT FALSE;

-- Apagar el motor en tenants que no tienen configuración básica
UPDATE tenants
SET messaging_enabled = FALSE
WHERE messaging_enabled = TRUE
  AND (business_name IS NULL OR business_name = '');
