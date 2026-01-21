import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { storage } from '../utils/local-storage'

import { getDeviceId } from '../utils/device'

export const getAccessToken = (): string | null => storage.get('access_token')

export const setAccessToken = (token: string | null): void => {
  if (token) storage.set('access_token', token)
  else storage.remove('access_token')
}

export const clearAccessToken = (): void => {
  storage.remove('access_token')
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
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
        // refreshToken is handled via cookies on backend, but if needed we can add here
      },
      { withCredentials: true }
    )

    const newToken = response.data?.data?.accessToken ?? null
    setAccessToken(newToken)
    return newToken
  } catch {
    return null
  }
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const isAuthEndpoint =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register') ||
    config.url?.includes('/auth/refresh')

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

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')

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
