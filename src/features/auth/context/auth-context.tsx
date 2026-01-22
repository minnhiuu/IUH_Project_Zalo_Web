import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/axios-client'
import { storage } from '@/utils/local-storage'
import { type AccountResponse } from '@/features/auth/schemas/auth.schema'
import { useQueryClient } from '@tanstack/react-query'
import { handleErrorApi } from '@/utils/error-handler'

const USER_KEY = 'user_profile'

interface AuthProviderProps {
  children: ReactNode
}

interface AuthContextType {
  user: AccountResponse | null
  isAuthenticated: boolean
  setAuthUser: (user: AccountResponse | null) => void
  logoutLocal: () => void
  updateUser: (user: AccountResponse) => void
  refetchUser: () => Promise<void>
  loginSuccess: (accessToken: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AccountResponse | null>(() => storage.get<AccountResponse>(USER_KEY))
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAccessToken())
  const queryClient = useQueryClient()

  const setAuthUser = useCallback((userData: AccountResponse | null) => {
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
    setIsAuthenticated(false)
    storage.remove(USER_KEY)
    queryClient.clear()
  }, [queryClient])

  const updateUser = useCallback((userData: AccountResponse) => {
    setUser(userData)
    storage.set(USER_KEY, userData)
  }, [])

  const refetchUser = useCallback(async () => {
    if (!getAccessToken()) return
    try {
      // Profile fetching will be implemented in user feature
    } catch (error) {
      handleErrorApi({ error })
    }
  }, [])

  const loginSuccess = useCallback(async (accessToken: string) => {
    setAccessToken(accessToken)
    setIsAuthenticated(true)
    // TODO: Implement userApi.me()
    return true
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated,
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
