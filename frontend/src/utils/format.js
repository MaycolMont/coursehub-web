// Utilidades de formato y mapeos de presentación.

export const CATEGORIAS = {
  nota: { label: 'Nota', icono: 'bi-journal-text', bg: 'bg-primary', color: '#003366' },
  prueba: { label: 'Prueba', icono: 'bi-file-check', bg: 'bg-warning', color: '#F1C40F' },
  proyecto: { label: 'Proyecto', icono: 'bi-diagram-3', bg: 'bg-success', color: '#2ECC71' },
}

export const MEDIOS = {
  pdf: { label: 'PDF', icono: 'bi-file-earmark-pdf-fill', color: '#E74C3C' },
  zip: { label: 'ZIP', icono: 'bi-file-earmark-zip-fill', color: '#2ECC71' },
  link: { label: 'Enlace', icono: 'bi-link-45deg', color: '#00A8E8' },
}

export const ESTADOS_RECURSO = {
  activo: { label: 'Activo', color: 'success' },
  inactivo: { label: 'Inactivo', color: 'danger' },
}

const COLORES_RANGO = {
  Novato: '#6c757d',
  Colaborador: '#0d6efd',
  'Héroe de la FIEC': '#e67e22',
  'Leyenda ESPOL': '#9b59b6',
}

const ICONOS_RANGO = {
  Novato: 'bi-egg',
  Colaborador: 'bi-star',
  'Héroe de la FIEC': 'bi-shield-fill',
  'Leyenda ESPOL': 'bi-trophy-fill',
}

// Devuelve {nombre, color, icono} del rango según el karma.
export function obtenerRango(karma, rangos) {
  const orden = [...(rangos || [])].sort((a, b) => b.karma_minimo - a.karma_minimo)
  const rango = orden.find((r) => karma >= r.karma_minimo)
  const nombre = rango ? rango.nombre_rango : 'Novato'
  return {
    nombre,
    color: COLORES_RANGO[nombre] || '#6c757d',
    icono: ICONOS_RANGO[nombre] || 'bi-egg',
  }
}

// Progreso (0-100) hacia el siguiente rango.
export function calcularProgresoRango(karma, rangos) {
  const orden = [...(rangos || [])].sort((a, b) => a.karma_minimo - b.karma_minimo)
  const siguiente = orden.find((r) => karma < r.karma_minimo)
  if (!siguiente) return { progreso: 100, siguiente: null }
  const anterior = [...orden]
    .reverse()
    .find((r) => r.karma_minimo <= karma)
  const base = anterior ? anterior.karma_minimo : 0
  const tope = siguiente.karma_minimo
  const progreso = Math.min(100, Math.round(((karma - base) / (tope - base)) * 100))
  return { progreso, siguiente: siguiente.nombre_rango }
}

export function formatearFecha(iso) {
  if (!iso) return ''
  const fecha = new Date(iso)
  const opciones = { day: '2-digit', month: 'short', year: 'numeric' }
  return fecha.toLocaleDateString('es-EC', opciones)
}

export function abrirEnlace(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
