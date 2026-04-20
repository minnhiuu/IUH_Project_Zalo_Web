import { useQuery } from '@tanstack/react-query'
import { adminReportQueries } from './report-options'
import type { ReportFilterParams, TargetType } from '../schemas/report.schema'

export const useGroupedReports = (filters: ReportFilterParams = {}) => {
  return useQuery(adminReportQueries.groupedReports(filters))
}

export const useReportsByTarget = (targetType?: TargetType, targetId?: string) => {
  return useQuery({
    ...adminReportQueries.reportsByTarget(targetType ?? '', targetId ?? ''),
    enabled: !!targetType && !!targetId
  })
}

export const useUserWarnings = (userId: string) => {
  return useQuery(adminReportQueries.userWarnings(userId))
}
