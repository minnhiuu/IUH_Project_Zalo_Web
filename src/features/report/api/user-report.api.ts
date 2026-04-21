import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'
import type { ReportResponse } from '@/features/report/schemas/report.schema'
import type { CreateReportRequest } from '@/features/report/schemas/create-report.schema'

export const userReportApi = {
  submitReport: (data: CreateReportRequest) => http.post<ApiResponse<ReportResponse>>('/reports', data)
}
