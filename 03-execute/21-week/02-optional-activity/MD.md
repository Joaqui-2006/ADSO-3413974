# 🔎 Auditoría detallada de mejoras
# Sistema de Gestión de Horarios — SENA

🌐 **Mockup:** https://code-sena.github.io/design-software-mockup/  
💻 **Repositorio:** https://github.com/code-sena/design-software-mockup/  
📋 **Índice del prototipo:** https://code-sena.github.io/design-software-mockup/app/index.html#/inventory

---

## 🎯 Objetivo

Este documento analiza el prototipo **elemento por elemento**, evitando propuestas demasiado generales.

Cada mejora se plantea con esta estructura:

- **📍 Ubicación:** pantalla exacta donde debe revisarse.
- **🎯 Elemento:** componente concreto de la interfaz.
- **❌ Problema:** qué puede generar dificultad.
- **🛠️ Cambio específico:** qué debería modificarse.
- **🤖 Automatización:** qué podría hacer el sistema automáticamente.
- **💡 Ejemplo:** cómo podría funcionar.
- **⭐ Prioridad:** importancia de la mejora.

> Las rutas usan la navegación real del mockup mediante `app/index.html#/...` y el rol correspondiente.

---

# 🏠 1. Dashboard del Coordinador

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/?as=coordinator

## 🎯 Elemento: tarjetas e indicadores principales

### ❌ Problema

Los indicadores de un dashboard pueden terminar mostrando información sin indicar qué acción debe realizar el coordinador.

### 🛠️ Cambio específico

Cada tarjeta debería ser **accionable**.

En lugar de:

```text
┌───────────────────┐
│  5 conflictos     │
└───────────────────┘
```

mostrar:

```text
┌────────────────────────────┐
│ ⚠️ 5 conflictos pendientes │
│                            │
│ 3 de horarios              │
│ 2 de ambientes             │
│                            │
│ [Revisar conflictos →]     │
└────────────────────────────┘
```

### 🤖 Automatización

El número debería actualizarse automáticamente a partir de la base de datos.

### ⭐ Prioridad

🔴 Alta

---

# 📊 2. Dashboard — alertas

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/?as=coordinator

## 🎯 Elemento: alertas

### ❌ Problema

No todas las alertas tienen la misma importancia.

### 🛠️ Cambio específico

Separar:

- 🔴 Críticas.
- 🟠 Importantes.
- 🟡 Informativas.

### 💡 Ejemplo

```text
🔴 2 conflictos impiden publicar el horario
🟠 3 instructores tienen sobrecarga
🟡 5 ambientes están disponibles
```

### 🤖 Automatización

Ordenar automáticamente las alertas según su impacto.

### ⭐ Prioridad

🔴 Alta

---

# 📅 3. Horarios — lista

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/horarios?as=coordinator

## 🎯 Elemento: filtros

### ❌ Problema

Cuando hay muchas fichas, instructores y ambientes, encontrar una programación concreta puede requerir demasiados filtros manuales.

### 🛠️ Cambio específico

Permitir combinar filtros:

```text
Programa: [ ADSO ▼ ]
Trimestre: [ III ▼ ]
Jornada:  [ Mañana ▼ ]
Instructor: [ Todos ▼ ]
Ambiente: [ Todos ▼ ]

[ Buscar ]
```

Además, los filtros deberían mantenerse al volver desde el detalle.

### 🤖 Automatización

Al elegir un programa, limitar automáticamente los trimestres y fichas disponibles.

### ⭐ Prioridad

🔴 Alta

---

# 📅 4. Horarios — estado de cada registro

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/horarios?as=coordinator

## 🎯 Elemento: estado del horario

### ❌ Problema

El estado no debería obligar al usuario a abrir el detalle para saber si una programación está lista.

### 🛠️ Cambio específico

Mostrar directamente:

```text
🟢 Publicado
🟡 Borrador
🟠 Con advertencias
🔴 Con conflictos
```

### 💡 Ejemplo

```text
Ficha 2557489
ADSO - Trimestre III

🟠 Con advertencias
2 instructores con disponibilidad limitada

[Ver] [Resolver]
```

### ⭐ Prioridad

🔴 Alta

---

# 📄 5. Detalle de horario

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/horarios/sch-03?as=coordinator

