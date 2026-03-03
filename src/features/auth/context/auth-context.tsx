import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/axios-client'
import { storage } from '@/utils/local-storage'
import { useQueryClient } from '@tanstack/react-query'
import { handleErrorApi } from '@/utils/error-handler'
import { getMyProfileQueryOptions } from '@/features/user/queries/options'
import { type UserResponse } from '@/features/user/schemas/user.schema'
import { STORAGE_KEYS } from '@/utils/local-storage'

interface AuthProviderProps {
  children: ReactNode
}

interface AuthContextType {
  user: UserResponse | null
  isAuthenticated: boolean
  setAuthUser: (user: UserResponse | null) => void
  logoutLocal: () => void
  updateUser: (user: UserResponse) => void
  refetchUser: () => Promise<void>
  loginSuccess: (accessToken: string) => Promise<UserResponse>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserResponse | null>(() => storage.get(STORAGE_KEYS.USER_PROFILE))
  const queryClient = useQueryClient()

  const setAuthUser = useCallback((userData: UserResponse | null) => {
    setUser(userData)
    if (userData) {
      storage.set(STORAGE_KEYS.USER_PROFILE, userData)
    } else {
      storage.remove(STORAGE_KEYS.USER_PROFILE)
    }
  }, [])

  const logoutLocal = useCallback(() => {
    clearAccessToken()
    setUser(null)
    storage.remove(STORAGE_KEYS.USER_PROFILE)
    queryClient.clear()
  }, [queryClient])

  const updateUser = useCallback((userData: UserResponse) => {
    setUser(userData)
    storage.set(STORAGE_KEYS.USER_PROFILE, userData)
  }, [])

  const refetchUser = useCallback(async () => {
    if (!getAccessToken()) return
    try {
      const rawUser = await queryClient.fetchQuery(getMyProfileQueryOptions())
      if (rawUser) {
        let userData = rawUser
        if (!userData.role) {
          try {
            const token = getAccessToken()!
            const payload = JSON.parse(atob(token.split('.')[1]))
            if (payload.role) {
              userData = { ...rawUser, role: payload.role }
            }
          } catch {
            // ignore decode errors
          }
        }
        setAuthUser(userData)
      }
    } catch (error) {
      handleErrorApi({ error })
    }
  }, [setAuthUser, queryClient])

  const loginSuccess = useCallback(
    async (accessToken: string) => {
      setAccessToken(accessToken)
      await new Promise((resolve) => setTimeout(resolve, 800))
      // Invalidate cache để đảm bảo fetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      const rawUser = await queryClient.fetchQuery(getMyProfileQueryOptions())
      let userData = rawUser
      // Decode role from JWT if API response doesn't include it
      if (!userData.role) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]))
          console.log('[Auth] JWT payload:', payload)
          if (payload.role) {
            userData = { ...rawUser, role: payload.role }
          }
        } catch {
          // ignore decode errors
        }
      }
      console.log('[Auth] Final userData.role:', userData.role)
      setAuthUser(userData)
      return userData
    },
    [setAuthUser, queryClient]
  )

  const value: AuthContextType = {
    user,
    isAuthenticated: !!getAccessToken(),
    setAuthUser,
    logoutLocal,
    updateUser,
    refetchUser,
    loginSuccess
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
