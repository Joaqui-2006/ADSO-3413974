const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// POST /api/auth/login  { correo, contrasena }
async function login(req, res) {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombres, u.apellidos, u.correo, u.contrasena_hash,
              u.foto_url, u.estado, r.id_rol, r.nombre_rol,
              i.id_instructor
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       LEFT JOIN instructores i ON i.id_usuario = u.id_usuario
       WHERE u.correo = ?`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const usuario = rows[0];

    if (usuario.estado !== 'activo') {
      return res.status(403).json({ mensaje: 'Usuario inactivo. Contacta al administrador.' });
    }

    const claveValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!claveValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const payload = {
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol,
      nombre_rol: usuario.nombre_rol,
      id_instructor: usuario.id_instructor || null,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        foto_url: usuario.foto_url,
        rol: usuario.nombre_rol,
        id_instructor: usuario.id_instructor || null
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// GET /api/auth/perfil  (requiere token)
async function perfil(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.tipo_documento, u.numero_documento, u.nombres,
              u.apellidos, u.correo, u.foto_url, r.nombre_rol,
              i.especialidad, i.telefono
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       LEFT JOIN instructores i ON i.id_usuario = u.id_usuario
       WHERE u.id_usuario = ?`,
      [req.usuario.id_usuario]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error en perfil:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { login, perfil };
