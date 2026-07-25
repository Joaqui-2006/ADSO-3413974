// =====================================================================
// SENA ASSIST — Panel administrativo
// Configuración declarativa de cada entidad: de dónde se lee, columnas
// visibles en la tabla y campos del formulario de creación.
// =====================================================================
Sesion.requerir('Administrador');

const ENTIDADES = {
  instructores: {
    etiqueta: 'Instructores',
    tipo: 'usuario', rol: 'Instructor',
    columnas: [
      { campo: 'numero_documento', titulo: 'Documento' },
      { campo: 'nombres', titulo: 'Nombres' },
      { campo: 'apellidos', titulo: 'Apellidos' },
      { campo: 'correo', titulo: 'Correo' },
      { campo: 'estado', titulo: 'Estado' }
    ],
    campos: [
      { nombre: 'tipo_documento', etiqueta: 'Tipo de documento', tipo: 'select', opciones: ['CC','CE','PA'] },
      { nombre: 'numero_documento', etiqueta: 'Número de documento', tipo: 'text', requerido: true },
      { nombre: 'nombres', etiqueta: 'Nombres', tipo: 'text', requerido: true },
      { nombre: 'apellidos', etiqueta: 'Apellidos', tipo: 'text', requerido: true },
      { nombre: 'correo', etiqueta: 'Correo institucional', tipo: 'email', requerido: true },
      { nombre: 'contrasena', etiqueta: 'Contraseña temporal', tipo: 'password', requerido: true },
      { nombre: 'especialidad', etiqueta: 'Especialidad', tipo: 'text' },
      { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'text' }
    ]
  },
  aprendices: {
    etiqueta: 'Aprendices',
    tipo: 'usuario', rol: 'Aprendiz',
    columnas: [
      { campo: 'numero_documento', titulo: 'Documento' },
      { campo: 'nombres', titulo: 'Nombres' },
      { campo: 'apellidos', titulo: 'Apellidos' },
      { campo: 'id_ficha', titulo: 'Ficha (ID)' },
      { campo: 'estado', titulo: 'Estado' }
    ],
    campos: [
      { nombre: 'tipo_documento', etiqueta: 'Tipo de documento', tipo: 'select', opciones: ['TI','CC','CE','PA'] },
      { nombre: 'numero_documento', etiqueta: 'Número de documento', tipo: 'text', requerido: true },
      { nombre: 'nombres', etiqueta: 'Nombres', tipo: 'text', requerido: true },
      { nombre: 'apellidos', etiqueta: 'Apellidos', tipo: 'text', requerido: true },
      { nombre: 'correo', etiqueta: 'Correo', tipo: 'email', requerido: true },
      { nombre: 'contrasena', etiqueta: 'Contraseña temporal', tipo: 'password', requerido: true },
      { nombre: 'id_ficha', etiqueta: 'ID de la ficha', tipo: 'number', requerido: true },
      { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'text' }
    ]
  },
  programas: {
    etiqueta: 'Programas de formación',
    tipo: 'tabla', tabla: 'programas', llave: 'id_programa',
    columnas: [
      { campo: 'codigo', titulo: 'Código' },
      { campo: 'nombre', titulo: 'Nombre' },
      { campo: 'nivel', titulo: 'Nivel' },
      { campo: 'duracion_meses', titulo: 'Duración (meses)' }
    ],
    campos: [
      { nombre: 'codigo', etiqueta: 'Código', tipo: 'text', requerido: true },
      { nombre: 'nombre', etiqueta: 'Nombre del programa', tipo: 'text', requerido: true },
      { nombre: 'nivel', etiqueta: 'Nivel', tipo: 'select', opciones: ['Tecnólogo','Técnico','Complementaria','Especialización'] },
      { nombre: 'duracion_meses', etiqueta: 'Duración (meses)', tipo: 'number' }
    ]
  },
  fichas: {
    etiqueta: 'Fichas',
    tipo: 'tabla', tabla: 'fichas', llave: 'id_ficha',
    columnas: [
      { campo: 'numero_ficha', titulo: 'Número' },
      { campo: 'id_programa', titulo: 'ID Programa' },
      { campo: 'jornada', titulo: 'Jornada' },
      { campo: 'estado', titulo: 'Estado' }
    ],
    campos: [
      { nombre: 'numero_ficha', etiqueta: 'Número de ficha', tipo: 'text', requerido: true },
      { nombre: 'id_programa', etiqueta: 'ID del programa', tipo: 'number', requerido: true },
      { nombre: 'fecha_inicio', etiqueta: 'Fecha inicio', tipo: 'date' },
      { nombre: 'fecha_fin', etiqueta: 'Fecha fin', tipo: 'date' },
      { nombre: 'jornada', etiqueta: 'Jornada', tipo: 'select', opciones: ['Mañana','Tarde','Noche','Mixta','Fin de semana'] }
    ]
  },
  ambientes: {
    etiqueta: 'Ambientes',
    tipo: 'tabla', tabla: 'ambientes', llave: 'id_ambiente',
    columnas: [
      { campo: 'nombre', titulo: 'Nombre' },
      { campo: 'bloque', titulo: 'Bloque' },
      { campo: 'capacidad', titulo: 'Capacidad' },
      { campo: 'tipo', titulo: 'Tipo' }
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre del ambiente', tipo: 'text', requerido: true },
      { nombre: 'bloque', etiqueta: 'Bloque', tipo: 'text' },
      { nombre: 'capacidad', etiqueta: 'Capacidad', tipo: 'number' },
      { nombre: 'tipo', etiqueta: 'Tipo', tipo: 'select', opciones: ['aula','laboratorio','taller','virtual'] }
    ]
  },
  clases: {
    etiqueta: 'Clases',
    tipo: 'tabla', tabla: 'clases', llave: 'id_clase',
    columnas: [
      { campo: 'nombre_clase', titulo: 'Nombre' },
      { campo: 'id_ficha', titulo: 'ID Ficha' },
      { campo: 'id_instructor', titulo: 'ID Instructor' },
      { campo: 'id_ambiente', titulo: 'ID Ambiente' }
    ],
    campos: [
      { nombre: 'nombre_clase', etiqueta: 'Nombre de la clase', tipo: 'text', requerido: true },
      { nombre: 'id_ficha', etiqueta: 'ID de la ficha', tipo: 'number', requerido: true },
      { nombre: 'id_instructor', etiqueta: 'ID del instructor', tipo: 'number', requerido: true },
      { nombre: 'id_ambiente', etiqueta: 'ID del ambiente', tipo: 'number', requerido: true },
      { nombre: 'competencia', etiqueta: 'Competencia', tipo: 'text' }
    ]
  },
  horarios: {
    etiqueta: 'Horarios',
    tipo: 'tabla', tabla: 'horarios', llave: 'id_horario',
    columnas: [
      { campo: 'id_clase', titulo: 'ID Clase' },
      { campo: 'fecha', titulo: 'Fecha' },
      { campo: 'hora_inicio', titulo: 'Inicio' },
      { campo: 'hora_fin', titulo: 'Fin' }
    ],
    campos: [
      { nombre: 'id_clase', etiqueta: 'ID de la clase', tipo: 'number', requerido: true },
      { nombre: 'fecha', etiqueta: 'Fecha', tipo: 'date', requerido: true },
      { nombre: 'hora_inicio', etiqueta: 'Hora inicio', tipo: 'time', requerido: true },
      { nombre: 'hora_fin', etiqueta: 'Hora fin', tipo: 'time', requerido: true }
    ]
  }
};

