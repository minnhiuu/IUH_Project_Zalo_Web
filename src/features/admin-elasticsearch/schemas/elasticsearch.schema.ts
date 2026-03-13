import { ElasticsearchClusterStatus, DataSyncStatus, ReindexTaskStatus, IndexStatus } from '@/constants/enum'

export type ElasticsearchHealthResponse = {
  status: ElasticsearchClusterStatus
  clusterName: string
  indexExists: boolean
  currentIndexName: string | null
  aliasName: string
}

export type IndexStatsResponse = {
  indexName: string
  documentCount: number
  primaryStoreSize: string
  totalStoreSize: string
  numberOfShards: number
  numberOfReplicas: number
}

export type DataComparisonResponse = {
  elasticsearchCount: number
  databaseCount: number
  difference: number
  status: DataSyncStatus
  recommendation: string
}

export type ElasticsearchSummaryResponse = {
  health: ElasticsearchHealthResponse
  stats: IndexStatsResponse
  compare: DataComparisonResponse
  failedEventsCount: number
}

export type UserIndex = {
  id: string
  fullName: string
  phoneNumber: string
  accountId: string
  role: string
  avatar: string
  createdAt: string
}

export type ReindexResponse = {
  message: string
  taskId: string
}

export type ReindexStatus = {
  taskId: string
  status: ReindexTaskStatus
  total: number
  processed: number
  percentage: number
  message: string
}

export type IndexDetail = {
  indexName: string
  createdAt: string
  docCount: number
  primaryStoreSize: string
  status: IndexStatus
}

export type FailedEvent = {
  id: string
  eventId: string
  eventType: string
  topic: string
  payload: string | null
  errorMessage: string | null
  stackTrace: string | null
  partition: number
  offset: number
  createdAt: string
  retryCount: number
  resolved: boolean
}
