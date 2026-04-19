import { useMutation } from '@tanstack/react-query'
import { userReportApi } from '../api/user-report.api'
import { handleErrorApi } from '@/utils/error-handler'
import type { CreateReportRequest } from '../schemas/create-report.schema'

export const useSubmitReportMutation = () =>
  useMutation({
    mutationFn: (data: CreateReportRequest) => userReportApi.submitReport(data),
    onError: (error) => handleErrorApi({ error })
  })
