import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

/** Auth endpoints that return 401 for invalid credentials — must not trigger token refresh. */
const AUTH_NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
] as const

/**
 * Returns true when a 401 should be passed through to the caller (e.g. wrong password on login).
 *
 * @param url - Request URL or path from axios config
 */
function isAuthRouteWithoutRefresh(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_NO_REFRESH_PATHS.some((path) => url.includes(path))
}

/** Public auth pages where a failed refresh should not force a full reload. */
const PUBLIC_AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify'] as const

function isPublicAuthPage(): boolean {
  return PUBLIC_AUTH_PATHS.some((path) => window.location.pathname.startsWith(path))
}

// Request interceptor: attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: refresh on 401 for protected routes only
let isRefreshing = false
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined

    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRouteWithoutRefresh(originalRequest.url)

    if (!shouldAttemptRefresh) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      const { accessToken } = response.data.data
      useAuthStore.getState().setAuth(useAuthStore.getState().user!, accessToken)
      processQueue(null, accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(originalRequest)
    } catch (err) {
      processQueue(err, null)
      useAuthStore.getState().clearAuth()
      if (!isPublicAuthPage()) {
        window.location.href = '/login'
      }
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
