'use client';

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '../../../../lib/api';
import styles from '../setup.module.css';

export default function GoogleCalendar({ done, onNext, onBack, onSkip }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(done);
  const [error, setError] = useState('');

  const connectCalendar = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
    onSuccess: async ({ code }) => {
      setConnecting(true); setError('');
      try {
        await api.post('/calendar/connect', { code });
        setConnected(true);
      } catch (err) {
        setError(err.message || 'Error al conectar');
      } finally {
        setConnecting(false);
      }
    },
    onError: () => setError('Error al conectar con Google'),
  });

  return (
    <>
      <div className={styles.stepIcon}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="17" rx="2"/>
          <path d="M3 9h18"/>
          <path d="M8 2v4M16 2v4"/>
        </svg>
      </div>
      <h2 className={styles.stepTitle}>Conectar Google Calendar</h2>
      <p className={styles.stepDesc}>
        AutoAgenda lee tus eventos de Google Calendar para crear citas automáticamente y sincroniza los estados (confirmado/cancelado) de vuelta al calendario.
      </p>

      {connected ? (
        <div className={styles.connectedBadge}>
          <div className={styles.connectedDot} />
          Google Calendar conectado correctamente
        </div>
      ) : (
        <>
          <button
            className={styles.btnPrimary}
            onClick={() => connectCalendar()}
            disabled={connecting}
            style={{ marginBottom: '12px' }}
          >
            {connecting ? 'Conectando...' : 'Conectar con Google'}
          </button>
          {error && <div className={styles.error}>{error}</div>}
        </>
      )}

      <div className={styles.actions}>
        <button className={styles.btnSkip} onClick={onSkip}>Saltar por ahora</button>
        <button className={styles.btnSecondary} onClick={onBack}>Anterior</button>
        <button className={styles.btnPrimary} onClick={onNext} disabled={!connected && !done}>
          Siguiente
        </button>
      </div>
    </>
  );
}
