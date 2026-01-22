import { useAuthContext } from '../context/auth-context'

export const useAuth = () => {
  const auth = useAuthContext()

  return {
    ...auth,
    isAdmin: auth.user?.role === 'ADMIN',
    isUser: auth.user?.role === 'USER'
  }
}
