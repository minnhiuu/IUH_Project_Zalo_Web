export const searchKeys = {
  all: ['search-users'] as const,
  search: (keyword: string) => [...searchKeys.all, keyword] as const
}
