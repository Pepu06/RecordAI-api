'use client';

import { useState } from 'react';
import { api } from '../../../../lib/api';
import styles from '../setup.module.css';

export default function WhatsAppConfig({ data, onNext, onBack, onSkip }) {
  const [provider, setProvider] = useState(data?.whatsappProvider || 'meta');
  const [phoneNumberId, setPhoneNumberId] = useState(data?.whatsappPhoneNumberId || '');
  const [accessToken, setAccessToken] = useState(data?.whatsappAccessToken || '');
  const [wasenderKey, setWasenderKey] = useState(data?.wasenderApiKey || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleNext() {
    setSaving(true); setError('');
    try {
      const payload = { whatsapp_provider: provider };
      if (provider === 'wasender') {
        if (!wasenderKey.trim()) { setError('Ingresá tu API Key de WasenderAPI.'); setSaving(false); return; }
        payload.wasender_api_key = wasenderKey.trim();
      } else {
        if (!phoneNumberId.trim() || !accessToken.trim()) {
          setError('Completá el Phone Number ID y el Access Token de WhatsApp Business.'); setSaving(false); return;
        }
        payload.whatsapp_phone_number_id = phoneNumberId.trim();
        payload.whatsapp_access_token = accessToken.trim();
      }
      await api.put('/settings', payload);
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
      <h2 className={styles.stepTitle}>Configurar WhatsApp</h2>
      <p className={styles.stepDesc}>
        Elegí cómo querés enviar los mensajes. Si tenés una cuenta de WhatsApp Business API, usá Meta. Si no, WasenderAPI es la alternativa más simple.
      </p>

      <div className={styles.toggleGroup}>
        <button
          className={`${styles.toggleBtn} ${provider === 'meta' ? styles.active : ''}`}
          onClick={() => setProvider('meta')}
        >WhatsApp Business (Meta)</button>
        <button
          className={`${styles.toggleBtn} ${provider === 'wasender' ? styles.active : ''}`}
          onClick={() => setProvider('wasender')}
        >WasenderAPI</button>
      </div>

      {provider === 'meta' ? (
        <>
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
            <span className={styles.hint}>Lo encontrás en Meta for Developers → Tu App → WhatsApp → API Setup.</span>
          </div>
        </>
      ) : (
        <div className={styles.field}>
          <label className={styles.label}>API Key de WasenderAPI</label>
          <input
            className={styles.input}
            type="password"
            value={wasenderKey}
            onChange={e => setWasenderKey(e.target.value)}
            placeholder="Tu API Key de wasenderapi.com"
          />
          <span className={styles.hint}>Creá tu cuenta en wasenderapi.com y copiá el token desde el panel.</span>
        </div>
      )}

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
