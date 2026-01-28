import { Navigate, Outlet } from 'react-router'
import { PATHS } from '@/constants/path'
import { useAuth } from '@/features/auth'
import type { ReactNode } from 'react'

interface PrivateRouteProps {
  children?: ReactNode
  redirectTo?: string
  requireAuth?: boolean
  requireAdmin?: boolean
}

export const PrivateRoute = ({
  children,
  redirectTo = PATHS.AUTH.LOGIN,
  requireAuth = true,
  requireAdmin = false
}: PrivateRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth()

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={PATHS.HOME} replace />
  }

  return children || <Outlet />
}
