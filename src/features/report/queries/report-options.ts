import { queryOptions } from '@tanstack/react-query'
import { adminReportApi } from '../api/admin-report.api'
import { adminReportKeys } from './report-keys'
import type { ReportFilterParams } from '../schemas/report.schema'

export const adminReportQueries = {
  groupedReports: (filters: ReportFilterParams = {}) =>
    queryOptions({
      queryKey: adminReportKeys.groupedList(filters),
      queryFn: () => adminReportApi.getGroupedReports(filters)
    }),

  reportsByTarget: (targetType: string, targetId: string) =>
    queryOptions({
      queryKey: adminReportKeys.targetReports(targetType, targetId),
      queryFn: () => adminReportApi.getReportsForTarget(targetType, targetId),
      enabled: !!targetType && !!targetId
    }),

  userWarnings: (userId: string) =>
    queryOptions({
      queryKey: adminReportKeys.warnings(userId),
      queryFn: () => adminReportApi.getUserWarnings(userId),
      enabled: !!userId
    })
}
