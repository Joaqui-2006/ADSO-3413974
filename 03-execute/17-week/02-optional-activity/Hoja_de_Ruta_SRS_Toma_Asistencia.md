# Hoja de Ruta del Proyecto
## Sistema de Toma de Asistencia

La hoja de ruta se organiza en siete fases secuenciales, alineadas con el ciclo de vida del desarrollo de software, permitiendo un control ordenado del proyecto desde su concepción hasta su sostenimiento en el tiempo.

---

### Fase 1: Análisis

**Objetivo**: comprender a profundidad la problemática actual y el contexto en el que operará el sistema.

**Actividades:**

- Reconocimiento del proceso actual de toma de asistencia (proceso "as-is").
- Identificación de los actores involucrados (aprendices, instructores, coordinadores, administrativos).
- Análisis de las causas y efectos del problema mediante herramientas como árbol de problemas o diagrama de Ishikawa.
- Estudio de antecedentes y soluciones similares existentes en el mercado o en otras instituciones.
- Definición preliminar del alcance y los objetivos generales y específicos del proyecto.
- Identificación de restricciones tecnológicas, normativas y presupuestales.

**Entregable:** Documento de análisis de la situación problema y objetivos del proyecto.

---

### Fase 2: Levantamiento de Requerimientos

**Objetivo**: identificar y documentar de manera formal lo que el sistema debe hacer y las condiciones bajo las cuales debe operar.

**Actividades:**

- Aplicación de técnicas de recolección de información: entrevistas, encuestas y observación directa a instructores y aprendices.
- Identificación de requerimientos funcionales (registro de asistencia, generación de reportes, gestión de usuarios, notificaciones, etc.).
- Identificación de requerimientos no funcionales (seguridad, disponibilidad, usabilidad, escalabilidad, tiempos de respuesta).
- Elaboración de historias de usuario o casos de uso.
- Priorización de requerimientos según criticidad e impacto.
- Validación y aprobación de los requerimientos con los interesados (stakeholders).
- Elaboración del documento formal de especificación de requerimientos (SRS).

**Entregable:** Documento SRS con requerimientos funcionales y no funcionales validados.

---

### Fase 3: Diseño

**Objetivo**: definir la arquitectura, estructura y apariencia del sistema con base en los requerimientos definidos.

**Actividades:**

- Diseño de la arquitectura del sistema (modelo cliente-servidor, API REST, arquitectura por capas).
- Modelado de la base de datos: diagrama entidad-relación (usuarios, roles, fichas, grupos, sesiones, registros de asistencia).
- Elaboración de diagramas UML (casos de uso, diagrama de clases, diagramas de secuencia).
- Diseño de la experiencia de usuario (UX): flujos de navegación para cada tipo de usuario.
- Diseño de interfaz gráfica (UI): wireframes y prototipos navegables.
- Definición del mecanismo de marcación de asistencia (QR dinámico, biometría, geolocalización, o combinación de estos).
- Validación de los prototipos de diseño con los usuarios finales antes de iniciar el desarrollo.

**Entregable:** Documento de diseño técnico, diagramas UML, modelo de base de datos y prototipos de interfaz.

---

### Fase 4: Desarrollo

**Objetivo**: construir el sistema de información conforme al diseño previamente validado.

**Actividades:**

- Configuración del entorno de desarrollo y del repositorio de control de versiones.
- Desarrollo del backend: lógica de negocio, autenticación, gestión de roles y servicios de la API.
- Desarrollo del frontend: interfaces de usuario web y/o móvil.
- Implementación del módulo de registro de asistencia según el mecanismo definido.
- Desarrollo del módulo de reportes, estadísticas y exportación de información.
- Implementación del módulo de notificaciones y alertas automáticas.
- Integración de los distintos módulos del sistema.
- Revisión periódica de código (control de calidad interno) durante el proceso de desarrollo.

**Entregable:** Aplicación funcional en ambiente de desarrollo, con los módulos definidos en el SRS implementados.

---

### Fase 5: Pruebas

**Objetivo**: verificar y validar que el sistema cumple con los requerimientos funcionales y no funcionales establecidos.

**Actividades:**

- Diseño de casos de prueba a partir de los requerimientos documentados en el SRS.
- Ejecución de pruebas unitarias sobre los componentes individuales del sistema.
- Ejecución de pruebas de integración entre los distintos módulos.
- Ejecución de pruebas funcionales para verificar el cumplimiento de los requerimientos.
- Pruebas de usabilidad con usuarios reales (instructores y aprendices).
- Pruebas de seguridad, orientadas a la protección de datos personales y prevención de accesos no autorizados.
- Pruebas de carga y estrés, para validar el comportamiento del sistema con múltiples usuarios simultáneos.
- Registro, corrección y reprueba de errores (bugs) detectados.

**Entregable:** Informe de pruebas y sistema validado, listo para su paso a producción.

---

### Fase 6: Implementación

**Objetivo**: poner en funcionamiento el sistema en el entorno real de operación.

**Actividades:**

- Preparación del entorno de producción (servidor, hosting o infraestructura en la nube).
- Migración o carga inicial de datos (usuarios, fichas, grupos, horarios).
- Despliegue oficial del sistema en el entorno de producción.
- Capacitación a los usuarios finales sobre el uso del sistema (instructores, coordinadores, aprendices).
- Elaboración de manuales de usuario y material de apoyo.
- Acompañamiento durante el periodo inicial de uso (puesta en marcha asistida), para resolver dudas o incidencias tempranas.

**Entregable:** Sistema en funcionamiento en el entorno de producción y usuarios capacitados en su uso.

---

### Fase 7: Mantenimiento

**Objetivo**: garantizar el correcto funcionamiento del sistema a lo largo del tiempo y su mejora continua.

**Actividades:**

- Monitoreo continuo del rendimiento, disponibilidad y estabilidad del sistema.
- Atención y resolución de incidencias reportadas por los usuarios (soporte técnico).
- Aplicación de actualizaciones y parches de seguridad de forma periódica.
- Ejecución de copias de seguridad (backups) regulares de la información almacenada.
- Recolección de retroalimentación de los usuarios para identificar oportunidades de mejora.
- Planificación de nuevas funcionalidades o versiones futuras del sistema (mantenimiento evolutivo).

**Entregable:** Plan de mantenimiento y mejora continua del sistema.


