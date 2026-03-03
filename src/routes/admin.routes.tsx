import { type RouteObject, Navigate } from 'react-router'
import { PATHS } from '@/constants/path'
import AdminLayout from '@/layouts/admin-layout'
import UserManagementPage from '@/pages/admin/user-management-page'
import { PrivateRoute } from './private-route'

export const adminRoutes: RouteObject = {
  element: <PrivateRoute requireAuth requireAdmin />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { path: PATHS.ADMIN.DASHBOARD, element: <Navigate to={PATHS.ADMIN.USERS} replace /> },
        { path: PATHS.ADMIN.USERS, element: <UserManagementPage /> }
      ]
    }
  ]
}
