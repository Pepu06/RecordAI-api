const { supabase } = require('@autoagenda/db');
const env = require('../config/env');
const { ValidationError, ForbiddenError } = require('../errors');
const { uploadPaymentProof, listPaymentProofs } = require('../services/googleDrive');
const logger = require('../config/logger');

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64Data: match[2] };
}

async function createPaymentProof(req, res, next) {
  try {
    const { plan, dataUrl } = req.body || {};

    if (!plan || !['inicial', 'profesional', 'custom'].includes(plan)) {
      throw new ValidationError('Plan inválido');
    }

    const parsed = parseDataUrl(dataUrl);
    if (!parsed) {
      throw new ValidationError('Comprobante inválido. Debe ser una imagen en base64.');
    }

    const fileSizeBytes = Math.floor((parsed.base64Data.length * 3) / 4);
    if (fileSizeBytes > 8 * 1024 * 1024) {
      throw new ValidationError('La imagen supera 8MB.');
    }

    const { data: user } = await supabase
      .from('users')
      .select('email, tenant_id')
      .eq('id', req.userId)
      .maybeSingle();

    const { data: tenant } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', req.tenantId)
      .maybeSingle();

    const uploaded = await uploadPaymentProof({
      tenantId: req.tenantId,
      tenantName: tenant?.name || 'Mi Negocio',
      tenantEmail: user?.email || '',
      plan,
      mimeType: parsed.mimeType,
      base64Data: parsed.base64Data,
    });

    logger.info({ tenantId: req.tenantId, fileId: uploaded.id, plan }, 'Payment proof uploaded to Google Drive');

    return res.status(201).json({
      success: true,
      proof: {
        id: uploaded.id,
        plan,
        imageUrl: uploaded.imageUrl,
        webViewLink: uploaded.webViewLink,
        createdAt: uploaded.createdTime,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getAdminPaymentProofs(req, res, next) {
  try {
    const adminPassword = req.headers['x-admin-password'];
    if (!adminPassword || adminPassword !== env.ADMIN_PANEL_PASSWORD) {
      throw new ForbiddenError('Admin password inválida');
    }

    const proofs = await listPaymentProofs();
    return res.json({ proofs });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPaymentProof,
  getAdminPaymentProofs,
};
