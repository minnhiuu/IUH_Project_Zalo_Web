export const recentSearchKeys = {
  all: ['recent-search'] as const,
  history: () => [...recentSearchKeys.all, 'history'] as const
}
