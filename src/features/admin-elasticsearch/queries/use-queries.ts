import { useQuery } from '@tanstack/react-query'
import { elasticsearchOptions } from './options'
import { elasticsearchKeys } from './keys'
import { elasticsearchApi } from '../api/elasticsearch.api'

export const useEsSummary = () => {
  return useQuery(elasticsearchOptions.summary())
}

export const useEsIndexes = () => {
  return useQuery(elasticsearchOptions.indexes())
}

export const useEsDocument = (userId: string) => {
  return useQuery(elasticsearchOptions.document(userId))
}

export const useReindexStatus = (taskId: string | null) => {
  return useQuery(elasticsearchOptions.reindexStatus(taskId))
}

export const useDeadEventsPaged = (params: {
  search?: string
  eventType?: string
  retryRange?: string
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
}) => {
  return useQuery({
    queryKey: [...elasticsearchKeys.deadEvents(), params],
    queryFn: () => elasticsearchApi.getDeadEventsPaged(params).then((res) => res.data.data),
    placeholderData: (previousData) => previousData
  })
}