## 🎯 Elemento: información de la sesión

### ❌ Problema

La información importante puede estar distribuida en diferentes partes.

### 🛠️ Cambio específico

Crear una ficha resumen:

```text
┌─────────────────────────────────┐
│ SESIÓN                          │
├─────────────────────────────────┤
│ Ficha: 2557489                  │
│ Programa: ADSO                  │
│ Instructor: Juan Pérez          │
│ Ambiente: 204                   │
│ Fecha: 12/08/2026               │
│ Hora: 08:00 - 10:00             │
│ Jornada: Mañana                 │
│ Estado: 🟢 Publicado             │
└─────────────────────────────────┘
```

### ➕ Agregar

Botones directos:

- Editar.
- Reprogramar.
- Cambiar ambiente.
- Cambiar instructor.
- Ver historial.

### ⭐ Prioridad

🔴 Alta

---

# ✏️ 6. Crear / editar horario

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/horarios/nuevo?as=coordinator

## 🎯 Elemento: formulario de creación

### ❌ Problema

El coordinador puede terminar digitando información que el sistema ya conoce.

### 🛠️ Cambio específico

Convertir campos independientes en campos relacionados.

### 💡 Ejemplo

```text
FICHA
[ 2557489 - ADSO - Trimestre III ▼ ]

ACTIVIDAD
[ Programación ▼ ]

FECHA
[ 12/08/2026 ]

HORA
[ 08:00 ] → [ 10:00 ]

INSTRUCTOR
[ Seleccionar ▼ ]

AMBIENTE
[ Seleccionar ▼ ]
```

Después de elegir ficha, fecha y hora:

```text
INSTRUCTORES DISPONIBLES
🟢 Juan Pérez
🟢 María López
🔴 Carlos Gómez — ocupado

AMBIENTES DISPONIBLES
🟢 Ambiente 204
🟢 Ambiente 305
🔴 Ambiente 301 — ocupado
```

### 🤖 Automatización

Filtrar automáticamente las opciones incompatibles.

### ⭐ Prioridad

🔴 Muy alta

---

# ➕ 7. Agregar / editar sesión

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/horarios/sch-01?modal=session&as=coordinator

## 🎯 Elemento: selector de instructor y ambiente

### ❌ Problema

No tiene sentido mostrar como disponibles recursos que en realidad están ocupados.

### 🛠️ Cambio específico

Los selectores deben mostrar disponibilidad en tiempo real.

```text
Instructor

🟢 Juan Pérez
   Disponible 08:00–12:00

🔴 Carlos Gómez
   Ocupado 08:00–10:00

🟢 María López
   Disponible 08:00–10:00
```

### 🤖 Automatización

La lista debe actualizarse según:

- Fecha.
- Hora.
- Jornada.
- Ficha.
- Competencia.

### ⭐ Prioridad

🔴 Muy alta

---

# 📢 8. Confirmar publicación

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/horarios/sch-02?modal=publish&as=coordinator

## 🎯 Elemento: confirmación

### ❌ Problema

Una confirmación genérica no informa suficientemente sobre el impacto de publicar.

### 🛠️ Cambio específico

Mostrar:

```text
⚠️ Vas a publicar cambios

2 fichas afectadas
3 instructores afectados
2 ambientes afectados

Cambios:
• Ambiente 204 → 305
• Hora 08:00 → 10:00

[Cancelar]
[Publicar cambios]
```

### 🤖 Automatización

Identificar automáticamente a las personas afectadas.

### ⭐ Prioridad

🔴 Alta

---

# ⚠️ 9. Panel de conflictos

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/horarios/sch-02/conflictos?as=coordinator

## 🎯 Elemento: listado de conflictos

### ❌ Problema

Un listado de conflictos es útil, pero debe permitir actuar directamente.

### 🛠️ Cambio específico

Cada conflicto debe tener:

```text
🔴 CONFLICTO DE AMBIENTE

Ambiente: 204
Fecha: 12/08/2026
Hora: 08:00–10:00

Sesión A: Ficha 2557489
Sesión B: Ficha 2557490

[Ver conflicto]
[Buscar solución]
```

### ⭐ Prioridad

🔴 Muy alta

---

# 🔧 10. Resolver conflicto

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/horarios/sch-02/conflictos?modal=resolve&as=coordinator

