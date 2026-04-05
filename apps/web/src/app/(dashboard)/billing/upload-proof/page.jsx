'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import s from './upload-proof.module.css';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadProofPage() {
  const [plan, setPlan] = useState('inicial');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  async function handleFileChange(e) {
    setError('');
    setOk(false);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('Subí una imagen (JPG, PNG o WEBP).');
      return;
    }

    if (selected.size > 8 * 1024 * 1024) {
      setError('La imagen supera 8MB.');
      return;
    }

    setFile(selected);
    const dataUrl = await readFileAsDataUrl(selected);
    setPreview(String(dataUrl));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setOk(false);

    if (!preview) {
      setError('Adjuntá el comprobante.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/payment-proofs', {
        plan,
        dataUrl: preview,
      });

      setOk(true);
      setFile(null);
      setPreview('');
    } catch {
      setError('No se pudo guardar el comprobante. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Subir comprobante</h1>
        <p className={s.subtitle}>Cargá el comprobante de tu transferencia para validar tu plan.</p>
      </div>

      <form className={s.card} onSubmit={handleSubmit}>
        <div className={s.row}>
          <label className={s.label}>Plan</label>
          <select className={s.input} value={plan} onChange={e => setPlan(e.target.value)}>
            <option value="inicial">Inicial</option>
            <option value="profesional">Profesional</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className={s.row}>
          <label className={s.label}>Comprobante (imagen)</label>
          <input type="file" accept="image/*" className={s.fileInput} onChange={handleFileChange} />
        </div>

        {preview && (
          <div className={s.previewWrap}>
            <img src={preview} alt="Vista previa del comprobante" className={s.preview} />
            <div className={s.previewMeta}>{file?.name || 'Comprobante'}</div>
          </div>
        )}

        {error && <div className={s.error}>{error}</div>}
        {ok && (
          <div className={s.success}>
            Comprobante enviado. Lo vamos a revisar y te avisamos por email.
          </div>
        )}

        <div className={s.actions}>
          <Link href="/upgrade" className={s.btnSecondary}>Volver a planes</Link>
          <button type="submit" className={s.btnPrimary} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar comprobante'}
          </button>
        </div>
      </form>
    </div>
  );
}
