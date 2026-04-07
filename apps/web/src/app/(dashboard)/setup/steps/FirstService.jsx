'use client';

import { useState } from 'react';
import { api } from '../../../../lib/api';
import styles from '../setup.module.css';

export default function FirstService({ services: initialServices, onNext, onBack, onSkip }) {
  const [services, setServices] = useState(initialServices || []);
  const [showForm, setShowForm] = useState((initialServices || []).length === 0);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim()) { setError('El nombre del servicio es obligatorio.'); return; }
    const dur = parseInt(duration, 10);
    if (!dur || dur < 5) { setError('La duración mínima es 5 minutos.'); return; }
    setSaving(true); setError('');
    try {
      const res = await api.post('/services', {
        name: name.trim(),
        duration_minutes: dur,
        price: price ? parseFloat(price) : null,
      });
      setServices(s => [...s, res.data]);
      setName(''); setDuration('30'); setPrice('');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Error al crear el servicio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.stepIcon}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2 className={styles.stepTitle}>Primer servicio</h2>
      <p className={styles.stepDesc}>
        Agregá al menos un servicio para poder crear citas. Por ejemplo: Consulta, Corte de pelo, Limpieza dental.
      </p>

      {services.length > 0 && (
        <div className={styles.serviceList}>
          {services.map(s => (
            <div key={s.id} className={styles.serviceItem}>
              <span>{s.name}</span>
              <span className={styles.serviceItemRight}>
                {s.durationMinutes || s.duration_minutes} min
                {s.price ? ` · $${s.price}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <>
          <div className={styles.field}>
            <label className={styles.label}>Nombre del servicio</label>
            <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Consulta general" />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Duración (minutos)</label>
              <input className={styles.input} type="number" min="5" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Precio (opcional)</label>
              <input className={styles.input} type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="Ej: 5000" />
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.btnPrimary} onClick={handleCreate} disabled={saving} style={{ marginBottom: '10px' }}>
            {saving ? 'Creando...' : 'Crear servicio'}
          </button>
        </>
      ) : (
        <button className={styles.addLink} onClick={() => { setShowForm(true); setError(''); }}>
          + Agregar otro servicio
        </button>
      )}

      <div className={styles.actions}>
        <button className={styles.btnSkip} onClick={onSkip}>Saltar por ahora</button>
        <button className={styles.btnSecondary} onClick={onBack}>Anterior</button>
        <button className={styles.btnPrimary} onClick={onNext} disabled={services.length === 0 && !showForm}>
          Siguiente
        </button>
      </div>
    </>
  );
}
