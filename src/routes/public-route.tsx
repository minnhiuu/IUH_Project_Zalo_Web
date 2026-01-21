import { Navigate, Outlet } from 'react-router'
import { PATHS } from '@/constants/path'
import { useAuthContext } from '@/features/auth'

export const PublicRoute = () => {
  const { isAuthenticated } = useAuthContext()

  if (isAuthenticated) {
    return <Navigate to={PATHS.HOME} replace />
  }

  return <Outlet />
}
