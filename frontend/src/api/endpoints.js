// Funciones de acceso a la API del backend CourseHub.

import { apiFetch, apiFetchAll } from './client'

const buildQuery = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value)
  })
  const s = qs.toString()
  return s ? `?${s}` : ''
}

/* ---------- Autenticación ---------- */
export const authApi = {
  login: (correo, password) =>
    apiFetch('/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
    }),
  register: (data) =>
    apiFetch('/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  logout: () =>
    apiFetch('/auth/logout/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {}),
  me: () => apiFetch('/auth/me/'),
  changePassword: (current_password, new_password) =>
    apiFetch('/auth/change-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password, new_password }),
    }),
}

/* ---------- Catálogo ---------- */
export const catalogoApi = {
  facultades: () => apiFetchAll('/facultades/'),
  carreras: () => apiFetchAll('/carreras/'),
  materias: (params) => apiFetchAll(`/materias/catalogo/${buildQuery(params)}`),
  materiasCrud: () => apiFetchAll('/materias/'),
  crearMateria: (data) =>
    apiFetch('/materias/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  actualizarMateria: (id, data) =>
    apiFetch(`/materias/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  eliminarMateria: (id) => apiFetch(`/materias/${id}/`, { method: 'DELETE' }),
  profesores: () => apiFetchAll('/profesores/'),
}

/* ---------- Contenido ---------- */
export const contenidoApi = {
  recursos: (params) => apiFetchAll(`/recursos/${buildQuery(params)}`),
  recurso: (id) => apiFetch(`/recursos/${id}/`),
  crearRecurso: (formData) =>
    apiFetch('/recursos/', {
      method: 'POST',
      body: formData,
    }),
  toggleActivo: (id) => apiFetch(`/recursos/${id}/toggle_activo/`, { method: 'POST' }),
  descargar: (id) => apiFetch(`/recursos/${id}/descargar/`),
  colecciones: (params) => apiFetchAll(`/colecciones/${buildQuery(params)}`),
  crearColeccion: (data) =>
    apiFetch('/colecciones/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
}

/* ---------- Interacción ---------- */
export const interaccionApi = {
  valorar: (recursoId, estrellas) =>
    apiFetch('/valoraciones/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recurso: recursoId, estrellas }),
    }),
  actualizarValoracion: (id, estrellas) =>
    apiFetch(`/valoraciones/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estrellas }),
    }),
  misValoraciones: () => apiFetchAll('/valoraciones/'),
  guardar: (recursoId) =>
    apiFetch('/guardados/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recurso: recursoId }),
    }),
  quitarGuardado: (id) => apiFetch(`/guardados/${id}/`, { method: 'DELETE' }),
  misGuardados: () => apiFetchAll('/guardados/'),
  reportar: (data) =>
    apiFetch('/reportes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  reportes: (params) => apiFetchAll(`/reportes/${buildQuery(params)}`),
  atenderReporte: (id) => apiFetch(`/reportes/${id}/atender/`, { method: 'POST' }),
  desestimarReporte: (id) => apiFetch(`/reportes/${id}/desestimar/`, { method: 'POST' }),
}

/* ---------- Usuarios ---------- */
export const usuariosApi = {
  perfil: (id) => apiFetch(`/usuarios/${id}/`),
  usuarios: () => apiFetchAll('/usuarios/'),
  rangos: () => apiFetchAll('/rangos/'),
}