## 🎯 Elemento: resolución

### ❌ Problema

El usuario no debería tener que buscar manualmente una solución.

### 🛠️ Cambio específico

Agregar:

**"Buscar alternativas automáticamente"**

### 💡 Ejemplo

```text
Conflicto:
Ambiente 204 ocupado

Alternativas encontradas:

⭐ Opción 1
Ambiente 305
08:00–10:00
Compatibilidad: 100%

Opción 2
Ambiente 201
10:00–12:00
Compatibilidad: 86%

[Usar opción 1]
[Usar opción 2]
```

### 🤖 Automatización

Calcular compatibilidad según:

- Disponibilidad.
- Capacidad.
- Equipamiento.
- Jornada.
- Instructor.
- Ficha.

### ⭐ Prioridad

🔴 Muy alta

---

# 🏢 11. Disponibilidad

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/disponibilidad?as=coordinator

## 🎯 Elemento: calendario/listado de disponibilidad

### ❌ Problema

La disponibilidad es más útil cuando puede cruzarse con fecha, hora y recurso.

### 🛠️ Cambio específico

Agregar filtros simultáneos:

```text
Fecha: 12/08/2026
Hora: 08:00–10:00
Tipo: Ambiente
Capacidad: ≥ 30
Equipos: Computadores

[Buscar]
```

### ⭐ Prioridad

🔴 Alta

---

# 🏢 12. Detalle de ambiente

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/disponibilidad/ambientes/env-01?as=coordinator

## 🎯 Elemento: información del ambiente

### 🛠️ Cambio específico

Mostrar una tarjeta completa:

```text
AMBIENTE 204

Capacidad: 30
Computadores: 30
Ubicación: Bloque 2

HOY

08:00–10:00 🔴 Ocupado
10:00–12:00 🟢 Disponible
14:00–16:00 🔴 Ocupado
```

### 🤖 Automatización

Recomendarlo automáticamente cuando coincida con los requisitos de una actividad.

### ⭐ Prioridad

🔴 Alta

---

# 🎓 13. Fichas — lista

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/fichas?as=coordinator

## 🎯 Elemento: búsqueda de fichas

### ❌ Problema

Buscar por texto libre puede generar resultados ambiguos.

### 🛠️ Cambio específico

Usar filtros relacionados:

```text
Programa
[ ADSO ▼ ]

Trimestre
[ III ▼ ]

Jornada
[ Mañana ▼ ]

Ficha
[ Seleccionar ▼ ]
```

### 🤖 Automatización

Al elegir:

`ADSO → III`

mostrar solamente las fichas de ese programa y trimestre.

### ⭐ Prioridad

🔴 Alta

---

# 📚 14. Detalle de ficha

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/fichas/fic-01?as=coordinator

## 🎯 Elemento: información de ficha

### 🛠️ Cambio específico

Crear pestañas:

```text
[Resumen]
[Aprendices]
[Instructores]
[Horario]
[Ambientes]
[Actividades]
[Historial]
```

Esto evita una página demasiado larga.

### ⭐ Prioridad

🟡 Media-alta

---

# 👨‍🏫 15. Instructor — Mi horario

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/instructor/mi-horario?as=instructor

## 🎯 Elemento: horario semanal

### 🛠️ Cambio específico

La próxima clase debe destacarse:

```text
┌────────────────────────────┐
│ 🟢 PRÓXIMA CLASE           │
│ 08:00–10:00                │
│ Ambiente 204               │
│ Ficha 2557489              │
│ Programación               │
│                            │
│ [Ver detalles]             │
└────────────────────────────┘
```

### ⭐ Prioridad

🟡 Media

---

# 📄 16. Instructor — detalle de sesión

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/instructor/mi-horario?panel=session&as=instructor

## ➕ Agregar

- Competencia.
- Resultado de aprendizaje.
- Ficha.
- Ambiente.
- Recursos.
- Observaciones.
- Actividades relacionadas.

### ⭐ Prioridad

🟡 Media

---

# 🕐 17. Instructor — disponibilidad

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/instructor/mi-disponibilidad?as=instructor

## 🎯 Elemento: disponibilidad semanal

### 🛠️ Cambio específico

Usar una cuadrícula:

