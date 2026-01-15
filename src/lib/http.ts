import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { isTokenExpiringSoon } from '@/utils/jwt'
import { getItem, setItem, removeItem } from '@/utils/local-storage'

const ACCESS_TOKEN_KEY = 'accessToken'

export const getAccessToken = (): string | null => getItem<string>(ACCESS_TOKEN_KEY)

export const setAccessToken = (token: string | null): void => {
  if (token) {
    setItem(ACCESS_TOKEN_KEY, token)
  } else {
    removeItem(ACCESS_TOKEN_KEY)
  }
}

export const clearAccessToken = (): void => removeItem(ACCESS_TOKEN_KEY)

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null
let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: Error) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const performRefresh = async (): Promise<string | null> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
      {},
      { withCredentials: true }
    )

    const newAccessToken = response.data.data?.accessToken
    if (newAccessToken) {
      setAccessToken(newAccessToken)
    }
    return newAccessToken
  } catch (error) {
    clearAccessToken()
    throw error
  }
}

export const silentRefresh = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = performRefresh()
    .then((token) => {
      processQueue(null, token)
      return token
    })
    .catch((error) => {
      processQueue(error as Error, null)
      throw error
    })
    .finally(() => {
      isRefreshing = false
      refreshPromise = null
    })

  return refreshPromise
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isAuthEndpoint =
      config.url?.includes('/auth/student/login') ||
      config.url?.includes('/auth/lecturer/login') ||
      config.url?.includes('/auth/refresh-token') ||
      config.url?.includes('/auth/register')

    if (isAuthEndpoint) return config

    let token = getAccessToken()

    if (token && isTokenExpiringSoon(token)) {
      try {
        token = isRefreshing && refreshPromise ? await refreshPromise : await silentRefresh()
      } catch (error) {
        console.error('Silent refresh failed:', error)
        token = getAccessToken()
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401) return Promise.reject(error)

    if (
      originalRequest.url?.includes('/auth/student/login') ||
      originalRequest.url?.includes('/auth/lecturer/login') ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      clearAccessToken()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string | null) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(http(originalRequest))
          },
          reject
        })
      })
    }

    try {
      const newToken = await silentRefresh()
      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }
      return http(originalRequest)
    } catch (refreshError) {
      clearAccessToken()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  }
)

export default http
