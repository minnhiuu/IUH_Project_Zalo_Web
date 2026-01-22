import { type RouteObject } from 'react-router'
import { PATHS } from '@/constants/path'
import UserLayout from '@/layouts/user-layout'
import UserHomePage from '@/pages/users/home-page'
import { PrivateRoute } from './private-route'

export const userRoutes: RouteObject = {
  element: <PrivateRoute requireAuth />,
  children: [
    {
      element: <UserLayout />,
      children: [{ path: PATHS.HOME, element: <UserHomePage /> }]
    }
  ]
}
