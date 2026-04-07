const { supabase } = require('@autoagenda/db');
const { AppError } = require('../errors');

async function metrics(req, res, next) {
  try {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('timezone')
      .eq('id', req.tenantId)
      .single();

    const tz = tenant?.timezone || 'America/Argentina/Buenos_Aires';

    // Calcular fecha de hoy y límite de 30 días en la timezone del tenant
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, status, scheduled_at, contact:contacts(name, phone), service:services(name)')
      .eq('tenant_id', req.tenantId)
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', in30Days.toISOString())
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    const appts = appointments || [];

    // Count stats
    const confirmed = appts.filter(a => a.status === 'confirmed').length;
    const pending    = appts.filter(a => a.status === 'pending' || a.status === 'notified').length;
    const cancelled  = appts.filter(a => a.status === 'cancelled').length;
    const sentToday  = appts.filter(a => {
      const apptDate = new Date(a.scheduled_at).toLocaleDateString('en-CA', { timeZone: tz });
      return apptDate === todayStr && a.status !== 'sin_enviar' && a.status !== null;
    }).length;

    // Events for today (all statuses)
    const upcomingToday = appts
      .filter(a => new Date(a.scheduled_at).toLocaleDateString('en-CA', { timeZone: tz }) === todayStr)
      .slice(0, 6)
      .map(a => ({
        id: a.id,
        scheduledAt: a.scheduled_at,
        status: a.status,
        contactName: a.contact?.name || '',
        contactPhone: a.contact?.phone || '',
        serviceName: a.service?.name || '',
      }));

    // Next 7 days (excluding today, non-cancelled)
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingNext = appts
      .filter(a => {
        const apptDate = new Date(a.scheduled_at).toLocaleDateString('en-CA', { timeZone: tz });
        return apptDate > todayStr && new Date(a.scheduled_at) <= in7Days && a.status !== 'cancelled';
      })
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        scheduledAt: a.scheduled_at,
        status: a.status,
        contactName: a.contact?.name || '',
        contactPhone: a.contact?.phone || '',
        serviceName: a.service?.name || '',
      }));

    return res.json({
      success: true,
      data: { sentToday, confirmed, pending, cancelled, upcomingToday, upcomingNext },
    });
  } catch (err) { return next(err); }
}

module.exports = { metrics };
