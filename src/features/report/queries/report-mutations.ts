import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminReportApi } from '../api/admin-report.api'
import { adminReportKeys } from './report-keys'
import { handleErrorApi } from '@/utils/error-handler'
import type { BulkModerationRequest } from '../schemas/report.schema'

export const useProcessTargetReportsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BulkModerationRequest) => adminReportApi.processReportsForTarget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminReportKeys.groupedLists() })
    },
    onError: (error) => handleErrorApi({ error })
  })
}
