export const authKeys = {
  all: () => ['auth'] as const,
  login: () => [...authKeys.all(), 'login'] as const,
  logout: () => [...authKeys.all(), 'logout'] as const
}
