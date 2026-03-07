# 📘 Manual de Uso de Git y Gestión de Archivos

------------------------------------------------------------------------

# 📑 Índice

1.  Introducción\
2.  ¿Qué es un Manual?\
3.  ¿Qué es Git?\
4.  Instalación de Git\
5.  Flujo básico de trabajo en Git\
6.  Clonar un repositorio\
7.  Estados de los archivos en Git\
8.  Agregar archivos (git add)\
9.  Crear commits\
10. Convención para escribir commits\
11. Subir archivos al repositorio (push)\
12. Descargar archivos del repositorio (pull)\
13. Trabajar con ramas (branches)\
14. Historial de cambios\
15. Archivo `.gitignore`\
16. Buenas prácticas con Git\
17. Resumen de comandos principales

------------------------------------------------------------------------

# 📖 Introducción

Este manual explica los conceptos básicos para trabajar con **Git**,
incluyendo cómo crear commits, subir y bajar archivos de un repositorio
y gestionar versiones de archivos.

Git es una herramienta fundamental para el desarrollo de software y para
el trabajo colaborativo en proyectos.

Este documento está diseñado como una **guía práctica paso a paso** para
usuarios que comienzan a trabajar con Git.

------------------------------------------------------------------------

# 🧾 ¿Qué es un Manual?

Un **manual** es un documento que contiene instrucciones detalladas
sobre cómo utilizar un sistema, herramienta o proceso.

Su objetivo es **guiar al usuario** para que pueda realizar tareas
correctamente.

### Características de un buen manual

-   Información clara y organizada
-   Explicaciones paso a paso
-   Ejemplos prácticos
-   Uso de comandos y tablas
-   Fácil de consultar

------------------------------------------------------------------------

# 🧰 ¿Qué es Git?

**Git** es un sistema de control de versiones distribuido que permite
gestionar cambios en archivos y proyectos.

Con Git puedes:

-   Registrar cambios en archivos
-   Trabajar en equipo
-   Mantener historial de versiones
-   Recuperar versiones anteriores
-   Sincronizar proyectos con repositorios remotos

Repositorios remotos comunes:

-   GitHub
-   GitLab
-   Bitbucket

------------------------------------------------------------------------

# 💻 Instalación de Git

## Windows

Descargar Git desde:

https://git-scm.com

Luego instalar siguiendo el asistente.

Verificar instalación:

``` bash
git --version
```

------------------------------------------------------------------------

# 🔄 Flujo básico de trabajo en Git

El flujo de trabajo básico es:

    Modificar archivos
            ↓
    git add
            ↓
    git commit
            ↓
    git push

Explicación:

-   **git add** prepara los archivos
-   **git commit** guarda los cambios
-   **git push** sube los cambios al repositorio

------------------------------------------------------------------------

# 📥 Clonar un repositorio

Clonar significa **descargar un repositorio remoto a tu computadora**.

``` bash
git clone URL_DEL_REPOSITORIO
```

Ejemplo:

``` bash
git clone https://github.com/usuario/proyecto.git
```

Esto descargará el proyecto completo en una carpeta.

------------------------------------------------------------------------

# 📂 Estados de los archivos en Git

Los archivos en Git pueden tener diferentes estados:

  Estado      Descripción
  ----------- ----------------------------------
  Modified    Archivo modificado
  Staged      Archivo preparado para commit
  Committed   Archivo guardado en el historial

------------------------------------------------------------------------

# ➕ Agregar archivos al área de preparación

Antes de hacer un commit debes agregar los archivos.

Agregar un archivo específico:

``` bash
git add archivo.txt
```

Agregar todos los archivos:

``` bash
git add .
```

Ver estado del repositorio:

``` bash
git status
```

------------------------------------------------------------------------

# 💾 Crear un Commit

Un **commit** guarda los cambios realizados.

Comando:

``` bash
git commit -m "mensaje del commit"
```

Ejemplo:

``` bash
git commit -m "Se agregó el manual de Git"
```

------------------------------------------------------------------------

# ✍ Convención para escribir commits

Buenas prácticas:

-   Usar mensajes claros
-   Explicar el cambio realizado
-   Usar frases cortas

Ejemplos correctos:

    git commit -m "Se agregó validación en formulario"
    git commit -m "Se corrigió error en login"
    git commit -m "Se actualizó documentación"

Ejemplo incorrecto:

    git commit -m "Cambios"

------------------------------------------------------------------------

# 📤 Subir archivos al repositorio (Push)

Para subir los cambios al repositorio remoto:

``` bash
git push origin main
```

Si la rama principal es `master`:

``` bash
git push origin master
```

------------------------------------------------------------------------

# 📥 Descargar cambios del repositorio (Pull)

Para descargar los cambios más recientes:

``` bash
git pull origin main
```

Esto actualiza tu repositorio local.

------------------------------------------------------------------------

# 🌿 Trabajar con ramas (Branches)

Las ramas permiten trabajar sin afectar la versión principal.

### Crear una rama

``` bash
git branch nombre-rama
```

### Cambiar de rama

``` bash
git checkout nombre-rama
```

### Crear y cambiar a una rama

``` bash
git checkout -b nueva-rama
```

------------------------------------------------------------------------

# 📊 Ver historial de cambios

Para ver todos los commits realizados:

``` bash
git log
```

Versión resumida:

``` bash
git log --oneline
```

------------------------------------------------------------------------

# 📦 Archivo .gitignore

El archivo `.gitignore` sirve para **ignorar archivos que no deben
subirse al repositorio**.

Ejemplo:

    node_modules/
    .env
    dist/
    *.log

------------------------------------------------------------------------

# ⚠ Buenas prácticas al usar Git

-   Hacer commits frecuentes
-   Usar mensajes claros
-   Ejecutar `git pull` antes de trabajar
-   No subir archivos innecesarios
-   Mantener el repositorio organizado
-   Usar ramas para nuevas funcionalidades

------------------------------------------------------------------------

# 📚 Resumen de comandos principales

  Comando        Función
  -------------- ------------------------
  git clone      Descargar repositorio
  git status     Ver estado de archivos
  git add        Preparar archivos
  git commit     Guardar cambios
  git push       Subir cambios
  git pull       Descargar cambios
  git branch     Crear rama
  git checkout   Cambiar de rama
  git log        Ver historial

------------------------------------------------------------------------

# 📌 Conclusión

Git es una herramienta fundamental para el control de versiones y la
colaboración en proyectos de software.

El uso correcto de commits, pushes y pulls permite mantener un historial
organizado y facilitar el trabajo en equipo.
