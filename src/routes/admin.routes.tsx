import { type RouteObject, Navigate } from 'react-router'
import { PATHS } from '@/constants/path'
import { PrivateRoute } from './private-route'
import AdminLayout from '@/layouts/admin-layout'
import AdminElasticsearchPage from '@/pages/admin/elasticsearch.page'
import AdminFailedEventsPage from '@/pages/admin/failed-events.page'
import UserManagementPage from '@/pages/admin/user-management-page'
import ReportsManagementPage from '@/pages/admin/reports-management-page'
import ReportDetailPage from '@/pages/admin/report-detail-page'

export const adminRoutes: RouteObject = {
  element: <PrivateRoute requireAuth requireAdmin />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { path: PATHS.ADMIN.DASHBOARD, element: <Navigate to={PATHS.ADMIN.USERS} replace /> },
        { path: PATHS.ADMIN.USERS, element: <UserManagementPage /> },
        { path: PATHS.ADMIN.REPORTS, element: <ReportsManagementPage /> },
        { path: PATHS.ADMIN.REPORT_DETAIL, element: <ReportDetailPage /> },
        {
          path: PATHS.ADMIN.ELASTICSEARCH,
          element: <AdminElasticsearchPage />
        },
        {
          path: PATHS.ADMIN.FAILED_EVENTS,
          element: <AdminFailedEventsPage />
        }
      ]
    }
  ]
}
