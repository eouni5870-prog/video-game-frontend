// All calls to the backend (videoGameCharacterApi) go through this file.
// Change the address in a .env file with VITE_API_URL=... if your API runs on another port.
export const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7062'

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {}
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      "Impossible de contacter l'API. Vérifiez qu'elle est lancée dans Visual Studio (bouton ▶).",
      0,
    )
  }

  if (response.status === 204) return null

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    // ProblemDetails from the backend: { title, detail, errors: { Field: [messages] } }
    const details = data?.errors ? Object.values(data.errors).flat() : []
    const message =
      data?.detail ||
      (response.status === 401 ? 'Vous devez vous connecter.' : null) ||
      (response.status === 403 ? "Vous n'avez pas le droit de faire cette action." : null) ||
      (details.length ? 'Certains champs ne sont pas valides.' : null) ||
      data?.title ||
      `Erreur ${response.status}`
    throw new ApiError(message, response.status, details)
  }

  return data
}

function toQueryString(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) search.set(key, value)
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export const api = {
  // Characters
  getCharacters: (query) => request(`/api/VideoGameCharacters${toQueryString(query)}`),
  createCharacter: (character, token) =>
    request('/api/VideoGameCharacters', { method: 'POST', body: character, token }),
  updateCharacter: (id, character, token) =>
    request(`/api/VideoGameCharacters/${id}`, { method: 'PUT', body: character, token }),
  deleteCharacter: (id, token) =>
    request(`/api/VideoGameCharacters/${id}`, { method: 'DELETE', token }),

  // Games
  getGames: () => request('/api/Games'),
  createGame: (game, token) => request('/api/Games', { method: 'POST', body: game, token }),
  updateGame: (id, game, token) => request(`/api/Games/${id}`, { method: 'PUT', body: game, token }),
  deleteGame: (id, token) => request(`/api/Games/${id}`, { method: 'DELETE', token }),

  // Pictures: returns { url }
  uploadImage: (file, token) => {
    const form = new FormData()
    form.append('file', file)
    return request('/api/Uploads', { method: 'POST', body: form, token })
  },

  // Auth
  register: (credentials) => request('/api/Auth/register', { method: 'POST', body: credentials }),
  login: (credentials) => request('/api/Auth/login', { method: 'POST', body: credentials }),
}
