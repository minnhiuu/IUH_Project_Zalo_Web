import { Database, RotateCcw, Trash2, Clock, FileText, HardDrive } from 'lucide-react'
import { useEsSummary, useEsIndexes } from '../queries/use-queries'
import { useElasticsearchText } from '../i18n/use-elasticsearch-text'
import { ELASTICSEARCH_KEYS } from '../i18n/elasticsearch.keys'
import { useDeleteIndex, useSwitchAlias } from '../queries/use-mutations'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCompactDateTime } from '@/utils/date'
import { DataSyncStatus, IndexStatus } from '@/constants/enum'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/path'
import { ExternalLink } from 'lucide-react'
import { SearchIndexType } from '@/constants/enum'

const StatusRow = ({
  label,
  value,
  color,
  tooltip
}: {
  label: string
  value: React.ReactNode
  color?: string
  tooltip?: string
}) => {
  return (
    <div
      className='flex justify-between border-b border-dashed border-border/40 pb-2 cursor-default group'
      title={tooltip}
    >
      <span className='text-[16px] text-accent-foreground font-semibold tracking-tight group-hover:text-brand-blue transition-colors'>
        {label}
      </span>
      <span className={cn('font-bold tabular-nums text-muted-foreground text-[16px]', color)}>{value ?? '—'}</span>
    </div>
  )
}

interface UserIndexTabProps {
  activeModule: 'users' | 'messages' | 'groups'
  type: SearchIndexType
}

