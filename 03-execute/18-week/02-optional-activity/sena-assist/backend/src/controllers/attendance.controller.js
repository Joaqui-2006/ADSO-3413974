const pool = require('../config/db');

// ---------------------------------------------------------------------
// POST /api/asistencia/escanear   { token, numero_documento }
// Endpoint público (lo llama el celular del aprendiz al escanear el QR).
// Identifica al aprendiz por su número de documento y registra asistencia.
// ---------------------------------------------------------------------
async function escanearQR(req, res) {
  try {
    const { token, numero_documento } = req.body;
    if (!token || !numero_documento) {
      return res.status(400).json({ mensaje: 'Token y número de documento son obligatorios' });
    }

    // 1. Validar el QR
    const [qrRows] = await pool.query(
      `SELECT q.id_qr, q.id_horario, q.expira_en, q.estado
       FROM qr_generados q WHERE q.token = ?`,
      [token]
    );
    if (qrRows.length === 0) {
      return res.status(404).json({ mensaje: 'Código QR no válido' });
    }
    const qr = qrRows[0];
    if (qr.estado !== 'activo') {
      return res.status(410).json({ mensaje: 'Este código QR ya no está activo' });
    }
    if (new Date(qr.expira_en) < new Date()) {
      await pool.query(`UPDATE qr_generados SET estado = 'expirado' WHERE id_qr = ?`, [qr.id_qr]);
      return res.status(410).json({ mensaje: 'El código QR ha expirado' });
    }

    // 2. Identificar al aprendiz y validar que pertenezca a la ficha de esa clase
    const [horarioInfo] = await pool.query(
      `SELECT h.id_horario, c.id_ficha, c.nombre_clase, c.id_clase
       FROM horarios h JOIN clases c ON c.id_clase = h.id_clase
       WHERE h.id_horario = ?`,
      [qr.id_horario]
    );
    if (horarioInfo.length === 0) return res.status(404).json({ mensaje: 'Sesión no encontrada' });
    const { id_ficha, nombre_clase } = horarioInfo[0];

    const [aprendizRows] = await pool.query(
      `SELECT ap.id_aprendiz, ap.id_ficha, u.id_usuario, u.tipo_documento,
              u.numero_documento, u.nombres, u.apellidos, u.foto_url
       FROM aprendices ap JOIN usuarios u ON u.id_usuario = ap.id_usuario
       WHERE u.numero_documento = ?`,
      [numero_documento]
    );
    if (aprendizRows.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró un aprendiz con ese número de documento' });
    }
    const aprendiz = aprendizRows[0];

    if (aprendiz.id_ficha !== id_ficha) {
      return res.status(403).json({ mensaje: 'Este aprendiz no pertenece a la ficha de esta clase' });
    }

    // 3. Registrar asistencia (evita duplicados gracias al UNIQUE (id_horario, id_aprendiz))
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toTimeString().slice(0, 8);

    const [existente] = await pool.query(
      `SELECT id_asistencia FROM asistencias WHERE id_horario = ? AND id_aprendiz = ?`,
      [qr.id_horario, aprendiz.id_aprendiz]
    );

    let idAsistencia;
    if (existente.length > 0) {
      idAsistencia = existente[0].id_asistencia;
      return res.status(200).json({
        mensaje: 'Ya habías registrado tu asistencia en esta clase',
        duplicado: true
      });
    } else {
      const [insertResult] = await pool.query(
        `INSERT INTO asistencias
           (id_horario, id_aprendiz, id_qr, fecha_registro, hora_registro, estado, registrado_por)
         VALUES (?, ?, ?, ?, ?, 'presente', 'qr')`,
        [qr.id_horario, aprendiz.id_aprendiz, qr.id_qr, fecha, hora]
      );
      idAsistencia = insertResult.insertId;
    }

    const registro = {
      id_asistencia: idAsistencia,
      id_aprendiz: aprendiz.id_aprendiz,
      tipo_documento: aprendiz.tipo_documento,
      numero_documento: aprendiz.numero_documento,
      nombres: aprendiz.nombres,
      apellidos: aprendiz.apellidos,
      foto_url: aprendiz.foto_url,
      fecha_registro: fecha,
      hora_registro: hora,
      estado: 'presente',
      nombre_clase
    };

    // 4. Emitir el evento en tiempo real a la sala del horario (instructor viendo en vivo)
    const io = req.app.get('io');
    if (io) io.to(`horario_${qr.id_horario}`).emit('nueva_asistencia', registro);

    res.status(201).json({ mensaje: '¡Asistencia registrada con éxito!', registro });
  } catch (error) {
    console.error('Error en escanearQR:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// ---------------------------------------------------------------------
// PUT /api/instructor/asistencia/:idAsistencia
// El instructor edita manualmente un registro: estado, hora, observación.
// ---------------------------------------------------------------------
async function editarAsistencia(req, res) {
  try {
    const { idAsistencia } = req.params;
    const { estado, hora_registro, observacion } = req.body;
    const idUsuario = req.usuario.id_usuario;

    const [actual] = await pool.query(
      `SELECT estado FROM asistencias WHERE id_asistencia = ?`,
      [idAsistencia]
    );
    if (actual.length === 0) return res.status(404).json({ mensaje: 'Registro no encontrado' });

    const campos = [];
    const valores = [];
    if (estado) { campos.push('estado = ?'); valores.push(estado); }
    if (hora_registro) { campos.push('hora_registro = ?'); valores.push(hora_registro); }
    campos.push('registrado_por = ?'); valores.push('manual');
    campos.push('id_usuario_edito = ?'); valores.push(idUsuario);

    valores.push(idAsistencia);
    await pool.query(`UPDATE asistencias SET ${campos.join(', ')} WHERE id_asistencia = ?`, valores);

    if (estado && estado !== actual[0].estado) {
      await pool.query(
        `INSERT INTO historial_asistencias (id_asistencia, estado_anterior, estado_nuevo, modificado_por)
         VALUES (?, ?, ?, ?)`,
        [idAsistencia, actual[0].estado, estado, idUsuario]
      );
    }

    if (observacion) {
      await pool.query(
        `INSERT INTO observaciones (id_asistencia, texto, creado_por) VALUES (?, ?, ?)`,
        [idAsistencia, observacion, idUsuario]
      );
    }

    res.json({ mensaje: 'Registro actualizado correctamente' });
  } catch (error) {
    console.error('Error en editarAsistencia:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// ---------------------------------------------------------------------
// POST /api/instructor/horarios/:idHorario/asistencia-manual  { id_aprendiz, estado }
// El instructor marca manualmente la asistencia de un aprendiz (p.ej. sin celular).
// ---------------------------------------------------------------------
async function marcarManual(req, res) {
  try {
    const { idHorario } = req.params;
    const { id_aprendiz, estado } = req.body;
    const idUsuario = req.usuario.id_usuario;
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toTimeString().slice(0, 8);

    const [existente] = await pool.query(
      `SELECT id_asistencia FROM asistencias WHERE id_horario = ? AND id_aprendiz = ?`,
      [idHorario, id_aprendiz]
    );

    if (existente.length > 0) {
      await pool.query(
        `UPDATE asistencias SET estado = ?, registrado_por = 'manual', id_usuario_edito = ? WHERE id_asistencia = ?`,
        [estado || 'presente', idUsuario, existente[0].id_asistencia]
      );
    } else {
      await pool.query(
        `INSERT INTO asistencias (id_horario, id_aprendiz, fecha_registro, hora_registro, estado, registrado_por, id_usuario_edito)
         VALUES (?, ?, ?, ?, ?, 'manual', ?)`,
        [idHorario, id_aprendiz, fecha, hora, estado || 'presente', idUsuario]
      );
    }

    const io = req.app.get('io');
    if (io) io.to(`horario_${idHorario}`).emit('asistencia_actualizada', { id_aprendiz, estado: estado || 'presente' });

    res.json({ mensaje: 'Asistencia marcada manualmente' });
  } catch (error) {
    console.error('Error en marcarManual:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { escanearQR, editarAsistencia, marcarManual };
