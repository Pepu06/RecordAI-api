'use client';

import { useState } from 'react';
import { api } from '../../../../lib/api';
import styles from '../setup.module.css';

const DEFAULT_TEMPLATE = 'Te recordamos tu cita. Por favor confirmá o cancelá tu turno usando los botones de abajo.';

function buildPreview(template, businessName) {
  const name = businessName || 'Tu negocio';
  const fecha = 'viernes, 3 de abril de 2026';
  const hora = '10:00';
  const servicio = 'Consulta';
  const msg = template || DEFAULT_TEMPLATE;
  return `*${name}*\n\n${msg}\n\n📅 ${fecha}\n⏰ ${hora}\n💼 ${servicio}`;
}

export default function MessageTemplate({ data, onNext, onBack, onSkip }) {
  const [template, setTemplate] = useState(data?.messageTemplate || DEFAULT_TEMPLATE);
  const [businessName] = useState(data?.businessName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleNext() {
    if (!template.trim()) { setError('El mensaje no puede estar vacío.'); return; }
    setSaving(true); setError('');
    try {
      await api.put('/settings', { message_template: template.trim() });
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
          <line x1="9" y1="10" x2="15" y2="10"/>
          <line x1="9" y1="14" x2="13" y2="14"/>
        </svg>
      </div>
      <h2 className={styles.stepTitle}>Mensaje de recordatorio</h2>
      <p className={styles.stepDesc}>
        Este texto se incluye en el recordatorio que reciben tus clientes. Podés personalizarlo con el tono de tu negocio.
      </p>

      <div className={styles.field}>
        <label className={styles.label}>Mensaje personalizable</label>
        <textarea
          className={styles.textarea}
          value={template}
          onChange={e => setTemplate(e.target.value)}
          placeholder={DEFAULT_TEMPLATE}
          maxLength={300}
        />
        <span className={styles.hint}>{template.length}/300 caracteres</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Vista previa del mensaje</label>
        <div className={styles.preview}>{buildPreview(template, businessName)}</div>
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
