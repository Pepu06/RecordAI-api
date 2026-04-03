-- RecordAI appointment status migration
-- Adds the initial status used before sending confirmation

ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'sin_enviar';
