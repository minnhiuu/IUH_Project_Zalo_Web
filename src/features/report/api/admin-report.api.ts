import http from '@/lib/axios-client'
import type { ApiResponse, PageResponse } from '@/shared/api'
import type {
  ContentReportSummary,
  ReportDetailResponse,
  ReportResponse,
  UserWarningResponse,
  BulkModerationRequest,
  ReportFilterParams
} from '@/features/report/schemas/report.schema'

export const adminReportApi = {
  getGroupedReports: (params?: ReportFilterParams) =>
    http.get<ApiResponse<PageResponse<ContentReportSummary>>>('/admin/reports', {
      params: {
        status: params?.status || undefined,
        page: params?.page ?? 0,
        size: params?.size ?? 20
      }
    }),

  getReportsForTarget: (targetType: string, targetId: string) =>
    http.get<ApiResponse<ReportDetailResponse[]>>(`/admin/reports/target/${targetType}/${targetId}`),

  processReportsForTarget: (data: BulkModerationRequest) =>
    http.post<ApiResponse<ReportResponse[]>>('/admin/reports/action', data),

  getUserWarnings: (userId: string) => http.get<ApiResponse<UserWarningResponse[]>>(`/admin/reports/warnings/${userId}`)
}
