import Link from 'next/link';
import s from './landing.module.css';

export const metadata = {
  title: 'AutoAgenda — Confirmaciones de turnos por WhatsApp',
  description:
    'Automatizá los recordatorios de tus turnos vía WhatsApp. Sincronizá con Google Calendar y reducí las inasistencias sin esfuerzo.',
};

const steps = [
  {
    num: 1,
    title: 'Conectá tu cuenta',
    desc: 'Ingresá al dashboard, autorizá el acceso a tu Google Calendar y configurá tu número de WhatsApp. Listo en menos de 2 minutos.',
    syntax: null,
    example: null,
  },
  {
    num: 2,
    title: 'Título del evento: Nombre - Servicio',
    desc: 'El título del evento debe seguir el formato "Nombre del paciente - Servicio". AutoAgenda extrae automáticamente el nombre del paciente y el tipo de servicio.',
    syntax: [
      {
        tag: 'Título del evento',
        tagClass: 'syntaxTagBlue',
        label: 'Nombre completo, guion, nombre del servicio',
        example: (
          <>
            <span className={s.syntaxHighlight}>Micaela Sosa</span>
            {' - '}
            <span className={s.syntaxHighlight}>Consulta</span>
          </>
        ),
        tip: 'El texto antes del guion es el nombre del cliente. El texto después es el servicio (ej: Consulta, Limpieza dental, Corte y color). Si el servicio no existe, se crea automáticamente.',
      },
    ],
    example: null,
  },
  {
    num: 3,
    title: 'Descripción del evento: datos del paciente',
    desc: 'En la descripción completá los datos del paciente. El teléfono entre [ ] es obligatorio para enviar el WhatsApp. DNI, fecha de nacimiento y email son opcionales y se guardan automáticamente en el contacto.',
    syntax: null,
    example: {
      title: 'Micaela Sosa - Consulta',
      lines: [
        { label: 'Nombre:',      value: 'Micaela Sosa' },
        { label: 'Teléfono:',    value: '[1538795045]', highlight: true },
        { label: 'DNI:',         value: '36914783' },
        { label: 'Nacimiento:',  value: '21/03/1995' },
        { label: 'Mail:',        value: 'micaela@email.com' },
      ],
    },
  },
  {
    num: 4,
    title: 'El sistema trabaja por vos',
    desc: 'AutoAgenda lee el evento, extrae los datos del cliente y envía el recordatorio automáticamente por WhatsApp. El cliente confirma o cancela con un solo toque.',
    syntax: null,
    example: null,
  },
];

const benefits = [
  {
    icon: '⏱️',
    iconClass: 'benefitIconBlue',
    title: 'Ahorrá tiempo valioso',
    desc: 'Eliminá las llamadas manuales de confirmación. El sistema notifica a cada cliente de forma automática sin que tengas que intervenir.',
  },
  {
    icon: '📉',
    iconClass: 'benefitIconGreen',
    title: 'Reducí las inasistencias',
    desc: 'Los recordatorios por WhatsApp tienen tasas de apertura superiores al 90 %. Menos no-shows, más ingresos para tu negocio.',
  },
  {
    icon: '💬',
    iconClass: 'benefitIconTeal',
    title: 'Mejorá la comunicación',
    desc: 'Tus clientes reciben confirmaciones personalizadas y pueden responder directamente. Una experiencia profesional y cercana.',
  },
];

const configSections = [
  {
    icon: '🏢',
    title: 'General',
    items: [
      'Nombre del negocio (aparece en el encabezado del mensaje)',
      'Zona horaria (Buenos Aires, Santiago, Bogotá, México, Madrid…)',
      'Formato de hora: 24h o 12h AM/PM',
      'Activar o pausar el motor de mensajes',
    ],
  },
  {
    icon: '💬',
    title: 'Proveedor de WhatsApp',
    items: [
      'Meta WhatsApp Business API — número verificado, plantillas oficiales',
      'WasenderAPI — conectá cualquier número con QR, sin plantillas',
    ],
  },
  {
    icon: '✏️',
    title: 'Mensaje personalizable',
    items: [
      'Texto libre que aparece en el cuerpo del recordatorio',
      'Ideal para instrucciones: "Recordá traer tu DNI", link de Meet, etc.',
      'Vista previa del mensaje en tiempo real mientras escribís',
    ],
  },
  {
    icon: '⏰',
    title: 'Recordatorios',
    items: [
      'Momento: día anterior o mismo día del turno',
      'Hora de envío (cualquier hora del día)',
    ],
  },
  {
    icon: '🤖',
    title: 'Alertas y reporte diario (Admin)',
    items: [
      'Número/s de WhatsApp del administrador (puede ser más de uno)',
      'Alerta en tiempo real cuando un cliente cancela',
      'Reporte diario: matutino (lista del día) o vespertino (lista del día siguiente)',
      'Días de la semana en que se envía el reporte',
      'Hora de envío del reporte',
    ],
  },
  {
    icon: '📍',
    title: 'Ubicación',
    items: [
      'Dirección fija: una sola dirección para todos los turnos',
      'Desde Google Calendar: toma el campo "Lugar" de cada evento individualmente',
    ],
  },
];

