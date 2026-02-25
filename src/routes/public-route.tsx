import { Navigate, Outlet } from 'react-router'
import { PATHS } from '@/constants/path'
import { useAuthContext } from '@/features/auth'
import { Role } from '@/constants'

export const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthContext()

  if (isAuthenticated) {
    if (user?.role === Role.Admin) {
      return <Navigate to={PATHS.ADMIN.DASHBOARD} replace />
    }
    return <Navigate to={PATHS.HOME} replace />
  }

  return <Outlet />
}
