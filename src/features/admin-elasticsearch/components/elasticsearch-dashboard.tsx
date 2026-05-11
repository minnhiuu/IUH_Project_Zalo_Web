import { useState, useEffect } from 'react'
import { Activity, Database, Zap, Terminal } from 'lucide-react'

import { useEsSummary, useReindexStatus, useEsHealth } from '../queries/use-queries'
import { elasticsearchKeys } from '../queries/keys'
import { useQueryClient } from '@tanstack/react-query'
import { useReindex, useReindexUser, useUpdateFailedEventResolved } from '../queries/use-mutations'
import { useElasticsearchText } from '../i18n/use-elasticsearch-text'
import { StatsCard } from './stats-card'
import { UserIndexTab } from './user-index-tab'
import { ControlBar } from './control-bar'
import { ReindexProgressBar } from './reindex-progress-bar'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router'
import { ElasticsearchClusterStatus, DataSyncStatus, ReindexTaskStatus, SearchIndexType } from '@/constants/enum'

export const ElasticsearchDashboard = () => {
  const { text } = useElasticsearchText()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeModule = (searchParams.get('tab') as 'users' | 'messages' | 'groups') || 'users'

  const setActiveModule = (value: 'users' | 'messages' | 'groups') => {
    setSearchParams({ tab: value })
  }

  const [userId, setUserId] = useState('')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const indexType = activeModule === 'messages' ? SearchIndexType.MESSAGE : SearchIndexType.USER

  const { data: summary, isLoading: summaryLoading } = useEsSummary(indexType)
  const stats = summary?.stats
  const compare = summary?.compare
  const failedEventsCount = summary?.failedEventsCount

  const { data: globalHealth } = useEsHealth()
  const { data: taskStatus } = useReindexStatus(indexType, activeTaskId)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (taskStatus?.status === ReindexTaskStatus.Completed) {
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: elasticsearchKeys.summary(indexType)
        })
        queryClient.invalidateQueries({
          queryKey: elasticsearchKeys.indexes(indexType)
        })
        toast.success(text.messages.reindexAllSuccess)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [taskStatus?.status, queryClient, text.messages.reindexAllSuccess, indexType])

  const reindexMutation = useReindex()
  const reindexUserMutation = useReindexUser()
  const updateResolvedMutation = useUpdateFailedEventResolved()

  const handleReindexAll = () => {
    if (activeModule === 'groups') {
      toast.error(text.messages.notImplemented)
      return
    }

    reindexMutation.mutate(indexType, {
      onSuccess: (data) => {
        setActiveTaskId(data.taskId)
      }
    })
  }

  const isReindexingAll = reindexMutation.isPending || taskStatus?.status === ReindexTaskStatus.Running

  return (
    <div className='flex flex-col gap-8 pb-10 animate-in fade-in duration-500'>
      <div className='flex flex-col gap-2 mb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-5'>
            <div className='flex flex-col gap-0.5'>
              <h1 className='text-3xl font-bold tracking-tight text-foreground uppercase'>
                {text.dashboard.headerTitle}
              </h1>
              <p className='text-muted-foreground font-medium text-[14px] leading-tight'>
                {text.dashboard.headerSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ControlBar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        userId={userId}
        setUserId={setUserId}
        onReindexUser={(id) => reindexUserMutation.mutate(id)}
        onReindexAll={handleReindexAll}
        isReindexingUser={reindexUserMutation.isPending}
        isReindexingAll={isReindexingAll}
        modulesText={text.modules}
        isUpdatingFailedEventResolved={updateResolvedMutation.isPending}
        failedEventsCount={failedEventsCount || 0}
      />

      {activeTaskId && <ReindexProgressBar status={taskStatus} onClose={() => setActiveTaskId(null)} />}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatsCard
          title={text.health.title}
          value={
            globalHealth?.status === ElasticsearchClusterStatus.Green ? text.health.healthy : globalHealth?.status || 'Unknown'
          }
          subValue={globalHealth?.clusterName || text.dashboard.connecting}
          icon={Activity}
          color={globalHealth?.status === ElasticsearchClusterStatus.Green ? 'success' : 'warning'}
          loading={summaryLoading}
        />
        <StatsCard
          title={text.stats.documents}
          value={stats?.documentCount?.toLocaleString() || '0'}
          subValue={`${text.stats.storage}: ${stats?.totalStoreSize || 'N/A'}`}
          icon={Database}
          color='info'
          loading={summaryLoading}
        />
        <StatsCard
          title={text.compare.title}
          value={compare?.difference?.toLocaleString() || '0'}
          subValue={
            compare?.status === DataSyncStatus.InSync
              ? text.userTab.badges.match
              : text.userTab.badges.missMatch
          }
          icon={Zap}
          color={
            compare?.status === DataSyncStatus.InSync
              ? 'success'
              : 'destructive'
          }
          loading={summaryLoading}
        />
        <StatsCard
          title={text.stats.shards}
          value={stats?.numberOfShards || 0}
          subValue={text.dashboard.primaryActive}
          icon={Terminal}
          color='primary'
          loading={summaryLoading}
        />
      </div>

      <div className='flex flex-col gap-6'>
        {(activeModule === 'users' || activeModule === 'messages') && (
           <UserIndexTab activeModule={activeModule} type={indexType} />
        )}
        {activeModule === 'groups' && (
          <div className='p-12 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground animate-in fade-in zoom-in-95 duration-500'>
            <Activity className='h-12 w-12 mb-4 opacity-20' />
            <p className='font-bold uppercase tracking-widest text-[12px]'>{text.dashboard.groupsComingSoon}</p>
          </div>
        )}
      </div>
    </div>
  )
}