export default function LandingPage() {
  return (
    <div className={s.page}>
      {/* ── Navbar ── */}
      <nav className={s.navbar}>
        <div className={s.navInner}>
          <img src="/logo_autoagenda.png" alt="AutoAgenda" className={s.navLogo} />
          <Link href="/dashboard" className={s.navCta}>
            Entrar al Dashboard <span>→</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={s.hero}>
        <div className={s.heroBg} />
        <div className={s.heroBadge}>
          <span>✦</span> Confirmaciones automáticas por WhatsApp
        </div>
        <h1 className={s.heroTitle}>
          Tus turnos confirmados,{' '}
          <span>sin llamadas ni olvidos</span>
        </h1>
        <p className={s.heroSubtitle}>
          AutoAgenda se conecta con Google Calendar y envía recordatorios automáticos por WhatsApp. Tus clientes confirman o cancelan con un solo toque.
        </p>
        <Link href="/dashboard" className={s.heroCta}>
          Entrar al Dashboard <span className={s.heroArrow}>→</span>
        </Link>
        <div className={s.heroStats}>
          <div className={s.heroStat}>
            <span className={s.heroStatNum}>+90%</span>
            <span className={s.heroStatLabel}>tasa de apertura</span>
          </div>
          <div className={s.heroStat}>
            <span className={s.heroStatNum}>2 min</span>
            <span className={s.heroStatLabel}>para configurar</span>
          </div>
          <div className={s.heroStat}>
            <span className={s.heroStatNum}>0</span>
            <span className={s.heroStatLabel}>llamadas manuales</span>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={`${s.section} ${s.howSection}`}>
        <div className={s.sectionInner}>
          <div className={s.sectionLabel}>
            <span>📋</span> Guía de uso
          </div>
          <h2 className={s.sectionTitle}>Cómo organizar tu agenda para AutoAgenda</h2>
          <p className={s.sectionSubtitle}>
            Cuatro pasos simples para automatizar tus confirmaciones de turno.
          </p>
          <div className={s.steps}>
            {steps.map((step) => (
              <div key={step.num} className={s.step}>
                <div className={s.stepLeft}>
                  <div className={s.stepNum}>{step.num}</div>
                </div>
                <div className={s.stepBody}>
                  <h3 className={s.stepTitle}>{step.title}</h3>
                  <p className={s.stepDesc}>{step.desc}</p>
                  {step.syntax && (
                    <div className={s.syntaxCards}>
                      {step.syntax.map((item) => (
                        <div key={item.tag} className={s.syntaxCard}>
                          <div className={s.syntaxCardHeader}>
                            <span className={`${s.syntaxTag} ${s[item.tagClass]}`}>
                              {item.tag}
                            </span>
                          </div>
                          <div className={s.syntaxRule}>
                            <span className={s.syntaxLabel}>{item.label}</span>
                            <div className={s.syntaxExample}>{item.example}</div>
                            <span className={s.syntaxTip}>💡 {item.tip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {step.example && (
                    <div className={s.eventPreview}>
                      <div className={s.eventPreviewHeader}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span>Evento en Google Calendar</span>
                      </div>
                      <div className={s.eventPreviewTitle}>{step.example.title}</div>
                      <div className={s.eventPreviewDesc}>
                        {step.example.lines.map((line) => (
                          <div key={line.label} className={s.eventPreviewLine}>
                            <span className={s.eventPreviewLabel}>{line.label}</span>
                            <span className={line.highlight ? s.eventPreviewValueHL : s.eventPreviewValue}>
                              {line.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className={s.section}>
        <div className={s.sectionInner}>
          <div className={s.sectionLabel}>
            <span>🚀</span> Beneficios
          </div>
          <h2 className={s.sectionTitle}>Por qué elegir AutoAgenda</h2>
          <p className={s.sectionSubtitle}>
            Diseñado para profesionales independientes y negocios que quieren optimizar su agenda sin complicaciones.
          </p>
          <div className={s.benefitsGrid}>
            {benefits.map((b) => (
              <div key={b.title} className={s.benefitCard}>
                <div className={`${s.benefitIcon} ${s[b.iconClass]}`}>
                  {b.icon}
                </div>
                <h3 className={s.benefitTitle}>{b.title}</h3>
                <p className={s.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Config reference ── */}
      <section className={`${s.section} ${s.configSection}`}>
        <div className={s.sectionInner}>
          <div className={s.sectionLabel}>
            <span>⚙️</span> Configuración
          </div>
          <h2 className={s.sectionTitle}>Todo lo que podés personalizar</h2>
          <p className={s.sectionSubtitle}>
            Desde el panel de configuración controlás cada aspecto del sistema sin tocar código.
          </p>
          <div className={s.configGrid}>
            {configSections.map((section) => (
              <div key={section.title} className={s.configCard}>
                <div className={s.configCardHeader}>
                  <span className={s.configIcon}>{section.icon}</span>
                  <h3 className={s.configTitle}>{section.title}</h3>
                </div>
                <ul className={s.configList}>
                  {section.items.map((item, i) => (
                    <li key={i} className={s.configItem}>
                      <span className={s.configDot} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={s.ctaBanner}>
        <h2 className={s.ctaBannerTitle}>
          Empezá a automatizar tu agenda hoy
        </h2>
        <p className={s.ctaBannerSub}>
          Conectá tu Google Calendar y enviá tu primer recordatorio en minutos.
        </p>
        <Link href="/dashboard" className={s.ctaBannerBtn}>
          Ir al Dashboard →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <img src="/logo_autoagenda.png" alt="AutoAgenda" className={s.footerLogoImg} />
          <div className={s.footerLinks}>
            <Link href="/privacy" className={s.footerLink}>
              Política de Privacidad
            </Link>
            <Link href="/terms" className={s.footerLink}>
              Términos del Servicio
            </Link>
            <Link href="/dashboard" className={s.footerLink}>
              Dashboard
            </Link>
          </div>
          <span className={s.footerCopy}>© 2026 AutoAgenda</span>
        </div>
      </footer>
    </div>
  );
}