```text
       L   M   X   J   V
08-10  🟢  🟢  🔴  🟢  🟢
10-12  🟢  🔴  🔴  🟢  🟢
14-16  🔴  🟢  🟢  🟢  🔴
```

### 🤖 Automatización

Cuando el instructor cambie disponibilidad, verificar si afecta sesiones existentes.

### ⭐ Prioridad

🔴 Alta

---

# ➕ 18. Crear excepción

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/instructor/mi-disponibilidad?modal=exception&as=instructor

## 🎯 Elemento: formulario

### 🛠️ Cambio específico

Agregar:

```text
Fecha
Hora inicial
Hora final
Motivo
¿Se repite?
[Guardar]
```

Antes de guardar:

```text
⚠️ Esta excepción afecta 2 sesiones.

[Ver sesiones afectadas]
[Guardar de todos modos]
[Cancelar]
```

### ⭐ Prioridad

🔴 Alta

---

# 📊 19. Seguimiento de ficha

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/instructor/seguimiento?as=instructor

## 🎯 Elemento: avance

### 🛠️ Cambio específico

Mostrar porcentaje:

```text
Programa ADSO
██████████████░░░░ 78%

Competencias:
🟢 8 completas
🟡 2 en proceso
🔴 1 pendiente
```

### 🤖 Automatización

Calcular el porcentaje automáticamente según actividades registradas.

### ⭐ Prioridad

🟡 Media

---

# 🎓 20. Aprendiz — Mi horario

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/mi-horario?as=learner

## 🎯 Elemento: próxima clase

### 🛠️ Cambio específico

Mostrar primero la siguiente actividad y después el resto del horario.

```text
PRÓXIMA CLASE

08:00–10:00
Programación

📍 Ambiente 204
👨‍🏫 Juan Pérez
🎓 Ficha 2557489

[Ver detalles]
```

### ⭐ Prioridad

🔴 Alta

---

# 🔔 21. Aprendiz — notificaciones

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/notificaciones?as=learner

## 🎯 Elemento: lista de notificaciones

### 🛠️ Cambio específico

Usar categorías:

```text
🔴 Cambio de horario
🟠 Cambio de ambiente
🟡 Recordatorio
🔵 Información
```

### 🤖 Automatización

Crear la notificación automáticamente cuando una modificación afecte la ficha.

### ⭐ Prioridad

🔴 Alta

---

# 📄 22. Aprendiz — detalle de clase

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/mi-horario/sesiones/ses-01?as=learner

## ➕ Agregar

- Instructor.
- Ambiente.
- Hora.
- Duración.
- Actividad.
- Recursos.
- Indicaciones.

### ⭐ Prioridad

🟡 Media

---

# 📊 23. Director — indicadores

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/indicadores?as=director

## 🎯 Elemento: KPI

### 🛠️ Cambio específico

Cada KPI debe poder abrir el detalle.

```text
78%
Ocupación de ambientes

[Ver ambientes →]
```

Al hacer clic:

```text
Ambiente 204 → 95%
Ambiente 305 → 90%
Ambiente 201 → 32%
```

### ⭐ Prioridad

🟡 Media

---

# 👤 24. Usuarios — lista

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/usuarios?as=director

## 🎯 Elemento: tabla

### 🛠️ Mejoras específicas

Agregar columnas:

- Nombre.
- Documento/identificador institucional.
- Rol.
- Estado.
- Último acceso.
- Acciones.

Agregar filtros:

```text
Rol [Todos]
Estado [Activo]
Buscar [________]
```

### ⭐ Prioridad

🟡 Media

---

# 👤 25. Crear / editar usuario

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/usuarios?modal=user&as=director

## 🤖 Automatización

Al seleccionar:

`Rol = Instructor`

el sistema debe asignar automáticamente los permisos correspondientes.

### ⭐ Prioridad

🔴 Alta

---

# 🔐 26. Asignar / revocar rol

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/usuarios/usr-02?modal=role&as=director

## 🛠️ Cambio específico

Antes de confirmar, mostrar:

```text
ROL ACTUAL
Instructor

NUEVO ROL
Coordinador

CAMBIARÁN ESTOS PERMISOS:
✓ Horarios
✓ Fichas
✓ Ambientes
✓ Conflictos
✓ Reportes

[Cancelar] [Confirmar]
```

