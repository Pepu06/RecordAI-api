'use client';

import { useState } from 'react';
import { api } from '../../../../lib/api';
import styles from '../setup.module.css';

export default function WhatsAppConfig({ data, onNext, onBack, onSkip }) {
  const [phoneNumberId, setPhoneNumberId] = useState(data?.whatsappPhoneNumberId || '');
  const [accessToken, setAccessToken] = useState(data?.whatsappAccessToken || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleNext() {
    if (!phoneNumberId.trim() || !accessToken.trim()) {
      setError('Completá el Phone Number ID y el Access Token.');
      return;
    }
    setSaving(true); setError('');
    try {
      await api.put('/settings', {
        whatsapp_provider: 'meta',
        whatsapp_phone_number_id: phoneNumberId.trim(),
        whatsapp_access_token: accessToken.trim(),
      });
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
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </div>
      <h2 className={styles.stepTitle}>WhatsApp Business API</h2>
      <p className={styles.stepDesc}>
        Ingresá las credenciales de tu cuenta de Meta para enviar los mensajes. Las encontrás en{' '}
        <strong>Meta for Developers → Tu App → WhatsApp → API Setup</strong>.
      </p>

      <div className={styles.field}>
        <label className={styles.label}>Phone Number ID</label>
        <input
          className={styles.input}
          value={phoneNumberId}
          onChange={e => setPhoneNumberId(e.target.value)}
          placeholder="Ej: 123456789012345"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Access Token</label>
        <input
          className={styles.input}
          type="password"
          value={accessToken}
          onChange={e => setAccessToken(e.target.value)}
          placeholder="EAAxxxxxxxxx..."
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button className={styles.btnSkip} onClick={onSkip}>Saltar por ahora</button>
        <button className={styles.btnSecondary} onClick={onBack}>Anterior</button>
        <button className={styles.btnPrimary} onClick={handleNext} disabled={saving}>
          {saving ? 'Guardando...' : 'Siguiente'}
        </button>
      </div>
    </>
  );
}
