import { useQuery } from '@tanstack/react-query'
import { elasticsearchOptions } from './options'
import { elasticsearchKeys } from './keys'
import { elasticsearchApi } from '../api/elasticsearch.api'
import { SearchIndexType } from '@/constants/enum'

export const useEsHealth = () => {
  return useQuery(elasticsearchOptions.health())
}

export const useEsSummary = (type: SearchIndexType) => {
  return useQuery(elasticsearchOptions.summary(type))
}

export const useEsIndexes = (type: SearchIndexType) => {
  return useQuery(elasticsearchOptions.indexes(type))
}

export const useEsStats = (type: SearchIndexType) => {
  return useQuery(elasticsearchOptions.stats(type))
}

export const useReindexStatus = (type: SearchIndexType, taskId: string | null) => {
  return useQuery(elasticsearchOptions.reindexStatus(type, taskId))
}

export const useEsDocument = (type: SearchIndexType, id: string) => {
  return useQuery(elasticsearchOptions.document(type, id))
}

export const useFailedEventsPaged = (params: {
  resolved?: boolean
  keyword?: string
  hours?: number
  page?: number
  size?: number
  type?: SearchIndexType
}) => {
  return useQuery({
    queryKey: [...elasticsearchKeys.failedEvents(), params],
    queryFn: () => elasticsearchApi.getFailedEventsPaged(params).then((res) => res.data.data),
    placeholderData: (previousData) => previousData
  })
}

export const useFailedEventsByType = (type: SearchIndexType, page: number = 0, size: number = 10) => {
  return useQuery({
    ...elasticsearchOptions.failedEventsByType(type, page, size),
    placeholderData: (previousData) => previousData
  })
}
