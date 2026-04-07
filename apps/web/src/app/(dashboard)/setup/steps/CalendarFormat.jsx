'use client';

import { useState } from 'react';
import { api } from '../../../../lib/api';
import styles from '../setup.module.css';

const EXAMPLES = [
  { title: 'Maria García - Corte de pelo', desc: '[+5491112345678]' },
  { title: 'Juan Pérez - Consulta', desc: '[+5491145678901]\nDNI: 30123456' },
  { title: 'Ana López - Limpieza dental', desc: '[+5491187654321]' },
];

export default function CalendarFormat({ onNext, onBack, onSkip }) {
  const [saving, setSaving] = useState(false);

  async function handleNext() {
    setSaving(true);
    try {
      await api.put('/settings/onboarding', { step: 3 });
    } catch { /* continuar igual */ }
    finally { setSaving(false); }
    onNext();
  }

  return (
    <>
      <div className={styles.stepIcon}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <h2 className={styles.stepTitle}>Formato de eventos</h2>
      <p className={styles.stepDesc}>
        Para que AutoAgenda pueda enviarle el recordatorio al cliente, el evento de Google Calendar tiene que tener este formato específico.
      </p>

      <div className={styles.calMockup}>
        <div className={styles.calField}>
          <div className={styles.calFieldLabel}>Título del evento</div>
          <div className={`${styles.calFieldValue} ${styles.highlight}`}>
            Maria García - Corte de pelo
          </div>
          <div className={styles.calHighlightLabel}>Nombre del cliente + guión + nombre del servicio</div>
        </div>
        <div className={styles.calField}>
          <div className={styles.calFieldLabel}>Descripción</div>
          <div className={`${styles.calFieldValue} ${styles.highlight}`}>
            [+5491112345678]
          </div>
          <div className={styles.calHighlightLabel}>Teléfono entre corchetes [ ]</div>
        </div>
      </div>

      <div className={styles.tip}>
        <div className={styles.tipIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div className={styles.tipText}>
          El teléfono tiene que estar en formato internacional con el código de país: <strong>+54911...</strong> para Argentina, <strong>+5699...</strong> para Chile, etc. También podés agregar otros datos en la descripción (DNI, email) debajo del teléfono.
        </div>
      </div>

      <div className={styles.calExamples}>
        {EXAMPLES.map((ex, i) => (
          <div key={i} className={styles.calExample}>
            <div className={styles.calExampleNum}>{i + 1}</div>
            <div>
              <div className={styles.calExampleText}><strong>{ex.title}</strong></div>
              <div className={styles.calExampleSub}>{ex.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSkip} onClick={onSkip}>Saltar por ahora</button>
        <button className={styles.btnSecondary} onClick={onBack}>Anterior</button>
        <button className={styles.btnPrimary} onClick={handleNext} disabled={saving}>
          Entendido, siguiente
        </button>
      </div>
    </>
  );
}
