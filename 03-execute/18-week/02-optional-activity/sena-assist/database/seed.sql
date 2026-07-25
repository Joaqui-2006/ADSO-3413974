-- =====================================================================
-- SENA ASSIST - Datos de prueba (seed)
-- Contraseña para TODOS los usuarios de prueba: "123456"
-- (hash bcrypt generado con 10 rondas)
-- =====================================================================
USE sena_assist;

INSERT INTO roles (nombre_rol, descripcion) VALUES
('Administrador', 'Gestiona todo el sistema institucional'),
('Instructor', 'Gestiona clases, QR y asistencia'),
('Aprendiz', 'Registra su asistencia mediante QR');

-- Hash bcrypt de "123456"
SET @hash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8i.pJIH2VYsQK6eZTz1p1Ez3fT5Uqi';

INSERT INTO usuarios (tipo_documento, numero_documento, nombres, apellidos, correo, contrasena_hash, id_rol) VALUES
('CC', '1000000001', 'Laura', 'Martínez Admin', 'admin@sena.edu.co', @hash, 1),
('CC', '1000000002', 'Carlos', 'Ramírez', 'carlos.ramirez@sena.edu.co', @hash, 2),
('CC', '1000000003', 'Ana', 'Gómez', 'ana.gomez@sena.edu.co', @hash, 2),
('TI', '1000000004', 'Juan', 'Pérez', 'juan.perez@aprendiz.sena.edu.co', @hash, 3),
('CC', '1000000005', 'María', 'López', 'maria.lopez@aprendiz.sena.edu.co', @hash, 3),
('CC', '1000000006', 'Pedro', 'Torres', 'pedro.torres@aprendiz.sena.edu.co', @hash, 3);

INSERT INTO instructores (id_usuario, especialidad, telefono) VALUES
(2, 'Análisis y Desarrollo de Software', '3001112233'),
(3, 'Redes y Telecomunicaciones', '3004445566');

INSERT INTO programas (codigo, nombre, nivel, duracion_meses) VALUES
('ADSO-228106', 'Análisis y Desarrollo de Software', 'Tecnólogo', 24),
('RED-228107', 'Gestión de Redes de Datos', 'Tecnólogo', 22);

INSERT INTO fichas (numero_ficha, id_programa, fecha_inicio, fecha_fin, jornada) VALUES
('2758934', 1, '2026-01-15', '2027-06-30', 'Mañana'),
('2758935', 2, '2026-02-01', '2027-05-30', 'Noche');

INSERT INTO aprendices (id_usuario, id_ficha, telefono) VALUES
(4, 1, '3011234567'),
(5, 1, '3021234567'),
(6, 2, '3031234567');

INSERT INTO ambientes (nombre, bloque, capacidad, tipo) VALUES
('Sala de Sistemas 1', 'Bloque A', 30, 'laboratorio'),
('Aula 204', 'Bloque B', 40, 'aula');

INSERT INTO clases (nombre_clase, id_ficha, id_instructor, id_ambiente, competencia) VALUES
('Programación Web Backend', 1, 1, 1, 'Desarrollar componentes de software'),
('Fundamentos de Redes', 2, 2, 2, 'Configurar redes de área local');

INSERT INTO horarios (id_clase, fecha, hora_inicio, hora_fin) VALUES
(1, CURDATE(), '08:00:00', '11:00:00'),
(2, CURDATE(), '18:00:00', '21:00:00');
