# SENA Assist
### Sistema Institucional de Control de Asistencia mediante Código QR
Documentación funcional y técnica — MVP

---

## 1. Introducción

SENA Assist es una plataforma web institucional que digitaliza el registro de asistencia de los aprendices del SENA. Reemplaza la lista física o el llamado a lista verbal por un código QR único generado por sesión de clase: el aprendiz lo escanea desde su celular, confirma su documento, y su asistencia queda registrada al instante y visible en tiempo real para el instructor.

## 2. Planteamiento del problema

La toma de asistencia manual en los centros de formación consume tiempo de la clase, es propensa a errores de digitación o de omisión, y dificulta consolidar reportes históricos y estadísticas confiables sobre inasistencia por ficha, programa o instructor. No existe hoy un mecanismo digital estandarizado, ágil y centralizado para este proceso.

## 3. Justificación

Automatizar la asistencia con QR:
- Reduce el tiempo administrativo al inicio de cada sesión.
- Elimina errores de transcripción manual.
- Centraliza la información para auditoría y reportes institucionales.
- Da trazabilidad exacta (fecha y hora) de cada registro.
- Sienta las bases para integrarse a futuro con los sistemas institucionales del SENA (autenticación, horarios, gestión de fichas).

## 4. Objetivo general

Desarrollar un sistema web que permita registrar y administrar la asistencia de los aprendices del SENA mediante códigos QR generados por sesión de clase, con visualización en tiempo real para el instructor.

## 5. Objetivos específicos

1. Permitir a los instructores generar y controlar códigos QR con tiempo de vigencia configurable.
2. Registrar la asistencia del aprendiz en el momento del escaneo, sin recarga de página.
3. Permitir edición manual de asistencia (marcar, justificar, cambiar estado, agregar observaciones).
4. Administrar el catálogo institucional: instructores, aprendices, programas, fichas, ambientes, horarios y clases.
5. Generar reportes históricos consultables por instructor, ficha, programa, ambiente o aprendiz.
6. Diseñar una base de datos normalizada y escalable a nivel institucional.

## 6. Alcance del MVP

**Incluido en esta versión:**
- Autenticación por rol (Administrador / Instructor).
- Generación y expiración de QR por sesión, con regeneración manual.
- Registro de asistencia vía escaneo (identificación por número de documento) y visualización en tiempo real (Socket.io).
- Edición manual de asistencia y marcado directo por el instructor.
- Historial de sesiones por instructor.
- Panel administrativo con CRUD de instructores, aprendices, programas, fichas, ambientes, clases y horarios.
- Modelo de base de datos completo, con tablas de auditoría (`historial_asistencias`) y observaciones.

**Fuera de esta versión (roadmap):**
- Exportación de reportes a PDF/Excel (los datos ya son consultables vía API).
- Escáner de cámara nativo (hoy se abre el enlace del QR desde el navegador del celular).
- Fotografía del aprendiz en el registro.
- Integración SSO con sistemas institucionales del SENA.

## 7. Requerimientos funcionales

| Código | Requerimiento |
|--------|----------------|
| RF-01 | El sistema debe permitir iniciar sesión con correo y contraseña, diferenciando roles. |
| RF-02 | El instructor solo debe ver las clases que tiene asignadas. |
| RF-03 | El instructor debe poder generar un código QR único por sesión, con duración configurable. |
| RF-04 | El instructor debe poder regenerar el QR en cualquier momento. |
| RF-05 | El sistema debe registrar automáticamente la asistencia al escanear el QR y validar la vigencia del código. |
| RF-06 | El sistema debe evitar registros duplicados de un mismo aprendiz en la misma sesión. |
| RF-07 | El instructor debe visualizar la asistencia en tiempo real, sin recargar la página. |
| RF-08 | El instructor debe poder marcar asistencia manualmente, cambiar el estado y agregar observaciones. |
| RF-09 | El instructor debe poder cerrar la asistencia de una sesión, cerrando el QR asociado. |
| RF-10 | El administrador debe poder crear, editar, eliminar y buscar instructores, aprendices, programas, fichas, ambientes, clases y horarios. |
| RF-11 | El sistema debe permitir consultar el historial de sesiones con el porcentaje de asistencia. |
| RF-12 | El sistema debe registrar auditoría de cambios de estado en cada asistencia. |

