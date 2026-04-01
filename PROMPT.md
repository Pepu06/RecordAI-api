Quiero construir un SaaS multi-tenant llamado RecordAI — una plataforma de 
confirmación de citas por WhatsApp, similar a Confirmafy.

## Stack definido
- Backend: Node.js + Express
- ORM: Prisma
- Base de datos: PostgreSQL (Supabase)
- Cola de trabajos: BullMQ + Redis (Upstash)
- WhatsApp API: Meta Cloud API (WhatsApp Business Platform)
- Frontend: Next.js (dashboard + autoagenda en el mismo monorepo)
- Auth: JWT + bcrypt
- Deploy target: Railway o Render

## Estructura del proyecto
Creá un monorepo con esta estructura:
/apps
  /api        → Express backend
  /web        → Next.js frontend (dashboard del negocio + página pública de autoagenda)
/packages
  /db         → Prisma schema + migrations
  /shared     → tipos TypeScript compartidos

## Esquema de base de datos (Prisma)
Modelar las siguientes entidades con multi-tenancy por tenant_id:

- Tenant (el negocio que contrata el SaaS)
  - id, name, slug (único, para la URL de autoagenda), plan, createdAt
  - whatsappPhoneNumberId, whatsappAccessToken (para Meta Cloud API)

- User (los empleados/dueños del negocio)
  - id, tenantId, email, passwordHash, role (owner | staff)

- Contact (los clientes del negocio)
  - id, tenantId, name, phone (formato E.164), notes

- Service (tipos de servicios que ofrece el negocio)
  - id, tenantId, name, durationMinutes, price

- Appointment (las citas)
  - id, tenantId, contactId, serviceId, userId (quién atiende)
  - scheduledAt, status (pending | confirmed | cancelled | completed | no_show)
  - notes, reminderSentAt, confirmationSentAt

- AvailabilityRule (disponibilidad del negocio)
  - id, tenantId, userId, dayOfWeek (0-6), startTime, endTime, isActive

- MessageLog (historial de mensajes enviados)
  - id, tenantId, appointmentId, type, direction, status, sentAt, waMessageId

## Fase 1 — lo que necesito implementado ahora

### API (Express)
1. Auth: POST /auth/register, POST /auth/login → JWT
2. Middleware de autenticación que inyecte tenantId en req
3. CRUD completo para: contacts, services, appointments
4. Endpoint de webhook para recibir mensajes de Meta WhatsApp API
   (verificación GET + recepción de mensajes POST)
5. Servicio de WhatsApp (src/services/whatsapp.ts) que exponga:
   - sendTextMessage(phone, text, tenantConfig)
   - sendInteractiveButtons(phone, body, buttons[], tenantConfig)
   - sendTemplate(phone, templateName, params[], tenantConfig)

### Workers (BullMQ)
Crear una cola appointments con estos jobs:
- sendConfirmation → al crear cita, enviar mensaje con botones "Confirmar / Cancelar"
- sendReminder → 24hs antes, enviar recordatorio
- sendFollowUp → 2hs después, si status sigue pending, reenviar confirmación

### Frontend (Next.js)
Dashboard básico con:
- Login / registro de cuenta
- Listado y creación de citas (tabla con filtro por fecha y estado)
- Gestión de contactos
- Configuración del negocio (datos + conectar WhatsApp)

## Convenciones
- TypeScript estricto en todo el proyecto
- Variables de entorno con dotenv + archivo .env.example completo
- Manejo de errores centralizado con clases custom (AppError, NotFoundError, etc.)
- Respuestas API siempre con formato { success, data, error }
- Logs con pino o winston
- ESLint + Prettier configurados

## Empezá por
1. Scaffoldear el monorepo con turborepo
2. Configurar Prisma con el schema completo
3. Implementar la API con auth y CRUD de appointments
4. Crear el servicio de WhatsApp con Meta Cloud API
5. Configurar BullMQ con los 3 workers básicos

Antes de escribir código, mostrá el árbol de archivos completo del proyecto 
para que lo apruebe.