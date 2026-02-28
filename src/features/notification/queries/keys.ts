export const notificationKeys = {
  all: ['notifications'] as const,
  my: (params: { limit?: number; lng?: string } = {}) => [...notificationKeys.all, 'my', params] as const
}
