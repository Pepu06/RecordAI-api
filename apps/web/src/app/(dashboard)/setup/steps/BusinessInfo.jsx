'use client';

import { useState } from 'react';
import { api } from '../../../../lib/api';
import styles from '../setup.module.css';

const TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'America/Santiago', label: 'Santiago (GMT-3/-4)' },
  { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1/+2)' },
  { value: 'UTC', label: 'UTC' },
];

export default function BusinessInfo({ data, onNext, onSkip }) {
  const [businessName, setBusinessName] = useState(data?.businessName || '');
  const [timezone, setTimezone] = useState(data?.timezone || 'America/Argentina/Buenos_Aires');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleNext() {
    if (!businessName.trim()) { setError('El nombre del negocio es obligatorio.'); return; }
    setSaving(true); setError('');
    try {
      await api.put('/settings', { business_name: businessName.trim(), timezone });
      onNext();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.stepIcon}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <h2 className={styles.stepTitle}>Info de tu negocio</h2>
      <p className={styles.stepDesc}>Este nombre aparecerá en los mensajes de WhatsApp que reciban tus clientes.</p>

      <div className={styles.field}>
        <label className={styles.label}>Nombre del negocio</label>
        <input
          className={styles.input}
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          placeholder="Ej: Consultorio Dra. López"
          maxLength={60}
        />
        <span className={styles.hint}>Se muestra en el encabezado de cada recordatorio.</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Zona horaria</label>
        <select className={styles.select} value={timezone} onChange={e => setTimezone(e.target.value)}>
          {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button className={styles.btnSkip} onClick={onSkip}>Saltar por ahora</button>
        <button className={styles.btnPrimary} onClick={handleNext} disabled={saving}>
          {saving ? 'Guardando...' : 'Siguiente'}
        </button>
      </div>
    </>
  );
}
