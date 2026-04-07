const cron = require('node-cron');
const { supabase } = require('@autoagenda/db');
const { sendTextMessage } = require('../services/whatsapp');
const { sendEmail } = require('../services/email');
const { getPlanConfig } = require('../services/mercadopago');
const env = require('../config/env');
const logger = require('../config/logger');

const PLAN_NAMES = { basic: 'Plan Inicial', pro: 'Plan Profesional' };

function buildRenewalContent(planName, price, expiresAt) {
  const cbu = env.PAYMENT_CBU;
  const alias = env.PAYMENT_ALIAS;

  const paymentLines = [];
  if (cbu) paymentLines.push(`CBU: ${cbu}`);
  if (alias) paymentLines.push(`Alias: ${alias}`);
  const paymentText = paymentLines.join('\n');

  const whatsapp =
    `⏰ *Recordatorio de renovación - AutoAgenda*\n\n` +
    `Tu suscripción al *${planName}* vence el *${expiresAt}*.\n\n` +
    `Para continuar usando el servicio, realizá una transferencia de *${price}/mes* a:\n\n` +
    `${paymentLines.map(l => `💳 ${l}`).join('\n')}\n\n` +
    `Una vez realizada la transferencia, subí el comprobante desde el panel en AutoAgenda y lo activamos en el día.\n\n` +
    `¿Consultas? Respondé este mensaje.`;

  const emailSubject = `⏰ Tu suscripción a AutoAgenda vence el ${expiresAt}`;

  const emailHtml = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#1a1a1a">Recordatorio de renovación</h2>
      <p>Tu suscripción al <strong>${planName}</strong> vence el <strong>${expiresAt}</strong>.</p>
      <p>Para continuar usando AutoAgenda, realizá una transferencia de <strong>${price}/mes</strong> a:</p>
      <table style="background:#f5f5f5;padding:16px;border-radius:8px;width:100%">
        ${paymentLines.map(l => `<tr><td style="padding:4px 0"><strong>${l}</strong></td></tr>`).join('')}
      </table>
      <p style="margin-top:16px">Una vez realizada la transferencia, <strong>subí el comprobante desde el panel en AutoAgenda</strong> y lo activamos en el día.</p>
      <p style="color:#666;font-size:13px">¿Consultas? Respondé este email.</p>
    </div>
  `;

  const emailText =
    `Recordatorio de renovación - AutoAgenda\n\n` +
    `Tu suscripción al ${planName} vence el ${expiresAt}.\n\n` +
    `Para continuar usando el servicio, realizá una transferencia de ${price}/mes a:\n` +
    `${paymentText}\n\n` +
    `Una vez realizada la transferencia, subí el comprobante desde el panel en AutoAgenda y lo activamos en el día.`;

  return { whatsapp, emailSubject, emailHtml, emailText };
}

/**
 * Sends WhatsApp + email reminders to tenants whose subscription expires in ~3 days.
 */
async function sendRenewalReminders() {
  logger.info('[RenewalCron] Checking subscriptions expiring in 3 days...');

  const now = new Date();
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('id, tenant_id, plan, current_period_end')
    .eq('status', 'active')
    .in('plan', ['basic', 'pro'])
    .lte('current_period_end', in3Days.toISOString())
    .gte('current_period_end', now.toISOString());

  if (error) {
    logger.error({ err: error.message }, '[RenewalCron] Error fetching subscriptions');
    return;
  }

  if (!subscriptions?.length) {
    logger.info('[RenewalCron] No subscriptions expiring soon.');
    return;
  }

  const tenantIds = subscriptions.map(s => s.tenant_id);

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, admin_whatsapp, whatsapp_provider, whatsapp_phone_number_id, whatsapp_access_token, wasender_api_key')
    .in('id', tenantIds);

  // Get owner emails for each tenant
  const { data: users } = await supabase
    .from('users')
    .select('tenant_id, email')
    .in('tenant_id', tenantIds)
    .eq('role', 'owner');

  const tenantMap = (tenants || []).reduce((acc, t) => { acc[t.id] = t; return acc; }, {});
  const emailMap = (users || []).reduce((acc, u) => { acc[u.tenant_id] = u.email; return acc; }, {});

  for (const sub of subscriptions) {
    const tenant = tenantMap[sub.tenant_id];
    const ownerEmail = emailMap[sub.tenant_id];

    const planConfig = getPlanConfig(sub.plan);
    const planName = PLAN_NAMES[sub.plan] || sub.plan;
    const price = planConfig?.price ? `$${planConfig.price.toLocaleString('es-AR')} ARS` : '';
    const expiresAt = new Date(sub.current_period_end).toLocaleDateString('es-AR');

    const { whatsapp, emailSubject, emailHtml, emailText } = buildRenewalContent(planName, price, expiresAt);

    // Send WhatsApp
    if (tenant?.admin_whatsapp) {
      const tenantConfig = {
        provider: tenant.whatsapp_provider || 'meta',
        whatsappPhoneNumberId: tenant.whatsapp_phone_number_id,
        whatsappAccessToken: tenant.whatsapp_access_token,
        wasender_api_key: tenant.wasender_api_key,
      };
      try {
        await sendTextMessage(tenant.admin_whatsapp, whatsapp, tenantConfig);
        logger.info({ tenantId: sub.tenant_id, plan: sub.plan }, '[RenewalCron] WhatsApp reminder sent');
      } catch (err) {
        logger.error({ tenantId: sub.tenant_id, err: err.message }, '[RenewalCron] WhatsApp reminder failed');
      }
    } else {
      logger.warn({ tenantId: sub.tenant_id }, '[RenewalCron] No admin_whatsapp, skipping WhatsApp');
    }

    // Send email
    if (ownerEmail && env.RESEND_API_KEY) {
      try {
        await sendEmail({ to: ownerEmail, subject: emailSubject, text: emailText, html: emailHtml });
        logger.info({ tenantId: sub.tenant_id, email: ownerEmail }, '[RenewalCron] Email reminder sent');
      } catch (err) {
        logger.error({ tenantId: sub.tenant_id, err: err.message }, '[RenewalCron] Email reminder failed');
      }
    } else if (!ownerEmail) {
      logger.warn({ tenantId: sub.tenant_id }, '[RenewalCron] No owner email found, skipping email');
    }
  }

  logger.info('[RenewalCron] Done.');
}

/**
 * Marks subscriptions past their period end as cancelled.
 */
async function deactivateExpiredSubscriptions() {
  logger.info('[RenewalCron] Deactivating expired subscriptions...');

  const now = new Date();

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', updated_at: now.toISOString() })
    .eq('status', 'active')
    .in('plan', ['basic', 'pro'])
    .lt('current_period_end', now.toISOString());

  if (error) {
    logger.error({ err: error.message }, '[RenewalCron] Error deactivating expired subscriptions');
  } else {
    logger.info('[RenewalCron] Expired subscriptions deactivated.');
  }
}

function startSubscriptionRenewalCron() {
  // Send reminders daily at 10:00 AM Argentina time (13:00 UTC)
  cron.schedule('0 13 * * *', sendRenewalReminders, { timezone: 'UTC' });
  // Deactivate expired subscriptions daily at 00:05 UTC
  cron.schedule('5 0 * * *', deactivateExpiredSubscriptions, { timezone: 'UTC' });
  logger.info('[RenewalCron] Scheduled: reminders at 10:00 AR, deactivation at 00:05 UTC');
}

module.exports = { startSubscriptionRenewalCron, sendRenewalReminders, deactivateExpiredSubscriptions };