export const UserIndexTab = ({ activeModule, type }: UserIndexTabProps) => {
  const { text, t } = useElasticsearchText()
  const { data: summary } = useEsSummary(type)
  const stats = summary?.stats
  const compare = summary?.compare
  const failedEventsCount = summary?.failedEventsCount
  const health = summary?.health

  const { data: indexes, isLoading: indexesLoading } = useEsIndexes(type)

  const navigate = useNavigate()
  const deleteIndexMutation = useDeleteIndex()
  const switchAliasMutation = useSwitchAlias()

  const handleSwitchAlias = (indexName: string) => {
    switchAliasMutation.mutate({ type, indexName })
  }

  return (
    <div className='flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500'>
      <Card className='rounded-xl border border-border/40 bg-dashboard-card-bg shadow-sm overflow-hidden'>
        <div className='px-5 py-3 border-b border-section-divider flex items-center justify-between bg-dashboard-card-header-bg'>
          <div className='flex items-center gap-3'>
            <h3 className='text-lg font-bold text-dashboard-header-text uppercase tracking-tight'>
              {text.userTab.statusCardTitle} · {activeModule}
            </h3>
          </div>
          {compare?.status === DataSyncStatus.InSync ? (
            <Badge className='bg-success-bg text-success-text border-success-border text-[10px] font-bold px-2 py-0.5 shadow-none rounded-md uppercase'>
              {text.userTab.badges.sync}
            </Badge>
          ) : (
            <Badge className='bg-[#FF4D4F] text-white border-none text-[11px] font-bold px-2.5 py-0.5 shadow-sm rounded-md uppercase tracking-wider animate-pulse flex items-center gap-1.5'>
              <div className='h-1.5 w-1.5 rounded-full bg-white animate-pulse' />
              {text.userTab.badges.diff}
            </Badge>
          )}
        </div>

        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-12'>
            <StatusRow
              label={text.stats.documents}
              value={stats?.documentCount?.toLocaleString()}
              tooltip={text.userTab.tooltips.totalDocs}
            />
            <StatusRow
              label={text.stats.storage}
              value={stats?.primaryStoreSize}
              tooltip={text.userTab.tooltips.storageSize}
            />
            <StatusRow
              label={text.health.index}
              value={health?.currentIndexName}
              tooltip={text.userTab.tooltips.currentIndex}
            />
            <StatusRow
              label={text.health.alias}
              value={health?.aliasName}
              tooltip={text.userTab.tooltips.aliasName}
            />
            <StatusRow
              label={text.stats.shards}
              value={stats?.numberOfShards}
              tooltip={text.userTab.tooltips.shards}
            />
            <StatusRow
              label={text.stats.replicas}
              value={stats?.numberOfReplicas}
              tooltip={text.userTab.tooltips.replicas}
            />
            <StatusRow
              label={text.compare.mongodb}
              value={compare?.databaseCount?.toLocaleString()}
              tooltip={text.userTab.tooltips.mongodbCount}
            />
            <StatusRow
              label={text.compare.elasticsearch}
              value={compare?.elasticsearchCount?.toLocaleString()}
              tooltip={text.userTab.tooltips.esCount}
            />
            <StatusRow
              label={text.compare.title}
              tooltip={text.userTab.tooltips.integrity}
              value={
                <span
                  className={cn(
                    'font-black tracking-wide',
                    compare?.status === DataSyncStatus.InSync ? 'text-success-text' : 'text-destructive-text'
                  )}
                >
                  {compare?.status === DataSyncStatus.InSync
                    ? text.userTab.badges.match
                    : text.userTab.badges.missMatch}
                </span>
              }
            />
            {failedEventsCount && failedEventsCount > 0 ? (
              <div
                className='cursor-pointer group'
                onClick={() => navigate(`${PATHS.ADMIN.FAILED_EVENTS}?type=${type}`)}
              >
                <StatusRow
                  label={text.userTab.deadEventsLabel}
                  value={
                    <div className='flex items-center gap-2'>
                      <span>{failedEventsCount}</span>
                      <ExternalLink className='h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity' />
                    </div>
                  }
                  color='text-warning-text font-bold'
                  tooltip={t(ELASTICSEARCH_KEYS.userTab.deadEventsTooltip, { count: failedEventsCount })}
                />
              </div>
            ) : (
              <StatusRow
                label={text.userTab.deadEventsLabel}
                value={0}
                tooltip={text.userTab.tooltips.dlq}
              />
            )}
          </div>

          {compare?.recommendation && (
            <div
              className={cn(
                'mt-6 p-3 rounded-lg border text-[13px] font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300',
                compare.status === DataSyncStatus.InSync
                  ? 'bg-success-bg/10 border-success-border/20 text-success-text'
                  : 'bg-destructive/5 border-destructive/20 text-destructive'
              )}
            >
              <div className='h-2 w-2 rounded-full shrink-0 animate-pulse bg-current' />
              {compare.recommendation}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='bg-dashboard-card-bg rounded-xl border border-border/40 shadow-sm overflow-hidden'>
        <div className='px-6 py-3 border-b border-section-divider flex items-center justify-between gap-4 bg-dashboard-card-header-bg'>
          <h3 className='text-lg font-bold text-dashboard-header-text uppercase tracking-tight shrink-0'>
            {text.userTab.listTitle}
          </h3>

          <Badge
            variant='outline'
            className='font-bold text-[10px] px-3 py-1 bg-dashboard-badge-bg text-muted-foreground border-border/60 rounded-lg shrink-0'
          >
            {indexesLoading ? text.dashboard.loading : `${text.userTab.total}: ${indexes?.length || 0}`}
          </Badge>
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-transparent border-b border-border/40 h-10'>
                <TableHead className='font-bold text-foreground text-[15px] uppercase px-6 w-12'>#</TableHead>
                <TableHead className='font-bold text-foreground text-[15px] uppercase tracking-wide'>
                  {text.userTab.table.indexName}
                </TableHead>
                <TableHead className='font-bold text-foreground text-[15px] uppercase tracking-wide'>
                  {text.userTab.table.docs}
                </TableHead>
                <TableHead className='font-bold text-foreground text-[15px] uppercase tracking-wide'>
                  {text.userTab.table.storage}
                </TableHead>
                <TableHead className='font-bold text-foreground text-[15px] uppercase tracking-wide'>
                  {text.userTab.table.created}
                </TableHead>
                <TableHead className='font-bold text-foreground text-[15px] uppercase text-center tracking-wide'>
                  {text.userTab.table.status}
                </TableHead>
                <TableHead className='w-24 px-6 text-right'>{text.userTab.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indexesLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i} className='h-14 animate-pulse'>
                      <TableCell colSpan={7} className='px-6'>
                        <div className='h-4 bg-muted rounded-md w-full' />
                      </TableCell>
                    </TableRow>
                  ))
                : indexes?.map((idx, i) => (
                    <TableRow
                      key={idx.indexName}
                      className='h-14 border-b border-section-divider hover:bg-muted/10 transition-colors'
                    >
                      <TableCell className='px-6 font-mono text-[15px] text-muted-foreground font-medium'>
                        {(i + 1).toString().padStart(2, '0')}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='h-7 w-7 rounded-lg bg-dashboard-icon-bg flex items-center justify-center border border-brand-blue-hover/30 text-brand-blue'>
                            <Database className='h-3.5 w-3.5' />
                          </div>
                          <span className='font-mono font-bold text-[15px] text-foreground tracking-tight'>
                            {idx.indexName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1.5 text-muted-foreground font-semibold'>
                          <FileText className='h-3.5 w-3.5 opacity-40' />
                          <span className='text-[15px] tabular-nums'>{idx.docCount?.toLocaleString() ?? 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1.5 text-muted-foreground font-semibold'>
                          <HardDrive className='h-3.5 w-3.5 opacity-40' />
                          <span className='text-[15px] tabular-nums'>{idx.primaryStoreSize}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1.5 text-muted-foreground font-semibold'>
                          <Clock className='h-3.5 w-3.5 opacity-40' />
                          <span className='text-[11px] uppercase tracking-wider'>
                            {formatCompactDateTime(idx.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-center'>
                        {idx.status === IndexStatus.Active ? (
                          <Badge className='bg-success-solid text-white border-none text-[10px] font-bold px-2 h-5 rounded uppercase tracking-tighter shadow-sm'>
                            {text.userTab.badges.active}
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='text-[10px] font-bold px-2 h-5 rounded uppercase text-muted-foreground/60 border-border/60 bg-dashboard-badge-bg'
                          >
                            {text.userTab.badges.standby}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-right px-4'>
                        <div className='flex items-center justify-end gap-1'>
                          {idx.status !== IndexStatus.Active && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8 text-brand-blue hover:text-brand-blue-dark hover:bg-brand-blue-light/50'
                                    title={text.userTab.dialogs.switchAlias.confirm}
                                  >
                                    <RotateCcw className='h-4 w-4' />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{text.userTab.dialogs.switchAlias.title}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t(ELASTICSEARCH_KEYS.userTab.dialogs.switchAlias.description, {
                                        indexName: idx.indexName
                                      })}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{text.userTab.dialogs.cancel}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleSwitchAlias(idx.indexName)}
                                      className='bg-brand-blue hover:bg-brand-blue-dark'
                                    >
                                      {text.userTab.dialogs.switchAlias.confirm}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8 text-destructive hover:text-destructive-solid hover:bg-destructive-subtle'
                                    title={text.userTab.dialogs.deleteIndex.confirm}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{text.userTab.dialogs.deleteIndex.title}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t(ELASTICSEARCH_KEYS.userTab.dialogs.deleteIndex.description, {
                                        indexName: idx.indexName
                                      })}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{text.userTab.dialogs.cancel}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteIndexMutation.mutate(idx.indexName)}
                                      className='bg-destructive hover:bg-destructive-solid'
                                    >
                                      {text.userTab.dialogs.deleteIndex.confirm}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