## 8. Requerimientos no funcionales

| Código | Requerimiento |
|--------|----------------|
| RNF-01 | La actualización de asistencia en pantalla debe ocurrir en menos de 2 segundos (vía WebSocket). |
| RNF-02 | Las contraseñas deben almacenarse cifradas (bcrypt), nunca en texto plano. |
| RNF-03 | El acceso a cada endpoint debe validarse por rol (JWT + middleware de autorización). |
| RNF-04 | El sistema debe ser escalable a múltiples centros de formación (arquitectura sin estado, base de datos relacional normalizada). |
| RNF-05 | La interfaz debe ser responsiva (uso desde celular para el escaneo del aprendiz). |
| RNF-06 | El código debe organizarse siguiendo el patrón MVC (rutas / controladores / modelos de datos). |

## 9. Reglas de negocio

1. Un aprendiz solo puede registrar asistencia si pertenece a la ficha asociada a la clase del QR escaneado.
2. Un QR deja de ser válido al expirar su tiempo de vigencia o al cerrarse manualmente (queda en estado `cerrado`/`expirado`).
3. No puede existir más de un registro de asistencia por aprendiz y por horario (`UNIQUE(id_horario, id_aprendiz)`).
4. Al regenerar un QR, el anterior de la misma sesión se invalida automáticamente.
5. Todo cambio de estado de una asistencia posterior al registro inicial queda en `historial_asistencias`.
6. Solo el instructor asignado a una clase puede generar QR, cerrar asistencia o editar registros de esa clase.
7. Solo el rol Administrador puede gestionar el catálogo institucional (usuarios, programas, fichas, ambientes, horarios, clases).

## 10. Historias de usuario

- **Como instructor**, quiero generar un QR al iniciar mi clase, para que mis aprendices registren su asistencia sin que yo pase lista manualmente.
- **Como instructor**, quiero ver en tiempo real quién ha registrado asistencia, para saber quién falta antes de terminar la sesión.
- **Como instructor**, quiero poder marcar manualmente a un aprendiz que no tiene celular a la mano, para no dejarlo como ausente injustamente.
- **Como instructor**, quiero consultar el historial de asistencia de mis clases, para tener evidencia ante una auditoría o consulta de un aprendiz.
- **Como aprendiz**, quiero escanear el QR y confirmar mi documento, para registrar mi asistencia en segundos.
- **Como administrador**, quiero gestionar instructores, fichas, programas y horarios desde un solo panel, para mantener actualizada la información institucional.

## 11. Casos de uso principales

```
CU-01  Iniciar sesión
CU-02  Generar código QR de sesión
CU-03  Registrar asistencia (aprendiz escanea QR)
CU-04  Visualizar asistencia en tiempo real
CU-05  Editar/():marcar asistencia manualmente
CU-06  Cerrar asistencia de sesión
CU-07  Consultar historial de sesiones
CU-08  Gestionar catálogo institucional (CRUD administrador)
```

### Diagrama de casos de uso (texto)
```
Instructor ──> (Generar QR)
Instructor ──> (Ver asistencia en tiempo real)
Instructor ──> (Editar asistencia)
Instructor ──> (Cerrar asistencia)
Instructor ──> (Consultar historial)
Aprendiz   ──> (Registrar asistencia vía QR)
Administrador ──> (Gestionar instructores/aprendices/programas/fichas/ambientes/clases/horarios)
```

## 12. Arquitectura del sistema

Arquitectura cliente-servidor de 3 capas, sin estado en el backend (autenticación vía JWT), con canal WebSocket para eventos en tiempo real.

