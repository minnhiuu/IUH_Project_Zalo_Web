import { type RouteObject } from 'react-router'
import { PATHS } from '@/constants/path'
import UserLayout from '@/layouts/user-layout'
import ChatPage from '@/pages/user/chat/chat-page'
import CloudPage from '@/pages/user/cloud/cloud-page'
import SocialFeedPage from '@/pages/user/social-feed/social-feed-page'
import ReelsPage from '@/pages/user/reels/reels-page'
import MyProfilePage from '@/pages/user/my-profile/my-profile-page'
import OtherProfilePage from '@/pages/user/other-profile/other-profile-page'
import { PrivateRoute } from './private-route'
import ContactPage from '@/pages/user/contacts/contact-page'

export const userRoutes: RouteObject = {
  element: <PrivateRoute requireAuth />,
  children: [
    {
      element: <UserLayout />,
      children: [
        { path: PATHS.HOME, element: <ChatPage /> },
        { path: PATHS.CHAT.CONVERSATION, element: <ChatPage /> },
        { path: PATHS.CHAT.USER, element: <ChatPage /> },
        { path: PATHS.JOIN_GROUP, element: <ChatPage /> },
        { path: PATHS.CLOUD, element: <CloudPage /> },
        { path: PATHS.CONTACTS, element: <ContactPage /> },
        { path: PATHS.SOCIAL_FEED, element: <SocialFeedPage /> },
        { path: PATHS.REELS, element: <ReelsPage /> },
        { path: PATHS.USER.PROFILE, element: <MyProfilePage /> },
        { path: PATHS.USER.OTHER_PROFILE, element: <OtherProfilePage /> }
      ]
    }
  ]
}
