// =============================================================
//  CourseHub Web - Cliente HTTP de la API
//  Funciones para consultar los endpoints publicos del backend.
// =============================================================

const API_BASE = (window.API_BASE_URL || '/api').replace(/\/+$/, '');

async function getJSON(path) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status} al consultar ${url}`);
  }
  return response.json();
}

// Recorre la paginacion de Django REST Framework y devuelve todos los resultados.
async function getAll(path) {
  const items = [];
  let url = path;
  while (url) {
    const data = await getJSON(url);
    if (Array.isArray(data)) {
      items.push(...data);
      break;
    }
    items.push(...(data.results || []));
    url = data.next || null;
  }
  return items;
}

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, value);
    }
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

const api = {
  facultades: () => getAll('/facultades/'),
  carreras: (params) => getAll(`/carreras/${buildQuery(params)}`),
  materias: (params) => getAll(`/materias/catalogo/${buildQuery(params)}`),
  profesores: () => getAll('/profesores/'),
  colecciones: (params) => getAll(`/colecciones/${buildQuery(params)}`),
  recursos: (params) => getAll(`/recursos/${buildQuery(params)}`),
  // Verifica que la API este disponible y devuelve el estado.
  ping: async () => {
    const response = await fetch(`${API_BASE}/facultades/`, {
      headers: { Accept: 'application/json' },
    });
    return response.ok;
  },
};