### ⭐ Prioridad

🔴 Alta

---

# 📈 27. Drill-down de indicadores

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/indicadores/track-01/attendance?as=director

## 🎯 Elemento: detalle del KPI

### 🛠️ Cambio específico

No mostrar únicamente el número.

Permitir:

```text
78% ocupación
     ↓
Por centro
     ↓
Por ambiente
     ↓
Por jornada
     ↓
Por fecha
```

### ⭐ Prioridad

🟡 Media

---

# 📄 28. Documentos

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/backoffice/documentos?as=support

## 🎯 Elemento: listado

### 🛠️ Mejoras

Filtros por:

- Tipo.
- Estado.
- Fecha.
- Responsable.
- Ficha.

### ⭐ Prioridad

🟡 Media

---

# 📑 29. Plantillas

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/backoffice/documentos/plantillas?as=support

## ➕ Agregar

- Versionado.
- Vista previa.
- Duplicar.
- Restaurar versión.
- Responsable.

### ⭐ Prioridad

🟡 Media

---

# 🕵️ 30. Auditoría

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/backoffice/auditoria?as=support

## 🎯 Elemento: registros

### 🛠️ Cambio específico

Cada registro debería mostrar:

```text
Usuario: Coordinador
Fecha: 08/08/2026
Módulo: Horarios
Acción: Editar
Registro: SCH-03

ANTES
Ambiente 204

DESPUÉS
Ambiente 305
```

### 🤖 Automatización

Registrar automáticamente las operaciones importantes.

### ⭐ Prioridad

🔴 Muy alta

---

# ⚙️ 31. Parametrización

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/parametrizacion?as=director

## 🎯 Elemento: categorías

### 🛠️ Cambio específico

Separar la configuración:

```text
📚 Académico
🕐 Horarios
🏢 Ambientes
📊 Monitoreo
👥 Actores
🌎 Geografía
🔐 Roles y permisos
```

Esto evita mezclar configuraciones diferentes.

### ⭐ Prioridad

🟡 Media

---

# 📚 32. Currículo académico

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/parametrizacion/curriculo?as=director

## 🎯 Elemento: selección de programa

### 🤖 Automatización

Al elegir un programa:

```text
ADSO
 ↓
Trimestres disponibles
 ↓
Competencias
 ↓
Resultados
```

No sería necesario escribir cada dato manualmente.

### ⭐ Prioridad

🔴 Alta

---

# 🕐 33. Jornadas / franjas horarias

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/parametrizacion/jornadas?as=director

## 🎯 Elemento: franjas

### 🛠️ Cambio específico

Definir bloques reutilizables:

```text
MAÑANA
08:00–10:00
10:00–12:00

TARDE
14:00–16:00
16:00–18:00
```

### 🤖 Automatización

El generador de horarios utiliza únicamente las franjas permitidas.

### ⭐ Prioridad

🔴 Alta

---

# 🏢 34. Tipos de ambiente e inventario

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/parametrizacion/ambientes?as=director

## 🎯 Elemento: características del ambiente

### 🛠️ Cambio específico

Registrar:

- Capacidad.
- Computadores.
- Proyector.
- Tipo de ambiente.
- Ubicación.
- Estado.

### 🤖 Automatización

Utilizar estas características para filtrar ambientes automáticamente.

### ⭐ Prioridad

🔴 Alta

---

# 📊 35. Catálogos de monitoreo

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/parametrizacion/monitoreo?as=director

## 🎯 Elemento: KPI y alertas

### 🤖 Automatización

Definir reglas:

```text
SI ocupación > 90%
ENTONCES generar alerta

SI conflictos > 5
ENTONCES avisar al coordinador
```

### ⭐ Prioridad

🟡 Media

---

# 👥 36. Estados de actores

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/parametrizacion/estados?as=director

## 🎯 Elemento: estado

### 🛠️ Cambio específico

Los estados deben afectar realmente la lógica.

Ejemplo:

```text
Instructor = No disponible
        ↓
No aparece como opción
para nuevas asignaciones
```

### ⭐ Prioridad

🔴 Alta

---

# 🌎 37. Geografía institucional

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/parametrizacion/geografia?as=director

## 🛠️ Cambio específico

Relacionar:

