import { useTranslation } from 'react-i18next'
import type { AdminAction, ReportReason, ReportStatus, TargetType } from '@/features/report/schemas/report.schema'

export const useReportAdminText = () => {
  const { t } = useTranslation('admin')

  const reasonLabels: Record<ReportReason, string> = {
    SPAM: t('reportManagement.reasons.SPAM'),
    HARASSMENT: t('reportManagement.reasons.HARASSMENT'),
    HATE_SPEECH: t('reportManagement.reasons.HATE_SPEECH'),
    VIOLENCE: t('reportManagement.reasons.VIOLENCE'),
    NUDITY: t('reportManagement.reasons.NUDITY'),
    MISINFORMATION: t('reportManagement.reasons.MISINFORMATION'),
    OTHER: t('reportManagement.reasons.OTHER')
  }

  const statusLabels: Record<ReportStatus, string> = {
    PENDING: t('reportManagement.status.PENDING'),
    RESOLVED: t('reportManagement.status.RESOLVED'),
    DISMISSED: t('reportManagement.status.DISMISSED')
  }

  const targetTypeLabels: Record<TargetType, string> = {
    POST: t('reportManagement.targetTypes.POST'),
    COMMENT: t('reportManagement.targetTypes.COMMENT')
  }

  const actionLabels: Record<AdminAction, string> = {
    DELETE_CONTENT: t('reportManagement.adminActions.DELETE_CONTENT.label'),
    HIDE_CONTENT: t('reportManagement.adminActions.HIDE_CONTENT.label'),
    WARN_USER: t('reportManagement.adminActions.WARN_USER.label'),
    DISMISS_REPORT: t('reportManagement.adminActions.DISMISS_REPORT.label')
  }

  const actionDescriptions: Record<AdminAction, string> = {
    DELETE_CONTENT: t('reportManagement.adminActions.DELETE_CONTENT.description'),
    HIDE_CONTENT: t('reportManagement.adminActions.HIDE_CONTENT.description'),
    WARN_USER: t('reportManagement.adminActions.WARN_USER.description'),
    DISMISS_REPORT: t('reportManagement.adminActions.DISMISS_REPORT.description')
  }

  return {
    t,
    text: {
      page: {
        title: t('reportManagement.page.title'),
        description: t('reportManagement.page.description'),
        statusViewing: t('reportManagement.page.statusViewing'),
        reportListTitle: t('reportManagement.page.reportListTitle'),
        loadingStats: t('reportManagement.page.loadingStats'),
        reportsCount: (count: number) => t('reportManagement.page.reportsCount', { count }),
        activeStatus: t('reportManagement.page.activeStatus'),
        backToReports: t('reportManagement.page.backToReports')
      },
      tabs: {
        pending: t('reportManagement.tabs.pending'),
        resolved: t('reportManagement.tabs.resolved'),
        dismissed: t('reportManagement.tabs.dismissed'),
        all: t('reportManagement.tabs.all')
      },
      summaries: {
        pending: t('reportManagement.summaries.pending'),
        resolved: t('reportManagement.summaries.resolved'),
        dismissed: t('reportManagement.summaries.dismissed'),
        all: t('reportManagement.summaries.all')
      },
      table: {
        no: t('reportManagement.table.no'),
        reporter: t('reportManagement.table.reporter'),
        targetType: t('reportManagement.table.targetType'),
        reason: t('reportManagement.table.reason'),
        content: t('reportManagement.table.content'),
        status: t('reportManagement.table.status'),
        createdAt: t('reportManagement.table.createdAt'),
        actions: t('reportManagement.table.actions'),
        emptyTitle: t('reportManagement.table.emptyTitle'),
        emptySubtitle: t('reportManagement.table.emptySubtitle'),
        noTextContent: t('reportManagement.table.noTextContent'),
        noContent: t('reportManagement.table.noContent'),
        anonymous: t('reportManagement.table.anonymous'),
        authorPrefix: t('reportManagement.table.authorPrefix'),
        byPrefix: t('reportManagement.table.byPrefix'),
        showingRange: (start: number, end: number, total: number) =>
          t('reportManagement.table.showingRange', { start, end, total }),
        processAction: t('reportManagement.table.processAction'),
        viewWarningsAction: t('reportManagement.table.viewWarningsAction'),
        viewDetailAction: t('reportManagement.table.viewDetailAction'),
        reports: t('reportManagement.table.reports'),
        latestReport: t('reportManagement.table.latestReport')
      },
      processDialog: {
        titlePending: t('reportManagement.processDialog.titlePending'),
        titleResolved: t('reportManagement.processDialog.titleResolved'),
        reportCode: (code: string) => t('reportManagement.processDialog.reportCode', { code }),
        createdAt: (date: string) => t('reportManagement.processDialog.createdAt', { date }),
        reporterLabel: t('reportManagement.processDialog.reporterLabel'),
        contentAuthorLabel: t('reportManagement.processDialog.contentAuthorLabel'),
        additionalDetails: t('reportManagement.processDialog.additionalDetails'),
        reportedContent: t('reportManagement.processDialog.reportedContent'),
        media: (count: number) => t('reportManagement.processDialog.media', { count }),
        mediaPreviewAlt: (index: number) => t('reportManagement.processDialog.mediaPreviewAlt', { index }),
        resultTitle: t('reportManagement.processDialog.resultTitle'),
        actionLabel: t('reportManagement.processDialog.actionLabel'),
        adminNoteLabel: t('reportManagement.processDialog.adminNoteLabel'),
        actionRequiredLabel: t('reportManagement.processDialog.actionRequiredLabel'),
        noteOptionalLabel: t('reportManagement.processDialog.noteOptionalLabel'),
        notePlaceholder: t('reportManagement.processDialog.notePlaceholder'),
        cancelButton: t('reportManagement.processDialog.cancelButton'),
        closeButton: t('reportManagement.processDialog.closeButton'),
        confirmButton: t('reportManagement.processDialog.confirmButton'),
        confirmWithAction: (action: string) => t('reportManagement.processDialog.confirmWithAction', { action }),
        processingButton: t('reportManagement.processDialog.processingButton'),
        successToast: t('reportManagement.processDialog.successToast'),
        reportersTitle: t('reportManagement.processDialog.reportersTitle'),
        reportCount: (count: number) => t('reportManagement.processDialog.reportCount', { count }),
        loadingReports: t('reportManagement.processDialog.loadingReports')
      },
      warningsDialog: {
        title: t('reportManagement.warningsDialog.title'),
        user: (id: string) => t('reportManagement.warningsDialog.user', { id }),
        totalWarnings: t('reportManagement.warningsDialog.totalWarnings'),
        latest: t('reportManagement.warningsDialog.latest'),
        noneYet: t('reportManagement.warningsDialog.noneYet'),
        empty: t('reportManagement.warningsDialog.empty'),
        warningIndex: (index: number, date: string) =>
          t('reportManagement.warningsDialog.warningIndex', { index, date }),
        reportCode: (code: string) => t('reportManagement.warningsDialog.reportCode', { code })
      },
      reasonLabels,
      statusLabels,
      targetTypeLabels,
      actionLabels,
      actionDescriptions
    }
  }
}
