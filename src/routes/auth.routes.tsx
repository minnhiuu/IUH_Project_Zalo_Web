import { type RouteObject } from 'react-router'
import { PATHS } from '@/constants/path'
import AuthLayout from '@/layouts/auth-layout'
import LoginPage from '@/pages/auth/login-page'
import RegisterPage from '@/pages/auth/register-page'
import ForgotPasswordPage from '@/pages/auth/forgot-password-page'
import { PublicRoute } from './public-route'

export const authRoutes: RouteObject = {
  element: <PublicRoute />,
  children: [
    {
      element: <AuthLayout />,
      children: [
        { path: PATHS.AUTH.LOGIN, element: <LoginPage /> },
        { path: PATHS.AUTH.REGISTER, element: <RegisterPage /> },
        { path: PATHS.AUTH.FORGOT_PASSWORD, element: <ForgotPasswordPage /> }
      ]
    }
  ]
}
