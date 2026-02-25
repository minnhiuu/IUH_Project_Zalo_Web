import { type RouteObject } from 'react-router'
import { PATHS } from '@/constants/path'
import { PrivateRoute } from './private-route'
import AdminLayout from '@/layouts/admin-layout'
import AdminDashboardPage from '@/pages/admin/dashboard.page'
import AdminElasticsearchPage from '@/pages/admin/elasticsearch.page'
import AdminDeadEventsPage from '@/pages/admin/dead-events.page'

export const adminRoutes: RouteObject = {
  element: <PrivateRoute requireAuth requireAdmin />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { path: PATHS.ADMIN.DASHBOARD, element: <AdminDashboardPage /> },
        {
          path: PATHS.ADMIN.ELASTICSEARCH,
          element: <AdminElasticsearchPage />
        },
        {
          path: PATHS.ADMIN.DEAD_EVENTS,
          element: <AdminDeadEventsPage />
        }
      ]
    }
  ]
}
