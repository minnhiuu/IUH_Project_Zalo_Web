export const PATHS = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password'
  },

  USER: {
    PROFILE: '/profile',
    SETTINGS: '/settings'
  },

  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users'
  }
} as const
