import { type RouteObject } from 'react-router'
import { PATHS } from '@/constants/path'
import UserLayout from '@/layouts/user-layout'
import ChatPage from '@/pages/user/chat/chat-page'
import SocialFeedPage from '@/pages/user/social-feed/social-feed-page'
import { PrivateRoute } from './private-route'

export const userRoutes: RouteObject = {
  element: <PrivateRoute requireAuth />,
  children: [
    {
      element: <UserLayout />,
      children: [
        { path: PATHS.HOME, element: <ChatPage /> }
      ]
    },
    { path: PATHS.SOCIAL_FEED, element: <SocialFeedPage /> }
  ]
}
