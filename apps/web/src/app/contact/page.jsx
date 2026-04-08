'use client';

import styles from './contact.module.css';

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Contacto</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <h2 className={styles.cardTitle}>¿Necesitás ayuda?</h2>
          </div>
          <p className={styles.description}>
            Estamos aquí para ayudarte. Contactanos por cualquiera de estos medios:
          </p>

          <div className={styles.contactList}>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 7l-10 6L2 7"/>
                </svg>
              </div>
              <div className={styles.contactInfo}>
                <div className={styles.contactLabel}>Email</div>
                <a href="mailto:infoautoagenda@gmail.com" className={styles.contactValue}>
                  infoautoagenda@gmail.com
                </a>
              </div>
            </div>

            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div className={styles.contactInfo}>
                <div className={styles.contactLabel}>Teléfono / WhatsApp</div>
                <a href="tel:+5491140962011" className={styles.contactValue}>
                  +54 9 11 4096-2011
                </a>
              </div>
            </div>

            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <div className={styles.contactInfo}>
                <div className={styles.contactLabel}>WhatsApp Directo</div>
                <a 
                  href="https://wa.me/5491140962011?text=Hola,%20necesito%20ayuda%20con%20AutoAgenda" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.contactValue}
                >
                  Abrir chat
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className={styles.note}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span>Respondemos dentro de las 24 horas hábiles</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
            <h2 className={styles.cardTitle}>Preguntas frecuentes</h2>
          </div>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Cómo conecto Google Calendar?
              </summary>
              <div className={styles.faqAnswer}>
                Ve a <strong>Calendario</strong> y hacé clic en "Conectar Google Calendar". 
                Otorgá los permisos necesarios y tus eventos se sincronizarán automáticamente.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Los mensajes tienen costo?
              </summary>
              <div className={styles.faqAnswer}>
                Los mensajes de WhatsApp tienen costo según tu plan. Revisá la sección de 
                <strong> Facturación</strong> para ver tu consumo y límites.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Puedo personalizar los mensajes?
              </summary>
              <div className={styles.faqAnswer}>
                Sí, en <strong>Configuración</strong> podés personalizar el mensaje del recordatorio 
                y las respuestas automáticas de confirmación y cancelación.
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
