import { type RouteObject } from 'react-router'
import { PATHS } from '@/constants/path'
import AdminLayout from '@/layouts/admin-layout'
import AdminDashboardPage from '@/pages/admin/admin-dashboard-page'
import { PrivateRoute } from './private-route'

export const adminRoutes: RouteObject = {
  element: <PrivateRoute requireAuth requireAdmin />,
  children: [
    {
      element: <AdminLayout />,
      children: [{ path: PATHS.ADMIN.DASHBOARD, element: <AdminDashboardPage /> }]
    }
  ]
}
