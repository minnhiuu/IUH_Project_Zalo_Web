import z from 'zod'
import { SearchType } from '@/constants/enum'
import i18n from '@/lib/i18n'

export const recentSearchRequestSchema = z.object({
  id: z.string().min(1, i18n.t('search:validation.idRequired')),
  name: z.string().min(1, i18n.t('search:validation.nameRequired')),
  avatar: z.string().optional(),
  type: z.enum([SearchType.User, SearchType.Group, SearchType.Keyword], {
    message: i18n.t('search:validation.typeInvalid')
  })
})

export type RecentSearchRequest = z.infer<typeof recentSearchRequestSchema>

export type RecentSearchResponse = {
  id: string
  name: string
  avatar?: string
  type: SearchType
  timestamp: number
}

export type RecentHistoryResponse = {
  items: RecentSearchResponse[]
  queries: RecentSearchResponse[]
}
