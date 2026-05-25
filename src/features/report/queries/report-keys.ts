import type { ReportFilterParams } from '../schemas/report.schema'

export const adminReportKeys = {
  all: ['admin', 'reports'] as const,
  lists: () => [...adminReportKeys.all, 'list'] as const,
  list: (filters: ReportFilterParams) => [...adminReportKeys.lists(), filters] as const,
  groupedLists: () => [...adminReportKeys.all, 'grouped'] as const,
  groupedList: (filters: ReportFilterParams) => [...adminReportKeys.groupedLists(), filters] as const,
  targetReports: (targetType: string, targetId: string) =>
    [...adminReportKeys.all, 'target', targetType, targetId] as const,
  warnings: (userId: string) => [...adminReportKeys.all, 'warnings', userId] as const
}
