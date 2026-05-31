import axios from 'axios'

const isProd = import.meta.env.PROD;
const baseURL = isProd 
  ? 'https://jigs-event.onrender.com/api' 
  : (import.meta.env.VITE_API_URL || '/api').trim()

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jigs_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh token on 401
api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('jigs_refresh')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post(`${baseURL}/auth/token/refresh`, { refresh })
        localStorage.setItem('jigs_access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        // Clear stale credentials and redirect to login
        localStorage.removeItem('jigs_access')
        localStorage.removeItem('jigs_refresh')
        localStorage.removeItem('jigs_user')
        // Small delay so any in-flight toasts can show first
        setTimeout(() => { window.location.href = '/login' }, 300)
      }
    }
    return Promise.reject(error)
  }
)

export default api
