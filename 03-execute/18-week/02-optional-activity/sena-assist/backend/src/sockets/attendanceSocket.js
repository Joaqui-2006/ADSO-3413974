// Maneja las conexiones de Socket.io.
// El instructor, al abrir la pantalla de "asistencia en tiempo real",
// se une a la sala "horario_<idHorario>" para recibir los eventos que
// el controlador de asistencia emite cuando un aprendiz escanea el QR.
function configurarSockets(io) {
  io.on('connection', (socket) => {
    socket.on('unirse_sesion', (idHorario) => {
      socket.join(`horario_${idHorario}`);
    });

    socket.on('salir_sesion', (idHorario) => {
      socket.leave(`horario_${idHorario}`);
    });

    socket.on('disconnect', () => {
      // limpieza automática de socket.io, no se requiere acción manual
    });
  });
}

module.exports = configurarSockets;
