import axios, { AxiosError, type AxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// --- 401 auto-refresh interceptor --------------------------------------------------
let refreshPromise: Promise<void> | null = null

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/refresh') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/forgot-password') ||
    url.includes('/api/auth/reset-password') ||
    url.includes('/api/auth/verify-email')
  )
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined
    const status = error.response?.status

    if (status === 401 && original && !original._retried && !isAuthEndpoint(original.url)) {
      original._retried = true
      try {
        if (!refreshPromise) {
          refreshPromise = api
            .post('/api/auth/refresh')
            .then(() => undefined)
            .finally(() => {
              refreshPromise = null
            })
        }
        await refreshPromise
        return api.request(original)
      } catch (refreshError) {
        // Lazy-import to avoid circular dep with the store/router
        const { useAuthStore } = await import('@/stores/auth')
        const router = (await import('@/router')).default
        useAuthStore().clear()
        // `/api/auth/me` is a silent probe used at bootstrap — never redirect on its failure.
        const isMeProbe = original.url?.includes('/api/auth/me') === true
        const currentName = router.currentRoute.value.name
        const onPublicAuthRoute =
          currentName === 'welcome' ||
          currentName === 'login' ||
          currentName === 'register' ||
          currentName === 'forgot-password' ||
          currentName === 'reset-password'
        if (!isMeProbe && !onPublicAuthRoute) {
          router.push({
            name: 'welcome',
            query: { redirect: router.currentRoute.value.fullPath },
          })
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export { API_BASE_URL }
export default api