```
┌─────────────────────┐        HTTPS/REST        ┌──────────────────────┐        SQL        ┌───────────────┐
│   Frontend (HTML/    │ ───────────────────────> │  Backend (Node.js /   │ ────────────────>│   MySQL 8      │
│   CSS/JS plano)       │ <─────────────────────── │  Express + JWT)        │ <────────────────│  (normalizada) │
│  - Login              │        WebSocket          │  - Auth                │                   └───────────────┘
│  - Panel instructor    │ <═══════════════════════ │  - Sesiones QR          │
│  - QR + asistencia viva│   (Socket.io, eventos     │  - Asistencia           │
│  - Panel admin         │    de nueva asistencia)   │  - Administración       │
└─────────────────────┘                            └──────────────────────┘
```

**Patrón backend:** rutas → middleware de autenticación/rol → controladores → acceso a datos (mysql2) → respuesta JSON. Los eventos de asistencia se emiten por Socket.io a la sala `horario_<id>` para que solo los clientes de esa sesión reciban la actualización.

## 13. Modelo entidad-relación y diccionario de datos

El modelo completo está en [`database/schema.sql`](../database/schema.sql). Resumen de entidades:

| Tabla | Propósito | Relaciones clave |
|-------|-----------|-------------------|
| `roles` | Catálogo de roles del sistema | 1—N con `usuarios` |
| `usuarios` | Autenticación base de todo actor (admin/instructor/aprendiz) | 1—1 con `instructores`/`aprendices` |
| `instructores` | Extiende a un usuario con rol Instructor | 1—N con `clases` |
| `aprendices` | Extiende a un usuario con rol Aprendiz | N—1 con `fichas`, 1—N con `asistencias` |
| `programas` | Programas de formación | 1—N con `fichas` |
| `fichas` | Grupos de aprendices de un programa | 1—N con `aprendices`, `clases` |
| `ambientes` | Espacios físicos/virtuales de formación | 1—N con `clases` |
| `clases` | Une ficha + instructor + ambiente | 1—N con `horarios` |
| `horarios` | Sesiones programadas de una clase | 1—N con `qr_generados`, `asistencias` |
| `qr_generados` | Un QR emitido por sesión, con vigencia | 1—N con `asistencias` |
| `asistencias` | Registro de presencia de un aprendiz en un horario | 1—N con `historial_asistencias`, `observaciones` |
| `historial_asistencias` | Auditoría de cambios de estado | N—1 con `asistencias` |
| `observaciones` | Notas del instructor sobre un registro | N—1 con `asistencias` |

El diccionario de datos detallado (columna, tipo, restricciones) corresponde 1:1 a las definiciones `CREATE TABLE` de `schema.sql`, que incluye comentarios inline para cada campo relevante.

## 14. Diagrama de secuencia — Registro de asistencia vía QR

```
Aprendiz          Frontend(scan.html)        API (/asistencia/escanear)        MySQL          Socket.io          Instructor(qr-session.html)
   │  escanea QR         │                            │                          │                 │                       │
   │────────────────────>│                            │                          │                 │                       │
   │  ingresa documento   │                            │                          │                 │                       │
   │────────────────────>│  POST {token, documento}    │                          │                 │                       │
   │                      │───────────────────────────>│  valida QR + aprendiz    │                 │                       │
   │                      │                            │─────────────────────────>│                 │                       │
   │                      │                            │  INSERT asistencia       │                 │                       │
   │                      │                            │<─────────────────────────│                 │                       │
   │                      │                            │  emit nueva_asistencia   │                 │                       │
   │                      │                            │─────────────────────────────────────────────>│                     │
   │                      │  200 OK "registrado"        │                          │                 │  push evento          │
   │                      │<───────────────────────────│                          │                 │─────────────────────>│
   │  ve confirmación     │                            │                          │                 │  actualiza tabla       │
   │<─────────────────────│                            │                          │                 │  sin recargar          │
```

## 15. Diseño de interfaces (mockups)

