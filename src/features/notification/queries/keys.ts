export const notificationKeys = {
  all: ['notifications'] as const,
  my: (params: { page?: number; size?: number } = {}) => [...notificationKeys.all, 'my', params] as const
}
