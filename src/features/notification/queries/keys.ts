export const notificationKeys = {
  all: ['notifications'] as const,
  my: (params: { limit?: number; lng?: string } = {}) => [...notificationKeys.all, 'my', params] as const,
  state: () => [...notificationKeys.all, 'state'] as const
}
