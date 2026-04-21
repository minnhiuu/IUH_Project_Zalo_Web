import { useMutation, useQueryClient } from '@tanstack/react-query'
import { elasticsearchApi } from '../api/elasticsearch.api'
import { elasticsearchKeys } from './keys'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/shared/api'
import { useElasticsearchText } from '../i18n/use-elasticsearch-text'
import { SearchIndexType } from '@/constants/enum'

export const useReindex = () => {
  const { text: t } = useElasticsearchText()

  return useMutation({
    mutationFn: (type: SearchIndexType) => elasticsearchApi.reindex(type).then((res) => res.data.data),
    onSuccess: (data) => {
      console.log('Reindex task started:', data.taskId)
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || t.messages.errorReindexAll)
    }
  })
}

export const useUpdateFailedEventResolved = () => {
  const queryClient = useQueryClient()
  const { text: t } = useElasticsearchText()

  return useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) =>
      elasticsearchApi.updateFailedEventResolved(id, resolved).then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.failedEvents() })
      // We might need to invalidate specific summaries if we know which one, 
      // but for simplicity we can invalidate all for now or just generic keys if they don't include type
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.all })
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || t.errors.updateStatus)
    }
  })
}

export const useSwitchAlias = () => {
  const queryClient = useQueryClient()
  const { text: t } = useElasticsearchText()

  return useMutation({
    mutationFn: ({ type, indexName }: { type: SearchIndexType; indexName: string }) =>
      elasticsearchApi.switchAlias(type, indexName).then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({
        queryKey: elasticsearchKeys.all,
        exact: false
      })
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || t.messages.errorSwitchAlias)
    }
  })
}

export const useReindexUser = () => {
  const queryClient = useQueryClient()
  const { text: t } = useElasticsearchText()

  return useMutation({
    mutationFn: (userId: string) => elasticsearchApi.reindexUser(userId).then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(data.message || t.messages.reindexUserSuccess)
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.all })
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || t.messages.errorReindexUser)
    }
  })
}

export const useDeleteIndex = () => {
  const queryClient = useQueryClient()
  const { text: t } = useElasticsearchText()

  return useMutation({
    mutationFn: (indexName: string) => elasticsearchApi.deletePhysicalIndex(indexName).then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({
        queryKey: elasticsearchKeys.all,
        exact: false
      })
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || t.messages.errorDeleteIndex)
    }
  })
}

export const useRetryFailedEvent = () => {
  const queryClient = useQueryClient()
  const { text: t } = useElasticsearchText()

  return useMutation({
    mutationFn: (id: string) => elasticsearchApi.retryFailedEvent(id).then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.failedEvents() })
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.all })
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || t.errors.retrySingle)
    }
  })
}

export const useRetryAllFailedEvents = () => {
  const queryClient = useQueryClient()
  const { text: t } = useElasticsearchText()

  return useMutation({
    mutationFn: (type?: SearchIndexType) => elasticsearchApi.retryAllFailedEvents(type).then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.failedEvents() })
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.all })
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || t.errors.retryAll)
    }
  })
}

export const useRetryFailedEventsByDuration = () => {
  const queryClient = useQueryClient()
  const { text: t } = useElasticsearchText()

  return useMutation({
    mutationFn: (hours: number) => elasticsearchApi.retryFailedEventsByDuration(hours).then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.failedEvents() })
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.all })
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || t.errors.retryDuration)
    }
  })
}

export const useRetryFailedEventsBulk = () => {
  const queryClient = useQueryClient()
  const { text: t } = useElasticsearchText()

  return useMutation({
    mutationFn: (ids: string[]) => elasticsearchApi.retryFailedEventsBulk(ids).then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.failedEvents() })
      queryClient.invalidateQueries({ queryKey: elasticsearchKeys.all })
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || t.errors.retryBulk)
    }
  })
}
