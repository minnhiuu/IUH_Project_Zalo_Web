import { useAuthContext } from '../context/auth-context'
import { storage, STORAGE_KEYS } from '@/utils/local-storage'

export const useAuth = () => {
  const auth = useAuthContext()

  // Fallback to localStorage in case React state hasn't updated yet (race condition after login)
  const effectiveRole = auth.user?.role ?? storage.get(STORAGE_KEYS.USER_PROFILE)?.role

  return {
    ...auth,
    isAdmin: effectiveRole === 'ADMIN',
    isUser: effectiveRole === 'USER'
  }
}
