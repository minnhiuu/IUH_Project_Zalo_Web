import { useRoutes } from 'react-router'

import { PATHS } from '@/constants/path'
import AdminLayout from '@/layouts/admin-layout'
import AuthLayout from '@/layouts/auth-layout'
import UserLayout from '@/layouts/user-layout'
import AdminDashboardPage from '@/pages/admin/admin-dashboard-page'
import LoginPage from '@/pages/auth/login-page'
import RegisterPage from '@/pages/auth/register-page'

import { PrivateRoute } from './private-route'
import { PublicRoute } from './public-route'

const AppRoutes = () => {
  const element = useRoutes([
    {
      element: <PublicRoute />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            { path: PATHS.AUTH.LOGIN, element: <LoginPage /> },
            { path: PATHS.AUTH.REGISTER, element: <RegisterPage /> }
          ]
        }
      ]
    },
    {
      element: <PrivateRoute allowedRole='admin' />,
      children: [
        {
          element: <AdminLayout />,
          children: [{ path: PATHS.ADMIN.DASHBOARD, element: <AdminDashboardPage /> }]
        }
      ]
    },
    {
      element: <PrivateRoute allowedRole='user' />,
      children: [
        {
          element: <UserLayout />,
          children: [{ path: PATHS.HOME, element: <div>Home Page (User)</div> }]
        }
      ]
    },
    {
      path: '*',
      element: <div>404 Not Found</div>
    }
  ])

  return element
}

export default AppRoutes
