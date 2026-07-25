const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Tablas administrables desde el panel con su llave primaria.
// Se restringe a esta lista para evitar acceso a tablas arbitrarias.
const TABLAS_PERMITIDAS = {
  programas: 'id_programa',
  fichas: 'id_ficha',
  ambientes: 'id_ambiente',
  clases: 'id_clase',
  horarios: 'id_horario',
  roles: 'id_rol'
};

function validarTabla(tabla) {
  return Object.prototype.hasOwnProperty.call(TABLAS_PERMITIDAS, tabla);
}

// GET /api/admin/:tabla
async function listar(req, res) {
  const { tabla } = req.params;
  if (!validarTabla(tabla)) return res.status(400).json({ mensaje: 'Tabla no permitida' });
  try {
    const [rows] = await pool.query(`SELECT * FROM ${tabla} ORDER BY ${TABLAS_PERMITIDAS[tabla]} DESC`);
    res.json(rows);
  } catch (error) {
    console.error('Error en listar:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// POST /api/admin/:tabla
async function crear(req, res) {
  const { tabla } = req.params;
  if (!validarTabla(tabla)) return res.status(400).json({ mensaje: 'Tabla no permitida' });
  try {
    const datos = req.body;
    const columnas = Object.keys(datos);
    const valores = Object.values(datos);
    const placeholders = columnas.map(() => '?').join(', ');
    const [resultado] = await pool.query(
      `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${placeholders})`,
      valores
    );
    res.status(201).json({ mensaje: 'Registro creado', id: resultado.insertId });
  } catch (error) {
    console.error('Error en crear:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', detalle: error.sqlMessage });
  }
}

// PUT /api/admin/:tabla/:id
async function actualizar(req, res) {
  const { tabla, id } = req.params;
  if (!validarTabla(tabla)) return res.status(400).json({ mensaje: 'Tabla no permitida' });
  try {
    const datos = req.body;
    const columnas = Object.keys(datos);
    const valores = Object.values(datos);
    const set = columnas.map((c) => `${c} = ?`).join(', ');
    await pool.query(
      `UPDATE ${tabla} SET ${set} WHERE ${TABLAS_PERMITIDAS[tabla]} = ?`,
      [...valores, id]
    );
    res.json({ mensaje: 'Registro actualizado' });
  } catch (error) {
    console.error('Error en actualizar:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', detalle: error.sqlMessage });
  }
}

// DELETE /api/admin/:tabla/:id
async function eliminar(req, res) {
  const { tabla, id } = req.params;
  if (!validarTabla(tabla)) return res.status(400).json({ mensaje: 'Tabla no permitida' });
  try {
    await pool.query(`DELETE FROM ${tabla} WHERE ${TABLAS_PERMITIDAS[tabla]} = ?`, [id]);
    res.json({ mensaje: 'Registro eliminado' });
  } catch (error) {
    console.error('Error en eliminar:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar (verifica que no tenga registros relacionados)' });
  }
}

// ---------------------------------------------------------------------
// Gestión especial de USUARIOS (instructores / aprendices / admins)
// porque requiere manejar contraseña y las tablas de extensión.
// ---------------------------------------------------------------------

// GET /api/admin/usuarios?rol=Instructor
async function listarUsuarios(req, res) {
  try {
    const { rol } = req.query;
    let sql = `SELECT u.id_usuario, u.tipo_documento, u.numero_documento, u.nombres,
                      u.apellidos, u.correo, u.estado, r.nombre_rol,
                      i.id_instructor, ap.id_aprendiz, ap.id_ficha
               FROM usuarios u
               JOIN roles r ON r.id_rol = u.id_rol
               LEFT JOIN instructores i ON i.id_usuario = u.id_usuario
               LEFT JOIN aprendices ap ON ap.id_usuario = u.id_usuario`;
    const params = [];
    if (rol) {
      sql += ' WHERE r.nombre_rol = ?';
      params.push(rol);
    }
    sql += ' ORDER BY u.id_usuario DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en listarUsuarios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// POST /api/admin/usuarios
// body: { tipo_documento, numero_documento, nombres, apellidos, correo, contrasena,
//         id_rol, especialidad, telefono, id_ficha }
async function crearUsuario(req, res) {
  const conexion = await pool.getConnection();
  try {
    const {
      tipo_documento, numero_documento, nombres, apellidos, correo,
      contrasena, id_rol, especialidad, telefono, id_ficha
    } = req.body;

    if (!numero_documento || !nombres || !apellidos || !correo || !contrasena || !id_rol) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    await conexion.beginTransaction();

    const [resultado] = await conexion.query(
      `INSERT INTO usuarios (tipo_documento, numero_documento, nombres, apellidos, correo, contrasena_hash, id_rol)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tipo_documento || 'CC', numero_documento, nombres, apellidos, correo, hash, id_rol]
    );
    const idUsuario = resultado.insertId;

    const [rolRow] = await conexion.query('SELECT nombre_rol FROM roles WHERE id_rol = ?', [id_rol]);
    const nombreRol = rolRow[0] ? rolRow[0].nombre_rol : null;

    if (nombreRol === 'Instructor') {
      await conexion.query(
        `INSERT INTO instructores (id_usuario, especialidad, telefono) VALUES (?, ?, ?)`,
        [idUsuario, especialidad || null, telefono || null]
      );
    } else if (nombreRol === 'Aprendiz') {
      if (!id_ficha) throw new Error('id_ficha es obligatorio para aprendices');
      await conexion.query(
        `INSERT INTO aprendices (id_usuario, id_ficha, telefono) VALUES (?, ?, ?)`,
        [idUsuario, id_ficha, telefono || null]
      );
    }

    await conexion.commit();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', id_usuario: idUsuario });
  } catch (error) {
    await conexion.rollback();
    console.error('Error en crearUsuario:', error);
    res.status(500).json({ mensaje: 'Error al crear el usuario', detalle: error.sqlMessage || error.message });
  } finally {
    conexion.release();
  }
}

// PUT /api/admin/usuarios/:id/estado  { estado: 'activo' | 'inactivo' }
async function cambiarEstadoUsuario(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await pool.query('UPDATE usuarios SET estado = ? WHERE id_usuario = ?', [estado, id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (error) {
    console.error('Error en cambiarEstadoUsuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = {
  listar, crear, actualizar, eliminar,
  listarUsuarios, crearUsuario, cambiarEstadoUsuario
};
