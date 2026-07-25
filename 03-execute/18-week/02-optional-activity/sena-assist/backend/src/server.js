require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth.routes');
const instructorRoutes = require('./routes/instructor.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const adminRoutes = require('./routes/admin.routes');
const configurarSockets = require('./sockets/attendanceSocket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

app.set('io', io); // permite usar req.app.get('io') dentro de los controladores

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', servicio: 'SENA Assist API', hora: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/asistencia', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

configurarSockets(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`SENA Assist API escuchando en http://localhost:${PORT}`);
});
