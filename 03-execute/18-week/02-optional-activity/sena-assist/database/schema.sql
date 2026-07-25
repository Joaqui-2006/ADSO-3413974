-- =====================================================================
-- SENA ASSIST - Sistema Institucional de Control de Asistencia por QR
-- Script de creación de base de datos (MySQL 8.0+)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS sena_assist
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sena_assist;

-- ---------------------------------------------------------------------
-- ROLES
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL UNIQUE,        -- Administrador, Instructor, Aprendiz
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- USUARIOS (tabla de autenticación, base de instructores/aprendices/admin)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  tipo_documento ENUM('CC','TI','CE','PA') NOT NULL DEFAULT 'CC',
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  foto_url VARCHAR(255) DEFAULT NULL,
  id_rol INT NOT NULL,
  estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- INSTRUCTORES (extiende usuarios)
-- ---------------------------------------------------------------------
CREATE TABLE instructores (
  id_instructor INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  especialidad VARCHAR(150),
  telefono VARCHAR(20),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PROGRAMAS DE FORMACIÓN
-- ---------------------------------------------------------------------
CREATE TABLE programas (
  id_programa INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  nivel ENUM('Tecnólogo','Técnico','Complementaria','Especialización') NOT NULL,
  duracion_meses INT,
  estado ENUM('activo','inactivo') DEFAULT 'activo'
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- FICHAS
-- ---------------------------------------------------------------------
CREATE TABLE fichas (
  id_ficha INT AUTO_INCREMENT PRIMARY KEY,
  numero_ficha VARCHAR(20) NOT NULL UNIQUE,
  id_programa INT NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  jornada ENUM('Mañana','Tarde','Noche','Mixta','Fin de semana') NOT NULL,
  estado ENUM('activa','finalizada','cancelada') DEFAULT 'activa',
  FOREIGN KEY (id_programa) REFERENCES programas(id_programa)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- APRENDICES (extiende usuarios)
-- ---------------------------------------------------------------------
CREATE TABLE aprendices (
  id_aprendiz INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  id_ficha INT NOT NULL,
  telefono VARCHAR(20),
  estado_formacion ENUM('en_formacion','retirado','egresado','cancelado') DEFAULT 'en_formacion',
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_ficha) REFERENCES fichas(id_ficha)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- AMBIENTES DE FORMACIÓN
-- ---------------------------------------------------------------------
CREATE TABLE ambientes (
  id_ambiente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  bloque VARCHAR(50),
  capacidad INT,
  tipo ENUM('aula','laboratorio','taller','virtual') DEFAULT 'aula',
  estado ENUM('disponible','mantenimiento','no_disponible') DEFAULT 'disponible'
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- CLASES (una clase agrupa ficha + programa + instructor + ambiente)
-- ---------------------------------------------------------------------
CREATE TABLE clases (
  id_clase INT AUTO_INCREMENT PRIMARY KEY,
  nombre_clase VARCHAR(150) NOT NULL,
  id_ficha INT NOT NULL,
  id_instructor INT NOT NULL,
  id_ambiente INT NOT NULL,
  competencia VARCHAR(150),
  estado ENUM('activa','inactiva') DEFAULT 'activa',
  FOREIGN KEY (id_ficha) REFERENCES fichas(id_ficha),
  FOREIGN KEY (id_instructor) REFERENCES instructores(id_instructor),
  FOREIGN KEY (id_ambiente) REFERENCES ambientes(id_ambiente)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- HORARIOS (sesiones programadas de una clase)
-- ---------------------------------------------------------------------
CREATE TABLE horarios (
  id_horario INT AUTO_INCREMENT PRIMARY KEY,
  id_clase INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  FOREIGN KEY (id_clase) REFERENCES clases(id_clase) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- QR_GENERADOS (una sesión de asistencia = un QR con vigencia)
-- ---------------------------------------------------------------------
CREATE TABLE qr_generados (
  id_qr INT AUTO_INCREMENT PRIMARY KEY,
  id_horario INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  generado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  expira_en DATETIME NOT NULL,
  duracion_segundos INT NOT NULL DEFAULT 900,
  estado ENUM('activo','expirado','cerrado') DEFAULT 'activo',
  FOREIGN KEY (id_horario) REFERENCES horarios(id_horario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ASISTENCIAS (registro principal por aprendiz/sesión)
-- ---------------------------------------------------------------------
CREATE TABLE asistencias (
  id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
  id_horario INT NOT NULL,
  id_aprendiz INT NOT NULL,
  id_qr INT DEFAULT NULL,
  fecha_registro DATE NOT NULL,
  hora_registro TIME NOT NULL,
  estado ENUM('presente','ausente','justificado','tarde') NOT NULL DEFAULT 'presente',
  registrado_por ENUM('qr','manual') NOT NULL DEFAULT 'qr',
  id_usuario_edito INT DEFAULT NULL,       -- instructor que editó manualmente
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unico_asistencia (id_horario, id_aprendiz),
  FOREIGN KEY (id_horario) REFERENCES horarios(id_horario) ON DELETE CASCADE,
  FOREIGN KEY (id_aprendiz) REFERENCES aprendices(id_aprendiz),
  FOREIGN KEY (id_qr) REFERENCES qr_generados(id_qr),
  FOREIGN KEY (id_usuario_edito) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- HISTORIAL_ASISTENCIAS (auditoría de cambios sobre una asistencia)
-- ---------------------------------------------------------------------
CREATE TABLE historial_asistencias (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  id_asistencia INT NOT NULL,
  estado_anterior VARCHAR(20),
  estado_nuevo VARCHAR(20),
  modificado_por INT NOT NULL,
  fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_asistencia) REFERENCES asistencias(id_asistencia) ON DELETE CASCADE,
  FOREIGN KEY (modificado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- OBSERVACIONES (notas del instructor sobre una asistencia puntual)
-- ---------------------------------------------------------------------
CREATE TABLE observaciones (
  id_observacion INT AUTO_INCREMENT PRIMARY KEY,
  id_asistencia INT NOT NULL,
  texto VARCHAR(500) NOT NULL,
  creado_por INT NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_asistencia) REFERENCES asistencias(id_asistencia) ON DELETE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ÍNDICES ADICIONALES PARA CONSULTAS FRECUENTES
-- ---------------------------------------------------------------------
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha_registro);
CREATE INDEX idx_horarios_fecha ON horarios(fecha);
CREATE INDEX idx_clases_instructor ON clases(id_instructor);
CREATE INDEX idx_aprendices_ficha ON aprendices(id_ficha);
CREATE INDEX idx_qr_token ON qr_generados(token);
