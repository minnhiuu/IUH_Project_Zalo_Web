export const searchKeys = {
  all: ['search-users'] as const,
  search: (keyword: string) => [...searchKeys.all, keyword] as const,
  recentItems: () => ['recent-search', 'items'] as const,
  recentQueries: () => ['recent-search', 'queries'] as const
}
