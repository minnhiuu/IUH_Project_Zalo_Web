export const elasticsearchKeys = {
  all: ['elasticsearch'] as const,
  summary: () => [...elasticsearchKeys.all, 'summary'] as const,
  health: () => [...elasticsearchKeys.all, 'health'] as const,
  stats: () => [...elasticsearchKeys.all, 'stats'] as const,
  compare: () => [...elasticsearchKeys.all, 'compare'] as const,
  indexes: () => [...elasticsearchKeys.all, 'indexes'] as const,
  document: (id: string) => [...elasticsearchKeys.all, 'document', id] as const,
  failedEvents: () => [...elasticsearchKeys.all, 'failed-events'] as const,
  reindexStatus: (taskId: string) => [...elasticsearchKeys.all, 'reindex-status', taskId] as const
}
