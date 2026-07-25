const pool = require('../config/db');
const { generarTokenSesion, generarImagenQR } = require('../utils/qr');
require('dotenv').config();

// POST /api/instructor/horarios/:idHorario/qr  { duracion_segundos }
// Crea (o regenera) el QR activo para un horario/sesión de clase.
async function generarQR(req, res) {
  try {
    const { idHorario } = req.params;
    const duracion = parseInt(req.body.duracion_segundos, 10) ||
      parseInt(process.env.QR_DEFAULT_DURATION_SECONDS, 10) || 900;
    const idInstructor = req.usuario.id_instructor;

    // Verificar propiedad del horario
    const [horario] = await pool.query(
      `SELECT h.id_horario FROM horarios h
       JOIN clases c ON c.id_clase = h.id_clase
       WHERE h.id_horario = ? AND c.id_instructor = ?`,
      [idHorario, idInstructor]
    );
    if (horario.length === 0) return res.status(403).json({ mensaje: 'No autorizado sobre este horario' });

    // Cerrar cualquier QR activo previo de ese horario (regeneración)
    await pool.query(
      `UPDATE qr_generados SET estado = 'cerrado' WHERE id_horario = ? AND estado = 'activo'`,
      [idHorario]
    );

    const token = generarTokenSesion();
    const expiraEn = new Date(Date.now() + duracion * 1000);

    const [resultado] = await pool.query(
      `INSERT INTO qr_generados (id_horario, token, expira_en, duracion_segundos, estado)
       VALUES (?, ?, ?, ?, 'activo')`,
      [idHorario, token, expiraEn, duracion]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    const { url, dataUrl } = await generarImagenQR(token, frontendUrl);

    res.status(201).json({
      id_qr: resultado.insertId,
      token,
      url,
      qr_imagen: dataUrl,
      expira_en: expiraEn,
      duracion_segundos: duracion
    });
  } catch (error) {
    console.error('Error en generarQR:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// PUT /api/instructor/horarios/:idHorario/cerrar
// Cierra la asistencia de la sesión: expira el QR activo.
async function cerrarAsistencia(req, res) {
  try {
    const { idHorario } = req.params;
    const idInstructor = req.usuario.id_instructor;

    const [horario] = await pool.query(
      `SELECT h.id_horario FROM horarios h
       JOIN clases c ON c.id_clase = h.id_clase
       WHERE h.id_horario = ? AND c.id_instructor = ?`,
      [idHorario, idInstructor]
    );
    if (horario.length === 0) return res.status(403).json({ mensaje: 'No autorizado sobre este horario' });

    await pool.query(
      `UPDATE qr_generados SET estado = 'cerrado' WHERE id_horario = ? AND estado = 'activo'`,
      [idHorario]
    );

    res.json({ mensaje: 'Asistencia cerrada correctamente' });
  } catch (error) {
    console.error('Error en cerrarAsistencia:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// GET /api/instructor/horarios/:idHorario/asistencia
// Lista en tiempo real (poll inicial) de quiénes han registrado asistencia,
// incluyendo a los que aún no (estado ausente por defecto).
async function listaAsistencia(req, res) {
  try {
    const { idHorario } = req.params;
    const idInstructor = req.usuario.id_instructor;

    const [horario] = await pool.query(
      `SELECT h.id_horario, h.id_clase, c.id_ficha FROM horarios h
       JOIN clases c ON c.id_clase = h.id_clase
       WHERE h.id_horario = ? AND c.id_instructor = ?`,
      [idHorario, idInstructor]
    );
    if (horario.length === 0) return res.status(403).json({ mensaje: 'No autorizado sobre este horario' });

    const idFicha = horario[0].id_ficha;

    const [rows] = await pool.query(
      `SELECT ap.id_aprendiz, u.tipo_documento, u.numero_documento,
              u.nombres, u.apellidos, u.foto_url,
              asi.id_asistencia, asi.estado, asi.hora_registro, asi.fecha_registro,
              asi.registrado_por
       FROM aprendices ap
       JOIN usuarios u ON u.id_usuario = ap.id_usuario
       LEFT JOIN asistencias asi ON asi.id_aprendiz = ap.id_aprendiz AND asi.id_horario = ?
       WHERE ap.id_ficha = ?
       ORDER BY (asi.hora_registro IS NULL), asi.hora_registro DESC, u.apellidos`,
      [idHorario, idFicha]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error en listaAsistencia:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { generarQR, cerrarAsistencia, listaAsistencia };
