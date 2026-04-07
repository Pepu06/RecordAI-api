'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import styles from '../auth.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError('Enlace inválido. Solicitá uno nuevo desde "Olvidé mi contraseña".');
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(err.message || 'El enlace expiró o es inválido. Solicitá uno nuevo.');
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
            Nueva<br />
            <span className={styles.decorHeadingAccent}>contraseña.</span>
          </h1>
          <p className={styles.decorSubtitle}>
            Elegí una contraseña segura para tu cuenta.
          </p>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.mobileBrand}>
            <img src="/logo_autoagenda.png" alt="AutoAgenda" className={styles.mobileMark} />
            <span className={styles.mobileBrandName}>AutoAgenda</span>
          </div>

          <h2 className={styles.title}>Restablecer contraseña</h2>
          <p className={styles.subtitle}>Ingresá tu nueva contraseña.</p>

          {success ? (
            <div style={{ padding: '20px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', color: 'var(--accent)', fontSize: '14px' }}>
              ¡Contraseña actualizada! Redirigiendo al login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Nueva contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={styles.input}
                  required
                  minLength={8}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="Repetí la contraseña"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.button} disabled={loading || !token}>
                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
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
