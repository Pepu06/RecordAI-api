'use client';

import { useState, useEffect } from 'react';
import s from './payments.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPaymentsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si ya está autenticado en sessionStorage
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    
    // Contraseña hardcodeada (después podés moverla a variable de entorno)
    const ADMIN_PASSWORD = 'autoagenda2026';
    
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      sessionStorage.setItem('admin_auth_password', password);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  }

  if (loading) {
    return (
      <div className={s.loading}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={s.loginPage}>
        <div className={s.loginCard}>
          <h1 className={s.loginTitle}>🔒 Panel de Administración</h1>
          <p className={s.loginSubtitle}>Ingresá la contraseña para continuar</p>
          
          <form onSubmit={handleLogin} className={s.loginForm}>
            <input
              type="password"
              className={s.loginInput}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <div className={s.loginError}>{error}</div>}
            <button type="submit" className={s.loginBtn}>
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Comprobantes de Pago</h1>
        <button 
          className={s.logoutBtn}
          onClick={() => {
            sessionStorage.removeItem('admin_auth');
            sessionStorage.removeItem('admin_auth_password');
            setIsAuthenticated(false);
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <AdminPaymentsList />
    </div>
  );
}

function AdminPaymentsList() {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadProofs() {
    try {
      setLoading(true);
      const adminPassword = sessionStorage.getItem('admin_auth_password') || 'autoagenda2026';
      const res = await fetch(`${API_URL}/admin/payment-proofs`, {
        headers: {
          'x-admin-password': adminPassword,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudieron cargar los comprobantes');
      }

      setProofs(Array.isArray(data?.proofs) ? data.proofs : []);
    } catch {
      setProofs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProofs();
  }, []);

  if (loading) {
    return <div className={s.emptyState}>Cargando...</div>;
  }

  if (proofs.length === 0) {
    return (
      <div className={s.emptyState}>
        <div className={s.emptyIcon}>📄</div>
        <div className={s.emptyText}>No hay comprobantes pendientes</div>
      </div>
    );
  }

  return (
    <div className={s.list}>
      {proofs.map(proof => (
        <PaymentProofCard key={proof.id} proof={proof} />
      ))}
    </div>
  );
}

function PaymentProofCard({ proof }) {
  const [processing, setProcessing] = useState(false);

  async function handleApprove() {
    setProcessing(true);
    // TODO: Llamar a API para aprobar
    // await api.post(`/admin/payment-proofs/${proof.id}/approve`)
    alert('Comprobante aprobado (TODO: implementar)');
    setProcessing(false);
  }

  async function handleReject() {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    setProcessing(true);
    // TODO: Llamar a API para rechazar
    // await api.post(`/admin/payment-proofs/${proof.id}/reject`, { reason })
    alert('Comprobante rechazado (TODO: implementar)');
    setProcessing(false);
  }

  return (
    <div className={s.card}>
      <div className={s.cardHeader}>
        <div>
          <div className={s.cardTitle}>{proof.tenantName}</div>
          <div className={s.cardMeta}>{proof.tenantEmail}</div>
        </div>
        <div className={s.cardBadge}>{proof.plan}</div>
      </div>
      
      <div className={s.cardBody}>
        <div className={s.cardRow}>
          <span className={s.cardLabel}>Monto:</span>
          <span className={s.cardValue}>{proof.amount ? `$${proof.amount} ARS` : 'A confirmar'}</span>
        </div>
        <div className={s.cardRow}>
          <span className={s.cardLabel}>Fecha:</span>
          <span className={s.cardValue}>
            {new Date(proof.createdAt).toLocaleDateString('es-AR')}
          </span>
        </div>
      </div>

      {proof.imageUrl ? (
        <img src={proof.imageUrl} alt="Comprobante" className={s.cardImage} />
      ) : (
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin imagen adjunta</div>
      )}

      {proof.webViewLink && (
        <a href={proof.webViewLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
          Ver en Google Drive →
        </a>
      )}

      <div className={s.cardActions}>
        <button 
          className={`${s.cardBtn} ${s.cardBtnApprove}`}
          onClick={handleApprove}
          disabled={processing}
        >
          ✓ Aprobar
        </button>
        <button 
          className={`${s.cardBtn} ${s.cardBtnReject}`}
          onClick={handleReject}
          disabled={processing}
        >
          ✗ Rechazar
        </button>
      </div>
    </div>
  );
}
