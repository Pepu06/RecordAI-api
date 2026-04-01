'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import styles from './dashboard.page.module.css';

export default function DashboardPage() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/calendar/events')
      .then(res => setEvents(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const stats = {
    sentToday:  events.filter(e => e.start?.slice(0, 10) === today && e.status !== null).length,
    confirmed:  events.filter(e => e.status === 'confirmed').length,
    pending:    events.filter(e => e.status === 'pending').length,
    cancelled:  events.filter(e => e.status === 'cancelled').length,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.greeting}>
          {greeting},<br />
          <span className={styles.greetingAccent}>bienvenido.</span>
        </h1>
        <p className={styles.subtitle}>Resumen de tus citas de los próximos 30 días</p>
      </div>
      {loading ? (
        <div className="spinnerWrap"><div className="spinner" /></div>
      ) : (
        <div className={styles.grid}>
          <StatCard label="Enviados hoy"  value={stats.sentToday} color="var(--blue)"   iconBg="var(--blue-bg)"   />
          <StatCard label="Confirmadas"   value={stats.confirmed} color="var(--green)"  iconBg="var(--green-bg)"  />
          <StatCard label="Pendientes"    value={stats.pending}   color="var(--yellow)" iconBg="var(--yellow-bg)" />
          <StatCard label="Canceladas"    value={stats.cancelled} color="var(--red)"    iconBg="var(--red-bg)"    />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, iconBg }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIconWrap} style={{ background: iconBg }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
      </div>
      <p className={styles.cardValue} style={{ color }}>{value}</p>
      <p className={styles.cardLabel}>{label}</p>
    </div>
  );
}