```text
Regional
   ↓
Centro
   ↓
Sede
   ↓
Ambiente
```

### 🤖 Automatización

Al seleccionar el centro, mostrar solamente ambientes pertenecientes a ese centro.

### ⭐ Prioridad

🟡 Media

---

# 🔐 38. RBAC — roles y permisos

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/admin/parametrizacion/rbac?as=director

## 🎯 Elemento: permisos

### 🛠️ Cambio específico

Permisos por:

```text
Módulo
 ↓
Acción
 ↓
Permiso
```

Ejemplo:

```text
Coordinador

Horarios
✓ Ver
✓ Crear
✓ Editar
✓ Publicar
✓ Resolver conflictos

Usuarios
✓ Ver
✗ Eliminar
```

### ⭐ Prioridad

🔴 Muy alta

---

# 🔔 39. Panel de notificaciones

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/review/app-shell?overlay=notifications&as=coordinator

## 🛠️ Cambio específico

Cada notificación debe tener una acción.

```text
⚠️ Cambio de ambiente

Ficha 2557489
Ambiente 204 → 305

[Ver horario]
```

No solamente:

```text
Cambio realizado.
```

### ⭐ Prioridad

🔴 Alta

---

# 🌐 40. Estados globales

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/system-states?as=coordinator

## 🎯 Elemento: mensajes de sistema

### 🛠️ Cambio específico

Cada error debe explicar:

1. Qué ocurrió.
2. Por qué ocurrió.
3. Cómo solucionarlo.

### ❌ Poco útil

```text
Error 500
```

### ✅ Mejor

```text
No se pudo guardar el horario.

El ambiente 204 ya está ocupado
entre 08:00 y 10:00.

[Buscar otro ambiente]
```

### ⭐ Prioridad

🔴 Alta

---

# 🔑 41. Recuperar contraseña

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/forgot-password

## 🛠️ Cambio específico

Después de solicitar recuperación:

```text
✅ Solicitud enviada

Si el correo está registrado,
recibirás instrucciones para continuar.
```

### ⭐ Prioridad

🟡 Media

---

# 🔐 42. Nueva contraseña

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/reset-password

## ➕ Agregar

Indicador de seguridad:

```text
Contraseña
████████░░
Fuerte ✓
```

Y reglas visibles:

- Mínimo de caracteres.
- Mayúsculas/minúsculas.
- Número.
- Carácter especial.

### ⭐ Prioridad

🟡 Media

---

# 🧭 43. Navegación / App Shell

🔗 **Pantalla:**  
https://code-sena.github.io/design-software-mockup/app/index.html#/review/app-shell?as=coordinator

## 🎯 Elemento: menú lateral

### 🛠️ Cambio específico

Mostrar solamente módulos permitidos para el rol.

### Ejemplo

```text
COORDINADOR

🏠 Inicio
📅 Horarios
⚠️ Conflictos
🏢 Ambientes
🎓 Fichas
📊 Reportes
🔔 Notificaciones
```

No mostrar módulos administrativos si el usuario no tiene permisos.

### ➕ Se puede agregar

- Favoritos.
- Búsqueda global.
- Accesos recientes.
- Breadcrumbs.

### ⭐ Prioridad

🔴 Alta

---

# 📱 44. Responsive / móvil

🔗 **Ubicación:**  
https://code-sena.github.io/design-software-mockup/

📍 **Aplicación:** Todas las pantallas.

## 🎯 Elemento: tablas

### ❌ Problema

Las tablas grandes pueden ser incómodas en móvil.

### 🛠️ Cambio específico

Convertir cada fila en una tarjeta:

```text
┌──────────────────────────┐
│ Ficha 2557489            │
│ ADSO — Trimestre III     │
│ Juan Pérez               │
│ Ambiente 204             │
│ 08:00–10:00              │
│ 🟢 Publicado             │
│                          │
│ [Ver detalles]           │
└──────────────────────────┘
```

### ⭐ Prioridad

🟡 Media-alta

---

# ♿ 45. Accesibilidad

🔗 **Ubicación:**  
https://code-sena.github.io/design-software-mockup/

📍 **Aplicación:** Todas las pantallas.

## 🎯 Elementos a revisar

