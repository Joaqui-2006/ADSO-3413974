const pool = require('../config/db');

// GET /api/instructor/clases -> solo las clases del instructor autenticado
async function misClases(req, res) {
  try {
    const idInstructor = req.usuario.id_instructor;
    const [rows] = await pool.query(
      `SELECT c.id_clase, c.nombre_clase, c.competencia, c.estado,
              f.numero_ficha, f.jornada, p.nombre AS programa,
              a.nombre AS ambiente
       FROM clases c
       JOIN fichas f ON f.id_ficha = c.id_ficha
       JOIN programas p ON p.id_programa = f.id_programa
       JOIN ambientes a ON a.id_ambiente = c.id_ambiente
       WHERE c.id_instructor = ? AND c.estado = 'activa'
       ORDER BY c.nombre_clase`,
      [idInstructor]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en misClases:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// GET /api/instructor/clases/:idClase/horarios
async function horariosDeClase(req, res) {
  try {
    const { idClase } = req.params;
    const idInstructor = req.usuario.id_instructor;

    // Verificar que la clase pertenece al instructor
    const [clase] = await pool.query(
      'SELECT id_clase FROM clases WHERE id_clase = ? AND id_instructor = ?',
      [idClase, idInstructor]
    );
    if (clase.length === 0) return res.status(403).json({ mensaje: 'No autorizado sobre esta clase' });

    const [rows] = await pool.query(
      `SELECT h.id_horario, h.fecha, h.hora_inicio, h.hora_fin,
              q.id_qr, q.estado AS estado_qr, q.expira_en
       FROM horarios h
       LEFT JOIN qr_generados q ON q.id_horario = h.id_horario AND q.estado = 'activo'
       WHERE h.id_clase = ?
       ORDER BY h.fecha DESC, h.hora_inicio DESC`,
      [idClase]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en horariosDeClase:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// GET /api/instructor/historial -> historial de todas las clases del instructor
async function historial(req, res) {
  try {
    const idInstructor = req.usuario.id_instructor;
    const [rows] = await pool.query(
      `SELECT h.id_horario, h.fecha, h.hora_inicio, h.hora_fin,
              c.nombre_clase, f.numero_ficha,
              COUNT(DISTINCT ap.id_aprendiz) AS total_aprendices,
              COUNT(DISTINCT CASE WHEN asi.estado = 'presente' THEN asi.id_aprendiz END) AS presentes
       FROM horarios h
       JOIN clases c ON c.id_clase = h.id_clase
       JOIN fichas f ON f.id_ficha = c.id_ficha
       LEFT JOIN aprendices ap ON ap.id_ficha = f.id_ficha
       LEFT JOIN asistencias asi ON asi.id_horario = h.id_horario AND asi.id_aprendiz = ap.id_aprendiz
       WHERE c.id_instructor = ?
       GROUP BY h.id_horario
       ORDER BY h.fecha DESC, h.hora_inicio DESC`,
      [idInstructor]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en historial:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { misClases, horariosDeClase, historial };