let entidadActual = 'instructores';
let filasActuales = [];

function construirMenu() {
  const menu = document.getElementById('menu-lateral');
  menu.innerHTML = Object.entries(ENTIDADES).map(([clave, cfg]) => `
    <button data-clave="${clave}" class="${clave === entidadActual ? 'activo' : ''}" onclick="cambiarEntidad('${clave}')">${cfg.etiqueta}</button>
  `).join('');
}

function cambiarEntidad(clave) {
  entidadActual = clave;
  document.querySelectorAll('#menu-lateral button').forEach(b => b.classList.toggle('activo', b.dataset.clave === clave));
  document.getElementById('titulo-entidad').textContent = ENTIDADES[clave].etiqueta;
  document.getElementById('buscador-admin').value = '';
  cargarDatos();
}

async function cargarDatos() {
  const cfg = ENTIDADES[entidadActual];
  const encabezado = document.getElementById('encabezado-tabla');
  const cuerpo = document.getElementById('cuerpo-tabla');

  encabezado.innerHTML = `<tr>${cfg.columnas.map(c => `<th>${c.titulo}</th>`).join('')}<th></th></tr>`;
  cuerpo.innerHTML = `<tr><td colspan="${cfg.columnas.length + 1}">Cargando...</td></tr>`;

  try {
    const ruta = cfg.tipo === 'usuario' ? `/admin/usuarios?rol=${cfg.rol}` : `/admin/${cfg.tabla}`;
    filasActuales = await apiFetch(ruta);
    renderTabla();
  } catch (err) {
    cuerpo.innerHTML = `<tr><td colspan="${cfg.columnas.length + 1}">${err.message}</td></tr>`;
  }
}

