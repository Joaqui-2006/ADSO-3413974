const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifica que la petición traiga un token JWT válido
function verificarToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ mensaje: 'Token inválido o expirado' });
    }
    req.usuario = usuario; // { id_usuario, id_rol, nombre_rol, ... }
    next();
  });
}

// Restringe el acceso a ciertos roles. Uso: soloRol('Administrador', 'Instructor')
function soloRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.nombre_rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, soloRol };