- Contraste.
- Foco del teclado.
- Etiquetas de campos.
- Mensajes de error.
- Tamaño de botones.
- Lectores de pantalla.

## 🛠️ Cambio específico

No depender únicamente del color:

```text
🔴 Conflicto
```

en lugar de solamente:

```text
[ROJO]
```

### ⭐ Prioridad

🟡 Media

---

# 🔐 46. Seguridad real

🔗 **Aplicación:** Todo el sistema.

## 🛠️ Se debe implementar

- Autenticación real.
- Autorización por rol.
- Validación backend.
- Protección de sesiones.
- Registro de actividad.
- Copias de seguridad.
- Control de acceso.

### ⭐ Prioridad

🔴 Muy alta

---

# 🗄️ 47. Base de datos

🔗 **Aplicación:** Todo el sistema.

## 🛠️ Información que debería estar relacionada

```text
USUARIO
   ↓
ROL
   ↓
PERMISOS

APRENDIZ
   ↓
FICHA
   ↓
HORARIO
   ↓
AMBIENTE
   ↓
INSTRUCTOR
```

### 🤖 Automatización

Cuando se modifique un dato, actualizar automáticamente los elementos relacionados.

### ⭐ Prioridad

🔴 Muy alta

---

# 🤖 48. Automatización de horarios completa

## 🎯 Objetivo

Reducir el trabajo manual del coordinador.

### Entrada

```text
Ficha: 2557489
Jornada: Mañana
Actividad: Programación
Duración: 2 horas
```

### Sistema analiza

```text
✓ Instructores
✓ Competencias
✓ Disponibilidad
✓ Ambientes
✓ Capacidad
✓ Equipos
✓ Franjas
✓ Conflictos
```

### Resultado

```text
⭐ Mejor opción

Instructor: Juan Pérez
Ambiente: 204
08:00–10:00

Compatibilidad: 98%

[Asignar]
```

### ⭐ Prioridad

🔴 Muy alta

---

# ⚠️ 49. Motor de conflictos

## Reglas recomendadas

```text
SI instructor ocupado
→ conflicto

SI ambiente ocupado
→ conflicto

SI ficha tiene otra sesión
→ conflicto

SI capacidad < aprendices
→ advertencia/error

SI ambiente no tiene equipamiento requerido
→ advertencia

SI instructor no tiene competencia requerida
→ advertencia
```

### ⭐ Prioridad

🔴 Muy alta

---

# 🔄 50. Reprogramación automática/asistida

## Ejemplo

```text
Ambiente 204 no disponible.

Sistema encuentra:

1. Ambiente 305 — mismo horario
2. Ambiente 201 — +2 horas
3. Ambiente 302 — otro día

⭐ Recomendación:
Ambiente 305
```

El coordinador decide.

### ⭐ Prioridad

🔴 Alta

---

# 🔔 51. Notificación automática por cambios

## Ejemplo

```text
Coordinador cambia:

Ambiente 204
       ↓
Ambiente 305
```

El sistema identifica:

```text
✓ 1 instructor
✓ 30 aprendices
```

Y envía:

```text
🔔 Cambio de ambiente

Tu clase de Programación
ahora será en el Ambiente 305.

12/08/2026
08:00–10:00
```

### ⭐ Prioridad

🔴 Alta

---

# 📊 52. Reportes automáticos

## Ejemplo

El coordinador selecciona:

```text
[Reporte mensual]
Agosto 2026
```

El sistema genera:

```text
HORARIOS
156 sesiones

AMBIENTES
82% ocupación

INSTRUCTORES
74% carga promedio

CONFLICTOS
8 detectados
3 pendientes

[PDF] [Excel]
```

### ⭐ Prioridad

🟡 Media

---

# 🕵️ 53. Auditoría automática

Cada cambio importante debe generar un registro.

```text
08/08/2026 15:20

Usuario: Coordinador
Módulo: Horarios
Acción: Editar

Antes:
Ambiente 204
08:00–10:00

Después:
Ambiente 305
10:00–12:00
```

### ⭐ Prioridad

🔴 Muy alta

---

# 📋 54. Resumen de mejoras concretas

