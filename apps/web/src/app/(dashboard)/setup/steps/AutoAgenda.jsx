'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import styles from '../setup.module.css';

export default function AutoAgendaStep({ done, onNext, onBack, onSkip }) {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleEnable(e) {
    e.preventDefault();
    if (!slug.trim()) { setError('El link es requerido.'); return; }
    setSaving(true); setError('');
    try {
      await api.put('/autoagenda/profile', {
        slug: slug.trim().toLowerCase(),
        autoagendaEnabled: true,
      });
      onNext();
    } catch (err) {
      setError(err.message || 'Error al configurar.');
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <>
        <div className={styles.stepIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h2 className={styles.stepTitle}>TuAutoAgenda activada</h2>
        <p className={styles.stepDesc}>
          Tu página de reservas ya está activa. Tus clientes pueden agendar citas desde tu link público.
        </p>
        <div className={styles.success}>
          TuAutoAgenda está configurada y activa.
        </div>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={onBack}>Anterior</button>
          <button className={styles.btnPrimary} onClick={() => router.push('/tu-autoagenda')}>
            Ir a TuAutoAgenda
          </button>
          <button className={styles.btnSuccess} onClick={onNext}>Siguiente</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.stepIcon}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <h2 className={styles.stepTitle}>Configurá TuAutoAgenda</h2>
      <p className={styles.stepDesc}>
        TuAutoAgenda es tu página pública de reservas. Tus clientes pueden agendar citas online sin que tengas que intervenir. Elegí tu link único para empezar.
      </p>

      <form onSubmit={handleEnable}>
        <div className={styles.field}>
          <label className={styles.label}>Tu link de reservas</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>autoagenda.online/book/</span>
            <input
              className={styles.input}
              style={{ flex: 1, minWidth: 160 }}
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="tu-negocio"
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Solo minúsculas, números y guiones. Ej: pedro-gonzalez
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={onBack}>Anterior</button>
          <button type="button" className={styles.btnSecondary} onClick={onSkip}>Omitir</button>
          <button type="submit" className={styles.btnSuccess} disabled={saving}>
            {saving ? 'Activando...' : 'Activar TuAutoAgenda'}
          </button>
        </div>
      </form>
    </>
  );
}
