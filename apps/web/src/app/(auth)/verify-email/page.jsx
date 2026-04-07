'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import styles from '../auth.module.css';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Enlace inválido. Revisá el link en tu email o solicitá uno nuevo.');
      return;
    }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error');
        setMessage(err.message || 'El enlace expiró o ya fue utilizado.');
      });
  }, [token]);

  return (
    <div className={styles.container}>
      <div className={styles.decorPanel}>
        <div className={styles.decorContent}>
          <div className={styles.decorBrand}>
            <img src="/logo_autoagenda.png" alt="AutoAgenda" className={styles.decorMark} />
            <span className={styles.decorBrandName}>AutoAgenda</span>
          </div>
          <h1 className={styles.decorHeading}>
            Verificación<br />
            <span className={styles.decorHeadingAccent}>de email.</span>
          </h1>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.mobileBrand}>
            <img src="/logo_autoagenda.png" alt="AutoAgenda" className={styles.mobileMark} />
            <span className={styles.mobileBrandName}>AutoAgenda</span>
          </div>

          {status === 'loading' && (
            <>
              <h2 className={styles.title}>Verificando...</h2>
              <p className={styles.subtitle}>Estamos confirmando tu email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h2 className={styles.title}>¡Email verificado!</h2>
              <p className={styles.subtitle}>Tu cuenta está confirmada. Ya podés usar AutoAgenda.</p>
              <a href="/dashboard" className={styles.button} style={{ display: 'block', textAlign: 'center', marginTop: '16px', textDecoration: 'none' }}>
                Ir al dashboard →
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <h2 className={styles.title}>Enlace inválido</h2>
              <p className={styles.error}>{message}</p>
              <a href="/dashboard" className={styles.button} style={{ display: 'block', textAlign: 'center', marginTop: '16px', textDecoration: 'none' }}>
                Ir al dashboard
              </a>
            </>
          )}

          <p className={styles.link} style={{ marginTop: '16px' }}>
            <a href="/login">← Volver al login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