| Pantalla | Elemento | Mejora concreta | Automatización | Prioridad |
|---|---|---|---|---|
| Dashboard | KPI | Hacer tarjetas accionables | Actualización automática | 🔴 |
| Dashboard | Alertas | Priorizar por gravedad | Orden automático | 🔴 |
| Horarios | Filtros | Filtros relacionados | Filtrado dinámico | 🔴 |
| Horarios | Estado | Mostrar estado directo | Actualización automática | 🔴 |
| Crear horario | Formulario | Campos relacionados | Recomendaciones | 🔴 |
| Sesión | Instructor | Mostrar disponibilidad | Filtrado automático | 🔴 |
| Sesión | Ambiente | Mostrar disponibilidad | Filtrado automático | 🔴 |
| Conflictos | Listado | Mostrar causa y acción | Detección automática | 🔴 |
| Resolver conflicto | Opciones | Mostrar alternativas | Búsqueda automática | 🔴 |
| Ambientes | Calendario | Mostrar ocupación | Actualización automática | 🔴 |
| Fichas | Filtros | Programa → trimestre → ficha | Filtrado automático | 🔴 |
| Instructor | Disponibilidad | Calendario semanal | Validación automática | 🔴 |
| Aprendiz | Horario | Próxima clase primero | Recordatorios | 🔴 |
| Notificaciones | Mensajes | Convertirlos en acciones | Envío automático | 🔴 |
| Usuarios | Roles | Mostrar impacto | Permisos automáticos | 🔴 |
| Auditoría | Registros | Mostrar antes/después | Registro automático | 🔴 |
| Parametrización | Datos | Relaciones entre catálogos | Actualización automática | 🟡 |
| Móvil | Tablas | Convertir a tarjetas | Responsive | 🟡 |
| Accesibilidad | Color | No depender solo del color | Validaciones | 🟡 |

---

# 🚦 55. Orden recomendado para desarrollar las mejoras

## Fase 1 — Base

1. Base de datos.
2. Backend.
3. Autenticación.
4. Roles.
5. Permisos.
6. Validaciones.

## Fase 2 — Programación

1. Disponibilidad.
2. Horarios.
3. Conflictos.
4. Ambientes.
5. Instructores.
6. Fichas.

## Fase 3 — Automatización

1. Detección de conflictos.
2. Recomendación de ambientes.
3. Recomendación de instructores.
4. Generación de horarios.
5. Reprogramación.

## Fase 4 — Comunicación

1. Notificaciones.
2. Recordatorios.
3. Actualización de calendarios.
4. Comunicación de cambios.

## Fase 5 — Inteligencia

1. Recomendaciones.
2. Búsqueda inteligente.
3. Análisis de ocupación.
4. Predicción de disponibilidad.
5. Optimización automática.

---

# 📝 Conclusión

La mejora del sistema no debería consistir simplemente en agregar más botones, módulos o pantallas.

El objetivo debe ser **reducir la cantidad de trabajo manual que realiza el usuario**.

Por ejemplo:

### ❌ Proceso actual/manual

```text
Buscar ficha
↓
Buscar instructor
↓
Revisar disponibilidad
↓
Buscar ambiente
↓
Revisar disponibilidad
↓
Asignar hora
↓
Guardar
↓
Detectar que existe conflicto
↓
Volver atrás
↓
Buscar otra opción
```

### ✅ Proceso propuesto

```text
Seleccionar ficha
        ↓
Seleccionar actividad
        ↓
Sistema analiza automáticamente
        ↓
┌─────────────────────────┐
│ ⭐ Mejor opción          │
│ Instructor: Juan Pérez  │
│ Ambiente: 204            │
│ Hora: 08:00–10:00       │
│ Compatibilidad: 98%     │
└─────────────────────────┘
        ↓
[Asignar]
        ↓
Sistema valida
        ↓
Guarda
        ↓
Notifica afectados
```

Esta es la diferencia entre una propuesta **general** y una mejora **específica, medible y desarrollable**.

---

# 🌐 Enlaces principales

- [Página principal](https://code-sena.github.io/design-software-mockup/)
- [Índice del prototipo](https://code-sena.github.io/design-software-mockup/app/index.html#/inventory)
- [Repositorio](https://github.com/code-sena/design-software-mockup/)

---

<p align="center">

## 🏫 Sistema de Gestión de Horarios — SENA

**De un mockup de gestión manual a una plataforma inteligente de apoyo a la programación académica.**

</p>
