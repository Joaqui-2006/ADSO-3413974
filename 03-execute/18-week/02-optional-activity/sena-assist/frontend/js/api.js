// =====================================================================
// SENA ASSIST — Cliente de API
// Cambia API_BASE si el backend corre en otra URL/puerto.
// =====================================================================
const API_BASE = 'http://localhost:4000/api';

const Sesion = {
  guardar(token, usuario) {
    localStorage.setItem('sena_token', token);
    localStorage.setItem('sena_usuario', JSON.stringify(usuario));
  },
  token() { return localStorage.getItem('sena_token'); },
  usuario() {
    const raw = localStorage.getItem('sena_usuario');
    return raw ? JSON.parse(raw) : null;
  },
  cerrar() {
    localStorage.removeItem('sena_token');
    localStorage.removeItem('sena_usuario');
    window.location.href = 'index.html';
  },
  requerir(rolEsperado) {
    const usuario = this.usuario();
    if (!this.token() || !usuario) {
      window.location.href = 'index.html';
      return null;
    }
    if (rolEsperado && usuario.rol !== rolEsperado) {
      window.location.href = 'index.html';
      return null;
    }
    return usuario;
  }
};

async function apiFetch(ruta, opciones = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opciones.headers || {}) };
  const token = Sesion.token();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const respuesta = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers });
  const datos = await respuesta.json().catch(() => ({}));

  if (respuesta.status === 401 || respuesta.status === 403) {
    if (ruta !== '/asistencia/escanear') {
      // sesión inválida/expirada -> redirige al login
      // (no aplica al escaneo público del aprendiz)
    }
  }
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Ocurrió un error inesperado');
  }
  return datos;
}

function mostrarAviso(contenedorId, mensaje, tipo = 'error') {
  const el = document.getElementById(contenedorId);
  if (!el) return;
  el.textContent = mensaje;
  el.className = `aviso aviso-${tipo === 'error' ? 'error' : 'exito'}`;
  el.classList.remove('oculto');
}
