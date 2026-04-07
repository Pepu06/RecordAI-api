'use client';

import { useState } from 'react';
import { api } from '../../../lib/api';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.decorPanel}>
        <div className={styles.decorContent}>
          <div className={styles.decorBrand}>
            <img src="/logo_autoagenda.png" alt="AutoAgenda" className={styles.decorMark} />
            <span className={styles.decorBrandName}>AutoAgenda</span>
          </div>
          <h1 className={styles.decorHeading}>
            Recuperá<br />
            <span className={styles.decorHeadingAccent}>tu acceso.</span>
          </h1>
          <p className={styles.decorSubtitle}>
            Te enviamos un enlace para restablecer tu contraseña.
          </p>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.mobileBrand}>
            <img src="/logo_autoagenda.png" alt="AutoAgenda" className={styles.mobileMark} />
            <span className={styles.mobileBrandName}>AutoAgenda</span>
          </div>

          <h2 className={styles.title}>Olvidé mi contraseña</h2>
          <p className={styles.subtitle}>
            Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {sent ? (
            <div style={{ padding: '20px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', color: 'var(--accent)', fontSize: '14px', lineHeight: '1.6' }}>
              Si el email existe en nuestra base, te enviamos las instrucciones. Revisá tu carpeta de spam también.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
            </form>
          )}

          <p className={styles.link}>
            <a href="/login">← Volver al inicio de sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
}
