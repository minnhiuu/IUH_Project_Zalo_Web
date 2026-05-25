import { queryOptions } from '@tanstack/react-query'
import { elasticsearchApi } from '../api/elasticsearch.api'
import { elasticsearchKeys } from './keys'
import { ReindexTaskStatus, SearchIndexType } from '@/constants/enum'

export const elasticsearchOptions = {
  health: () =>
    queryOptions({
      queryKey: elasticsearchKeys.health(),
      queryFn: () => elasticsearchApi.getHealth().then((res) => res.data.data),
      refetchInterval: 30000
    }),

  summary: (type: SearchIndexType) =>
    queryOptions({
      queryKey: elasticsearchKeys.summary(type),
      queryFn: () => elasticsearchApi.getSummary(type).then((res) => res.data.data),
      refetchInterval: 10000
    }),

  stats: (type: SearchIndexType) =>
    queryOptions({
      queryKey: elasticsearchKeys.stats(type),
      queryFn: () => elasticsearchApi.getStats(type).then((res) => res.data.data),
      refetchInterval: 10000
    }),

  indexes: (type: SearchIndexType) =>
    queryOptions({
      queryKey: elasticsearchKeys.indexes(type),
      queryFn: () => elasticsearchApi.getPhysicalIndexes(type).then((res) => res.data.data)
    }),

  document: (type: SearchIndexType, id: string) =>
    queryOptions({
      queryKey: elasticsearchKeys.document(id),
      queryFn: () => elasticsearchApi.getDocument(type, id).then((res) => res.data.data)
    }),

  reindexStatus: (type: SearchIndexType, taskId: string | null) =>
    queryOptions({
      queryKey: elasticsearchKeys.reindexStatus(type, taskId!),
      queryFn: () => elasticsearchApi.getReindexStatus(type, taskId!).then((res) => res.data.data),
      enabled: !!taskId,
      refetchInterval: (query) => {
        const data = query.state.data
        if (data?.status === ReindexTaskStatus.Completed || data?.status === ReindexTaskStatus.Failed) {
          return false
        }
        return 1000
      }
    }),

  failedEventsByType: (type: SearchIndexType, page: number = 0, size: number = 10) =>
    queryOptions({
      queryKey: [...elasticsearchKeys.failedEvents(), { type, page, size }],
      queryFn: () => elasticsearchApi.getFailedEventsByType(type, page, size).then((res) => res.data.data)
    })
}