Las interfaces reales están implementadas en `frontend/` (HTML/CSS funcional, no solo mockup estático):

- `index.html` — Login institucional.
- `instructor-dashboard.html` — Clases asignadas al instructor.
- `qr-session.html` — Generación de QR + tabla de asistencia en tiempo real.
- `scan.html` — Pantalla que abre el aprendiz al escanear.
- `instructor-historial.html` — Historial de sesiones.
- `admin.html` — Panel administrativo con CRUD de todas las entidades.

Paleta institucional: verde SENA (`#39A900`) como color primario, carbón (`#1C2321`) como texto, tipografía Space Grotesk (títulos) + Inter (texto).

## 16. Flujo del sistema (resumen operativo)

1. Instructor inicia sesión → ve solo sus clases.
2. Selecciona clase → selecciona horario/sesión → genera QR.
3. Aprendices escanean → confirman documento → asistencia queda registrada.
4. Instructor ve la lista actualizarse en vivo (nombre, documento, hora, estado).
5. Instructor puede marcar manualmente, editar o justificar registros.
6. Instructor cierra la asistencia → el QR se invalida → los datos quedan disponibles en el historial.

## 17. Plan de pruebas (resumen)

| Caso de prueba | Resultado esperado |
|----------------|----------------------|
| Login con credenciales inválidas | Rechaza con mensaje de error, sin exponer cuál campo falló |
| Escaneo con QR expirado | Respuesta 410, no registra asistencia |
| Escaneo duplicado del mismo aprendiz | No crea segundo registro, informa que ya estaba registrado |
| Aprendiz de otra ficha escanea el QR | Rechaza con 403 |
| Instructor intenta ver clase que no le pertenece | Rechaza con 403 |
| Cierre de asistencia | El QR pasa a estado `cerrado` y deja de aceptar escaneos |
| Edición manual de estado | Se registra en `historial_asistencias` |
| Creación de usuario duplicado (documento/correo existente) | La base de datos rechaza por restricción `UNIQUE` |

## 18. Manual técnico (resumen)

- **Backend:** Node.js + Express, patrón rutas/controladores, autenticación JWT (`middleware/auth.js`), acceso a datos con `mysql2/promise` (pool de conexiones), tiempo real con `socket.io`.
- **Frontend:** HTML/CSS/JS sin frameworks ni build, un archivo `js/api.js` centraliza las llamadas HTTP y el manejo de sesión en `localStorage`.
- **Base de datos:** MySQL 8, InnoDB, claves foráneas con integridad referencial, índices sobre columnas de consulta frecuente (`fecha_registro`, `fecha`, `token`, etc.).
- **Variables de entorno:** ver `backend/.env.example`.
- Instrucciones completas de instalación y ejecución: ver `README.md` en la raíz del proyecto.

## 19. Manual de usuario (resumen)

**Instructor:** inicia sesión → elige clase → abre sesión → comparte el QR proyectándolo o compartiendo el enlace → observa la lista en vivo → puede marcar manualmente a quien no pueda escanear → cierra la asistencia al finalizar.

**Aprendiz:** escanea el QR con la cámara del celular → se abre una página en el navegador → escribe su número de documento → confirma → ve el mensaje de asistencia registrada.

**Administrador:** inicia sesión → selecciona la entidad a gestionar en el menú lateral (instructores, aprendices, programas, fichas, ambientes, clases, horarios) → crea, edita, busca o elimina registros.

## 20. Conclusiones

SENA Assist demuestra, con una base de datos normalizada y una arquitectura desacoplada (API REST + WebSocket), que es viable reemplazar la asistencia manual por un flujo QR de extremo a extremo: generación de sesión, escaneo, verificación de identidad, actualización en vivo y consolidación histórica. El diseño modular (rutas → controladores → base de datos) y el modelo relacional con tablas de auditoría permiten escalar el sistema a múltiples centros de formación del SENA, e integrarlo a futuro con sistemas institucionales de autenticación y gestión académica sin rediseñar el núcleo de asistencia.
