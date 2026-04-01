# Documentación Técnica de Funcionalidades: RecordAI

## 1. Configuración General del Calendario
Este módulo define la identidad y el comportamiento base del motor de citas para cada negocio.

* **Nombre del Calendario:** Identificador interno para el usuario (ej. "Calendario RecordAI").
* **Nombre del Negocio/Servicio:** Nombre público que se inserta automáticamente en las plantillas de mensaje enviadas a los clientes.
* **Número de WhatsApp de Contacto:** El número al que los clientes pueden escribir si tienen dudas. Incluye validación de prefijo por país (ej. 🇦🇷 +54).
* **Localización y Formato:**
    * **Formato de hora:** Selección entre sistema de 12 horas (AM/PM) o 24 horas.
    * **Zona Horaria:** Configuración crítica (ej. Buenos Aires GMT-3) que determina el momento exacto del disparo de los recordatorios.
* **Estado del Motor:** Interruptor maestro (`Enviando mensajes / Pausado`) que permite detener globalmente la salida de notificaciones de este calendario.

---

## 2. Motor de Mensajería y Automatización
Define la lógica de comunicación y las reglas de confirmación.

### A. Lógica de Disparo (Trigger)
* **Tipo de Mensaje:** * *Confirmación de asistencia:* Envía botones interactivos (Sí/No) para que el sistema procese la respuesta.
    * *Solo recordatorio:* Notificación unidireccional sin opción de respuesta automatizada.
* **Tiempo de Envío:** Parámetro programable (ej. 24 horas antes de la cita) que el worker utiliza para encolar los mensajes en la base de datos. O tambien la opcion de mandar todos los mensajes al mismo horario (Ejemplo: Los mensajes de las citas del martes se enviarán todos a la misma hora el lunes) y la eleccion de ese horario.

### B. Personalización de Plantillas
* **Editor de Mensajes:** Soporta variables dinámicas como `{{nombre_cliente}}`, `{{fecha}}` y `{{hora}}`.
* **Previsualización Interactiva:** Emulador de la interfaz de WhatsApp que muestra el renderizado final del mensaje, incluyendo los botones de acción.
* **Lógica de Respuesta Condicional:**
    * `Si confirma`: El sistema envía un mensaje automático de agradecimiento.
    * `Si cancela`: El sistema confirma la cancelación y envia la tarjeta de contacto del profesional.

---

## 3. Gestión de Agenda y Tipos de Evento
La interfaz de creación de citas maneja tres categorías con comportamientos distintos:

1.  **Cita con Cliente:** Vincula un contacto a un horario y **activa** el flujo de mensajería programado.
2.  **Evento Personal:** Bloquea el tiempo en el calendario del usuario pero **no** dispara mensajes externos.
3.  **Bloqueo de Horario:** Funcionalidad para la "Autoagenda" que impide que clientes externos reserven en esos espacios.

---

## 4. Bot (Notificaciones para el Administrador)
Es el centro de control interno para que el dueño del negocio esté al tanto de su agenda.

* **Canal de Recepción:** Vinculación de un número de WhatsApp administrativo.
* **Reporte Diario:** Envío automatizado de un resumen de todas las citas del día a una hora específica configurable (ej. 08:00 AM).
* **Alertas en Tiempo Real:** Notificaciones push vía WhatsApp cuando:
    * Se agenda una nueva cita.
    * Un cliente confirma su asistencia.
    * Un cliente cancela la cita.

---

## 5. Autoagenda (Portal de Cliente)
Interfaz pública donde el cliente final gestiona su propia reserva.

* **Selector de Disponibilidad:** Calendario basado en los "horarios de atención" configurados y los bloqueos manuales.
* **Timezone Management:** Opción para que el sistema ajuste las horas automáticamente según la ubicación geográfica del cliente (usando el código de país de su teléfono).

---

## 6. Analítica, Reportes y Suscripción
* **Dashboard de KPIs:** * Mensajes totales enviados.
    * Tasa de confirmación vs. cancelación.
    * Mensajes no entregados (errores de API/WhatsApp).
* **Gráfico Temporal:** Visualización de la actividad de citas por día para identificar picos de demanda.
* **Gestión de Plan (Trial):** Control de límites basado en días de prueba restantes o cantidad de confirmaciones exitosas procesadas.

---

## 7. Diseño
* Quiero implementar cambios en el diseño actual, te dejo una imagen para que puedas ver inspiracion (te dejo el nombre del archivo de la foto): DISENO_RECORDAI.webp
