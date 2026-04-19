import { queryOptions } from '@tanstack/react-query'
import { QUERY_POLICIES } from '@/constants/query-policies'
import { ingestApi } from '../api/ingest.api'
import { ingestKeys } from './keys'

export const ingestOptions = {
  documents: (conversationId?: string, enabled: boolean = true) =>
    queryOptions({
      ...QUERY_POLICIES.LIST,
      queryKey: ingestKeys.documents(conversationId),
      queryFn: async () => {
        const response = await ingestApi.getDocuments(conversationId)
        return response.data.data.documents
      },
      enabled
    })
}
