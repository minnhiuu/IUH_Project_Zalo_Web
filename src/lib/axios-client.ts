import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { getDeviceId } from '../utils/device'
import { storage, STORAGE_KEYS } from '@/utils/local-storage'

export const getAccessToken = (): string | null => storage.get(STORAGE_KEYS.ACCESS_TOKEN)

export const setAccessToken = (token: string | null, refreshTokenExpirationMs?: number): void => {
  if (token) {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token)
    if (refreshTokenExpirationMs) {
      const expiryTimestamp = Date.now() + refreshTokenExpirationMs
      storage.set(STORAGE_KEYS.REFRESH_TOKEN_EXPIRATION, expiryTimestamp)
    }
  } else {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN_EXPIRATION)
  }
}

export const clearAccessToken = (): void => {
  storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN_EXPIRATION)
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string | null) => void> = []

const subscribeRefresh = (cb: (token: string | null) => void) => {
  refreshSubscribers.push(cb)
}

const notifyRefreshSubscribers = (token: string | null) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      {
        deviceId: getDeviceId()
      },
      { withCredentials: true }
    )

    const newToken = response.data?.data?.accessToken ?? null
    setAccessToken(newToken)
    return newToken
  } catch (err) {
    const code = (err as AxiosError<{ code?: number }>)?.response?.data?.code
    if (code === 1013) {
      clearAccessToken()
      toast.error('Tài khoản của bạn đã bị cấm', { duration: 4000 })
      setTimeout(() => { window.location.href = '/login' }, 2000)
    }
    return null
  }
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const locale = storage.get(STORAGE_KEYS.LOCALE) || 'vi'
  config.headers['Accept-Language'] = locale
  const isAuthEndpoint =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register') ||
    config.url?.includes('/auth/refresh') ||
    config.url?.includes('/auth/qr')

  if (isAuthEndpoint) return config

  const token = getAccessToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, Promise.reject)

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const responseData = error.response?.data as { code?: number } | undefined

    // Account banned — show message then redirect
    if (responseData?.code === 1013) {
      clearAccessToken()
      toast.error('Tài khoản của bạn đã bị cấm', { duration: 4000 })
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => { window.location.href = '/login' }, 2000)
      }
      return Promise.reject(error)
    }

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/qr')

    if (isAuthEndpoint) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      clearAccessToken()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeRefresh((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          resolve(http(originalRequest))
        })
      })
    }

    isRefreshing = true

    try {
      const newToken = await refreshAccessToken()
      notifyRefreshSubscribers(newToken)

      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }

      return http(originalRequest)
    } catch (refreshError) {
      notifyRefreshSubscribers(null)
      clearAccessToken()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default http
