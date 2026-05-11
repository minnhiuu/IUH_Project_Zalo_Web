import { SearchIndexType } from '@/constants/enum'

export const elasticsearchKeys = {
  all: ['elasticsearch'] as const,
  health: () => [...elasticsearchKeys.all, 'health'] as const,
  summary: (type: SearchIndexType) => [...elasticsearchKeys.all, 'summary', type] as const,
  stats: (type: SearchIndexType) => [...elasticsearchKeys.all, 'stats', type] as const,
  indexes: (type: SearchIndexType) => [...elasticsearchKeys.all, 'indexes', type] as const,
  document: (id: string) => [...elasticsearchKeys.all, 'document', id] as const,
  failedEvents: () => [...elasticsearchKeys.all, 'failed-events'] as const,
  reindexStatus: (type: SearchIndexType, taskId: string) => [...elasticsearchKeys.all, 'reindex-status', type, taskId] as const
}
