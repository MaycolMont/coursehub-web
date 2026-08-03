// Cliente HTTP con autenticación JWT (Bearer) y renovación de tokens.

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const TOKEN_KEY = 'coursehub_access'
const REFRESH_KEY = 'coursehub_refresh'

let refreshing = null

export function setTokens(access, refresh) {
  if (access) localStorage.setItem(TOKEN_KEY, access)
  else localStorage.removeItem(TOKEN_KEY)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  else localStorage.removeItem(REFRESH_KEY)
}

export function loadTokens() {
  return {
    access: localStorage.getItem(TOKEN_KEY),
    refresh: localStorage.getItem(REFRESH_KEY),
  }
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

function getAccess() {
  return localStorage.getItem(TOKEN_KEY)
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!refresh) return null
  if (!refreshing) {
    refreshing = fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (r) => {
        if (!r.ok) {
          clearTokens()
          return null
        }
        const data = await r.json()
        setTokens(data.access, data.refresh || refresh)
        return data.access
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

export async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options
  const token = getAccess()
  const finalHeaders = { ...(headers || {}) }
  if (token && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Bearer ${token}`
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  let response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
  })

  if (response.status === 401 && !options._retry) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      finalHeaders.Authorization = `Bearer ${newToken}`
      response = await fetch(url, {
        ...rest,
        headers: finalHeaders,
        _retry: true,
      })
    }
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      (body && typeof body === 'object' && (body.detail || body.message)) ||
      (body && typeof body === 'object' ? Object.values(body).flat().join(' ') : null) ||
      'Error de conexión. Intenta de nuevo.'
    const error = new Error(message)
    error.status = response.status
    error.data = body
    throw error
  }

  return body
}

// Recorre la paginación de DRF y devuelve todos los resultados.
export async function apiFetchAll(path, options = {}) {
  const results = []
  let url = path
  while (url) {
    const data = await apiFetch(url, options)
    if (Array.isArray(data)) {
      results.push(...data)
      break
    }
    results.push(...(data.results || []))
    url = data.next || null
  }
  return results
}

export default API_BASE
