const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const contactsRoutes = require('./routes/contacts.routes');
const servicesRoutes = require('./routes/services.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const webhookRoutes = require('./routes/webhook.routes');
const calendarRoutes = require('./routes/calendar.routes');
const confirmationRoutes = require('./routes/confirmation.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Public confirmation pages (no auth)
app.use('/', confirmationRoutes);

app.use('/auth', authRoutes);
app.use('/contacts', contactsRoutes);
app.use('/services', servicesRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/webhook', webhookRoutes);
app.use('/calendar', calendarRoutes);
app.use('/settings', settingsRoutes);

app.use(errorHandler);

module.exports = app;
