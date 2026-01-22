import { useRoutes } from 'react-router'
import { authRoutes } from './auth.routes'
import { adminRoutes } from './admin.routes'
import { userRoutes } from './user.routes'

const AppRoutes = () => {
  const element = useRoutes([
    authRoutes,
    adminRoutes,
    userRoutes,
    {
      path: '*',
      element: <div>404 Not Found</div>
    }
  ])

  return element
}

export default AppRoutes
