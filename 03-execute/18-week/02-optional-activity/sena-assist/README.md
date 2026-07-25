# SENA Assist — Control de asistencia mediante QR

MVP funcional: backend Node.js/Express + MySQL, frontend HTML/CSS/JS plano, asistencia en tiempo real con Socket.io.

## 1. Estructura del proyecto

```
sena-assist/
├── database/
│   ├── schema.sql        # Modelo de datos completo y normalizado
│   └── seed.sql           # Datos de prueba
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/   # auth, instructor, sesión QR, asistencia, admin
│   │   ├── middleware/auth.js
│   │   ├── routes/
│   │   ├── sockets/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/               # HTML/CSS/JS plano (sin build)
│   ├── index.html           # Login
│   ├── instructor-dashboard.html
│   ├── qr-session.html       # Generación de QR + asistencia en vivo
│   ├── instructor-historial.html
│   ├── scan.html              # Página que abre el aprendiz al escanear
│   ├── admin.html             # Panel administrativo (CRUD)
│   └── js/ css/
└── docs/
    └── documentacion.md   # Documentación funcional y técnica
```

## 2. Requisitos previos

- Node.js 18 o superior
- MySQL 8.0 o superior
- Un navegador moderno (no requiere instalación en el frontend)

## 3. Instalación de la base de datos

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Esto crea la base `sena_assist` con todas las tablas y datos de prueba.
**Usuarios de prueba (contraseña `123456` para todos):**

| Rol          | Correo                              |
|--------------|--------------------------------------|
| Administrador| admin@sena.edu.co                    |
| Instructor   | carlos.ramirez@sena.edu.co           |
| Instructor   | ana.gomez@sena.edu.co                |
| Aprendiz (doc.)| 1000000004, 1000000005, 1000000006 |

## 4. Backend

```bash
cd backend
cp .env.example .env      # edita DB_USER, DB_PASSWORD, etc.
npm install
npm run dev                # o: npm start
```

El servidor queda escuchando en `http://localhost:4000`. Verifica con:
`GET http://localhost:4000/api/health`

## 5. Frontend

No requiere build. Solo sirve la carpeta `frontend/` con cualquier servidor estático, por ejemplo:

```bash
cd frontend
npx serve -l 5500 .
# o la extensión "Live Server" de VS Code
```

Abre `http://localhost:5500/index.html`.

> Importante: `frontend/js/api.js` tiene `API_BASE = 'http://localhost:4000/api'`.
> Si cambias el puerto del backend, actualiza esa constante (y `FRONTEND_URL`/CORS en `.env`).

## 6. Flujo de prueba sugerido

1. Inicia sesión como instructor (`carlos.ramirez@sena.edu.co` / `123456`).
2. Entra a una clase → abre una sesión → se genera el QR automáticamente.
3. Abre `scan.html?token=...` (o escanea el QR con el celular) en otra pestaña/dispositivo e ingresa un número de documento de aprendiz de esa ficha (ej. `1000000004`).
4. Verás la fila del aprendiz actualizarse en tiempo real en `qr-session.html`, sin recargar.
5. Cierra la asistencia y revisa el resultado en "Historial".
6. Inicia sesión como administrador (`admin@sena.edu.co`) para gestionar instructores, aprendices, programas, fichas, ambientes, clases y horarios.

## 7. Alcance de este MVP y próximos pasos

Este MVP prioriza el flujo funcional principal (login, QR, asistencia en tiempo real, CRUD administrativo). Quedan como siguientes iteraciones, ya contempladas en el modelo de datos:

- Exportación de reportes a PDF/Excel (hoy los datos ya están disponibles vía API; falta la capa de exportación).
- Registro fotográfico del aprendiz al momento de la asistencia.
- Autenticación institucional (SSO) del SENA.
- App móvil nativa o PWA con escáner de cámara integrado (hoy el aprendiz abre el enlace del QR y confirma su documento).
- Formulario dedicado para observaciones y justificación de ausencias desde el panel del instructor.

Ver `docs/documentacion.md` para el detalle funcional (requerimientos, reglas de negocio, casos de uso, arquitectura) y `database/schema.sql` para el modelo entidad-relación y diccionario de datos.
