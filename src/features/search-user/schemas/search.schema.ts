export type RecentSearch = {
  id: string
  type: 'user' | 'keyword'
  displayName: string
  avatar?: string
  username?: string
  timestamp: number
}
