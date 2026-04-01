'use client';

import { useState } from 'react';
import styles from './AppointmentForm.module.css';

export default function AppointmentForm({ contacts, services, onSubmit, onClose }) {
  const [form, setForm] = useState({
    contactId: '',
    serviceId: '',
    scheduledAt: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // userId = current user (from token) — in real app decode from JWT
      await onSubmit({ ...form, userId: 'current' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Nueva cita</h2>
          <button onClick={onClose} className={styles.close}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Contacto
            <select
              value={form.contactId}
              onChange={(e) => setForm({ ...form, contactId: e.target.value })}
              className={styles.input}
              required
            >
              <option value="">Seleccionar contacto</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Servicio
            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className={styles.input}
              required
            >
              <option value="">Seleccionar servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Fecha y hora
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Notas (opcional)
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={styles.input}
              rows={3}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancelar</button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Guardando...' : 'Crear cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
