import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — clear token and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
}

// ── Documents ─────────────────────────────────────────
export const docsApi = {
  upload: (formData) =>
    api.post('/api/docs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: () => api.get('/api/docs'),
  get: (id) => api.get(`/api/docs/${id}`),
  download: (id, signed = false) =>
    api.get(`/api/docs/${id}/download?signed=${signed}`, { responseType: 'blob' }),
  sendLink: (data) => api.post('/api/docs/send-link', data),
  delete: (id) => api.delete(`/api/docs/${id}`),
}

// ── Signatures ────────────────────────────────────────
export const sigApi = {
  create: (data) => api.post('/api/signatures', data),
  list: (docId) => api.get(`/api/signatures/${docId}`),
  finalize: (documentId) => api.post('/api/signatures/finalize', { document_id: documentId }),
  signWithToken: (token, data) =>
    api.post(`/api/signatures/sign-with-token?token=${token}`, data),
}

// ── Audit ─────────────────────────────────────────────
export const auditApi = {
  get: (docId) => api.get(`/api/audit/${docId}`),
}

export default api
