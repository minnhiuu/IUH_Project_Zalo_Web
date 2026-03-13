import { queryOptions } from '@tanstack/react-query'
import { elasticsearchApi } from '../api/elasticsearch.api'
import { elasticsearchKeys } from './keys'
import { ReindexTaskStatus } from '@/constants/enum'

export const elasticsearchOptions = {
  summary: () =>
    queryOptions({
      queryKey: elasticsearchKeys.summary(),
      queryFn: () => elasticsearchApi.getSummary().then((res) => res.data.data),
      refetchInterval: 10000
    }),

  health: () =>
    queryOptions({
      queryKey: elasticsearchKeys.health(),
      queryFn: () => elasticsearchApi.getHealth().then((res) => res.data.data),
      refetchInterval: 30000
    }),

  stats: () =>
    queryOptions({
      queryKey: elasticsearchKeys.stats(),
      queryFn: () => elasticsearchApi.getStats().then((res) => res.data.data),
      refetchInterval: 10000
    }),

  compare: () =>
    queryOptions({
      queryKey: elasticsearchKeys.compare(),
      queryFn: () => elasticsearchApi.compareWithDatabase().then((res) => res.data.data),
      refetchInterval: 10000
    }),

  indexes: () =>
    queryOptions({
      queryKey: elasticsearchKeys.indexes(),
      queryFn: () => elasticsearchApi.getAllIndexes().then((res) => res.data.data)
    }),

  document: (userId: string) =>
    queryOptions({
      queryKey: elasticsearchKeys.document(userId),
      queryFn: () => elasticsearchApi.getDocument(userId).then((res) => res.data.data)
    }),

  reindexStatus: (taskId: string | null) =>
    queryOptions({
      queryKey: elasticsearchKeys.reindexStatus(taskId!),
      queryFn: () => elasticsearchApi.getReindexStatus(taskId!).then((res) => res.data.data),
      enabled: !!taskId,
      refetchInterval: (query) => {
        const data = query.state.data
        if (data?.status === ReindexTaskStatus.Completed || data?.status === ReindexTaskStatus.Failed) {
          return false
        }
        return 1000
      }
    })
}
