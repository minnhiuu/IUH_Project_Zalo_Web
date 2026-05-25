import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { CheckCircle2, Clock3, Layers3, ShieldAlert, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useReportAdminText } from '@/features/report/i18n/use-report-admin-text'
import { useGroupedReports } from '@/features/report/queries/report-queries'
import { ReportsTable } from '@/features/report/components/reports-table'
import { UserWarningsDialog } from '@/features/report/components/user-warnings-dialog'
import { StatsCard } from '@/features/admin-elasticsearch/components/stats-card'
import { cn } from '@/lib/utils'
import type { ReportFilterParams, ContentReportSummary, ReportStatus } from '@/features/report/schemas/report.schema'

export default function ReportsManagementPage() {
  const { text } = useReportAdminText()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [warningsUserId, setWarningsUserId] = useState<string | null>(null)
  const [warningsDialogOpen, setWarningsDialogOpen] = useState(false)

  const STATUS_TABS: { value: ReportStatus | 'ALL'; label: string }[] = [
    { value: 'PENDING', label: text.tabs.pending },
    { value: 'RESOLVED', label: text.tabs.resolved },
    { value: 'DISMISSED', label: text.tabs.dismissed },
    { value: 'ALL', label: text.tabs.all }
  ]

  const TAB_META: Record<
    ReportStatus | 'ALL',
    {
      icon: typeof Clock3
      summary: string
      color: 'primary' | 'success' | 'warning' | 'info' | 'destructive'
    }
  > = {
    PENDING: {
      icon: Clock3,
      summary: text.summaries.pending,
      color: 'warning'
    },
    RESOLVED: {
      icon: CheckCircle2,
      summary: text.summaries.resolved,
      color: 'success'
    },
    DISMISSED: {
      icon: XCircle,
      summary: text.summaries.dismissed,
      color: 'destructive'
    },
    ALL: {
      icon: Layers3,
      summary: text.summaries.all,
      color: 'info'
    }
  }

  const activeTab = (searchParams.get('status') as ReportStatus | 'ALL') ?? 'PENDING'
  const currentPage = Number(searchParams.get('page') ?? '0')

  const filters: ReportFilterParams = {
    status: activeTab === 'ALL' ? undefined : activeTab,
    page: currentPage,
    size: 20
  }

  const { data, isLoading } = useGroupedReports(filters)

  // Counts per tab
  const { data: pendingData } = useGroupedReports({ status: 'PENDING', page: 0, size: 1 })
  const { data: resolvedData } = useGroupedReports({ status: 'RESOLVED', page: 0, size: 1 })
  const { data: dismissedData } = useGroupedReports({ status: 'DISMISSED', page: 0, size: 1 })

  const pendingCount = pendingData?.data?.data?.totalItems
  const resolvedCount = resolvedData?.data?.data?.totalItems
  const dismissedCount = dismissedData?.data?.data?.totalItems
  const hasSummaryData = [pendingCount, resolvedCount, dismissedCount].some((v) => v !== undefined)
  const totalCount = (pendingCount ?? 0) + (resolvedCount ?? 0) + (dismissedCount ?? 0)

  const counts: Record<string, number | undefined> = {
    PENDING: pendingCount,
    RESOLVED: resolvedCount,
    DISMISSED: dismissedCount,
    ALL: hasSummaryData ? totalCount : undefined
  }

  const updateParams = (updates: Record<string, string | undefined>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v)
        else next.delete(k)
      })
      return next
    })
  }

  const handleTabChange = (tab: string) => {
    updateParams({ status: tab === 'PENDING' ? undefined : tab, page: undefined })
  }

  const handlePageChange = (page: number) => {
    updateParams({ page: page === 0 ? undefined : String(page) })
  }

  const handleProcess = (summary: ContentReportSummary) => {
    navigate(`/admin/reports/${summary.targetType}/${summary.targetId}`, { state: { summary } })
  }

  const handleViewWarnings = (userId: string) => {
    setWarningsUserId(userId)
    setWarningsDialogOpen(true)
  }

  const pageData = data?.data?.data
  const activeMeta = TAB_META[activeTab]
  const activeTotal = activeTab === 'ALL' ? counts.ALL : counts[activeTab]

  return (
    <div className='w-full space-y-6 pb-8'>
      <div className='mb-2 flex items-center gap-4'>
        <div className='rounded-lg bg-primary/10 p-2.5'>
          <ShieldAlert className='h-6 w-6 text-primary' />
        </div>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>{text.page.title}</h1>
          <p className='text-muted-foreground'>{text.page.description}</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {STATUS_TABS.map((tab) => {
          const meta = TAB_META[tab.value]
          return (
            <StatsCard
              key={`stats-${tab.value}`}
              title={tab.label}
              value={counts[tab.value] ?? '-'}
              subValue={meta.summary}
              icon={meta.icon}
              color={meta.color}
              loading={counts[tab.value] === undefined}
            />
          )
        })}
      </div>

      <Card className='p-4'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full lg:w-auto'>
            <TabsList className='h-auto rounded-lg bg-muted p-1'>
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    'h-9 rounded-md px-4 text-[13px] font-bold text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm',
                    tab.value === 'PENDING' && 'data-[state=active]:text-amber-600',
                    tab.value === 'RESOLVED' && 'data-[state=active]:text-emerald-600',
                    tab.value === 'DISMISSED' && 'data-[state=active]:text-slate-600',
                    tab.value === 'ALL' && 'data-[state=active]:text-primary'
                  )}
                >
                  {tab.label}
                  {counts[tab.value] !== undefined && (
                    <span
                      className={cn(
                        'ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        activeTab === tab.value ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground'
                      )}
                    >
                      {counts[tab.value]}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className='rounded-lg border border-border/70 bg-muted/20 px-4 py-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {text.page.statusViewing}
            </p>
            <p className='text-sm font-semibold'>
              {STATUS_TABS.find((tab) => tab.value === activeTab)?.label}
              <span className='ml-2 text-muted-foreground'>({activeTotal ?? '-'})</span>
            </p>
          </div>
        </div>
      </Card>

      <Card className='overflow-hidden border shadow-sm'>
        <div className='border-b bg-muted/20 px-4 py-3'>
          <p className='text-sm font-semibold'>{text.page.reportListTitle}</p>
          <p className='text-xs text-muted-foreground'>
            {activeMeta.summary}.{' '}
            {activeTotal !== undefined ? text.page.reportsCount(activeTotal) : text.page.loadingStats}
          </p>
        </div>

        <div className='p-4 sm:p-6'>
          <ReportsTable
            data={pageData}
            isLoading={isLoading}
            onProcess={handleProcess}
            onViewWarnings={handleViewWarnings}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>

      <UserWarningsDialog userId={warningsUserId} open={warningsDialogOpen} onOpenChange={setWarningsDialogOpen} />
    </div>
  )
}
