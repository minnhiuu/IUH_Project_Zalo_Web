import { useQuery } from '@tanstack/react-query'
import { ingestOptions } from './options'

export const useIngestDocumentsQuery = (conversationId?: string, enabled: boolean = true) => {
  return useQuery(ingestOptions.documents(conversationId, enabled))
}
