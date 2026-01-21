import { Navigate, Outlet } from 'react-router'
import { PATHS } from '@/constants/path'
import { useAuthContext } from '@/features/auth'

interface PrivateRouteProps {
  allowedRole?: 'admin' | 'user'
}

export const PrivateRoute = ({ allowedRole }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuthContext()
  const userRole = 'user' // TODO: Replace with actual role logic when available

  if (!isAuthenticated) {
    return <Navigate to={PATHS.AUTH.LOGIN} replace />
  }

  if (allowedRole && allowedRole !== userRole) {
    return <Navigate to={PATHS.HOME} replace />
  }

  return <Outlet />
}