function renderTabla() {
  const cfg = ENTIDADES[entidadActual];
  const cuerpo = document.getElementById('cuerpo-tabla');
  const filtro = document.getElementById('buscador-admin').value.trim().toLowerCase();

  const visibles = filasActuales.filter(f =>
    JSON.stringify(f).toLowerCase().includes(filtro)
  );

  if (visibles.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="${cfg.columnas.length + 1}">Sin registros.</td></tr>`;
    return;
  }

  cuerpo.innerHTML = visibles.map(fila => {
    const llave = cfg.tipo === 'usuario' ? fila.id_usuario : fila[cfg.llave];
    const celdas = cfg.columnas.map(c => `<td>${fila[c.campo] ?? '—'}</td>`).join('');
    const accion = cfg.tipo === 'usuario'
      ? `<button class="btn btn-fantasma" onclick="alternarEstado(${llave}, '${fila.estado}')">${fila.estado === 'activo' ? 'Desactivar' : 'Activar'}</button>`
      : `<button class="btn btn-fantasma" onclick="eliminarRegistro(${llave})">Eliminar</button>`;
    return `<tr>${celdas}<td>${accion}</td></tr>`;
  }).join('');
}

document.getElementById('buscador-admin').addEventListener('input', renderTabla);

async function alternarEstado(idUsuario, estadoActual) {
  const nuevo = estadoActual === 'activo' ? 'inactivo' : 'activo';
  try {
    await apiFetch(`/admin/usuarios/${idUsuario}/estado`, {
      method: 'PUT', body: JSON.stringify({ estado: nuevo })
    });
    cargarDatos();
  } catch (err) { alert(err.message); }
}

async function eliminarRegistro(id) {
  const cfg = ENTIDADES[entidadActual];
  if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;
  try {
    await apiFetch(`/admin/${cfg.tabla}/${id}`, { method: 'DELETE' });
    cargarDatos();
  } catch (err) { alert(err.message); }
}

// --- Modal de creación ---
const modal = document.getElementById('modal');
document.getElementById('btn-nuevo').addEventListener('click', abrirModal);
document.getElementById('btn-cancelar').addEventListener('click', () => modal.classList.add('oculto'));

function abrirModal() {
  const cfg = ENTIDADES[entidadActual];
  document.getElementById('modal-titulo').textContent = `Nuevo registro — ${cfg.etiqueta}`;
  const form = document.getElementById('form-modal');
  form.innerHTML = cfg.campos.map(c => {
    if (c.tipo === 'select') {
      return `<label>${c.etiqueta}</label><select name="${c.nombre}">${c.opciones.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
    }
    return `<label>${c.etiqueta}</label><input type="${c.tipo}" name="${c.nombre}" ${c.requerido ? 'required' : ''}>`;
  }).join('');
  modal.classList.remove('oculto');
}

document.getElementById('form-modal').addEventListener('submit', async (e) => {
  e.preventDefault();
  const cfg = ENTIDADES[entidadActual];
  const datos = Object.fromEntries(new FormData(e.target).entries());

  try {
    if (cfg.tipo === 'usuario') {
      const idRolPorTipo = { Instructor: 2, Aprendiz: 3 };
      await apiFetch('/admin/usuarios', {
        method: 'POST',
        body: JSON.stringify({ ...datos, id_rol: idRolPorTipo[cfg.rol] })
      });
    } else {
      await apiFetch(`/admin/${cfg.tabla}`, { method: 'POST', body: JSON.stringify(datos) });
    }
    modal.classList.add('oculto');
    cargarDatos();
  } catch (err) {
    alert(err.message);
  }
});

construirMenu();
cargarDatos();
