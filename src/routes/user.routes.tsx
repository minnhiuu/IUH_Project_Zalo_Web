import { type RouteObject } from 'react-router'
import { PATHS } from '@/constants/path'
import UserLayout from '@/layouts/user-layout'
import ChatPage from '@/pages/user/chat/chat-page'
import CloudPage from '@/pages/user/cloud/cloud-page'
import SettingsPage from '@/pages/user/settings/settings-page'
import SocialFeedPage from '@/pages/user/social-feed/social-feed-page'
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
        { path: PATHS.USER.SETTINGS, element: <SettingsPage /> }
      ]
    },
    { path: PATHS.SOCIAL_FEED, element: <SocialFeedPage /> },
    { path: PATHS.USER.PROFILE, element: <MyProfilePage /> },
    { path: PATHS.USER.OTHER_PROFILE, element: <OtherProfilePage /> }
  ]
}
