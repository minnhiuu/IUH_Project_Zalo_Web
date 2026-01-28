import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/axios-client'
import { storage } from '@/utils/local-storage'
import { useQueryClient } from '@tanstack/react-query'
import { handleErrorApi } from '@/utils/error-handler'
import { userApi } from '@/features/user/api/user.api'
import { type UserResponse } from '@/features/user/schemas/user.schema'

const USER_KEY = 'user_profile'

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
  const [user, setUser] = useState<UserResponse | null>(() => storage.get<UserResponse>(USER_KEY))
  const queryClient = useQueryClient()

  const setAuthUser = useCallback((userData: UserResponse | null) => {
    setUser(userData)
    if (userData) {
      storage.set(USER_KEY, userData)
    } else {
      storage.remove(USER_KEY)
    }
  }, [])

  const logoutLocal = useCallback(() => {
    clearAccessToken()
    setUser(null)
    storage.remove(USER_KEY)
    queryClient.clear()
  }, [queryClient])

  const updateUser = useCallback((userData: UserResponse) => {
    setUser(userData)
    storage.set(USER_KEY, userData)
  }, [])

  const refetchUser = useCallback(async () => {
    if (!getAccessToken()) return
    try {
      const response = await userApi.getMyProfile()
      const userData = response.data.data
      if (userData) {
        setAuthUser(userData)
      }
    } catch (error) {
      handleErrorApi({ error })
    }
  }, [setAuthUser])

  const loginSuccess = useCallback(
    async (accessToken: string) => {
      setAccessToken(accessToken)
      const res = await userApi.getMyProfile()
      const userData = res.data.data
      setAuthUser(userData)
      return userData
    },
    [setAuthUser]
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
