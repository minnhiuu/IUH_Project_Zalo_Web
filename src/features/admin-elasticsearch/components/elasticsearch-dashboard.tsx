import { useState, useEffect } from 'react'
import { Activity, Database, Zap, Terminal } from 'lucide-react'

import { useEsSummary, useReindexStatus } from '../queries/use-queries'
import { elasticsearchKeys } from '../queries/keys'
import { useQueryClient } from '@tanstack/react-query'
import { useReindexUsers, useReindexUser } from '../queries/use-mutations'
import { useElasticsearchText } from '../i18n/use-elasticsearch-text'
import { StatsCard } from './stats-card'
import { UserIndexTab } from './user-index-tab'
import { ControlBar } from './control-bar'
import { ReindexProgressBar } from './reindex-progress-bar'
import { toast } from 'sonner'
import { ElasticsearchClusterStatus, DataSyncStatus, ReindexTaskStatus } from '@/constants/enum'

export const ElasticsearchDashboard = () => {
  const { text } = useElasticsearchText()
  const [userId, setUserId] = useState('')
  const [activeModule, setActiveModule] = useState<'users' | 'messages' | 'groups'>('users')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const { data: summary, isLoading: summaryLoading } = useEsSummary()
  const health = summary?.health
  const stats = summary?.stats
  const compare = summary?.compare
  const deadEventsCount = summary?.deadEventsCount

  const { data: taskStatus } = useReindexStatus(activeTaskId)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (taskStatus?.status === ReindexTaskStatus.Completed) {
      queryClient.invalidateQueries({
        queryKey: elasticsearchKeys.summary()
      })
      queryClient.invalidateQueries({
        queryKey: elasticsearchKeys.indexes()
      })
    }
  }, [taskStatus?.status, queryClient])

  const reindexUsersMutation = useReindexUsers()
  const reindexUserMutation = useReindexUser()

  const handleReindexAll = () => {
    switch (activeModule) {
      case 'users':
        reindexUsersMutation.mutate(undefined, {
          onSuccess: (data) => {
            setActiveTaskId(data.taskId)
          }
        })
        break
      case 'messages':
        toast.error(text.messages.notImplemented)
        break
      case 'groups':
        toast.error(text.messages.notImplemented)
        break
    }
  }

  const isReindexingAll =
    activeModule === 'users'
      ? reindexUsersMutation.isPending || taskStatus?.status === ReindexTaskStatus.Running
      : activeModule === 'messages'
        ? false
        : activeModule === 'groups'
          ? false
          : false

  const isModuleActive = activeModule === 'users'

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
        isRetryingDeadEvents={false}
        deadEventsCount={deadEventsCount || 0}
      />

      {activeTaskId && <ReindexProgressBar status={taskStatus} onClose={() => setActiveTaskId(null)} />}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatsCard
          title={text.health.title}
          value={
            health?.status === ElasticsearchClusterStatus.Green ? text.health.healthy : health?.status || 'Unknown'
          }
          subValue={health?.clusterName || text.dashboard.connecting}
          icon={Activity}
          color={health?.status === ElasticsearchClusterStatus.Green ? 'success' : 'warning'}
          loading={summaryLoading}
        />
        <StatsCard
          title={text.stats.documents}
          value={isModuleActive ? stats?.documentCount.toLocaleString() || '0' : '—'}
          subValue={isModuleActive ? `${text.stats.storage}: ${stats?.totalStoreSize || 'N/A'}` : text.dashboard.noData}
          icon={Database}
          color='info'
          loading={isModuleActive && summaryLoading}
        />
        <StatsCard
          title={text.compare.title}
          value={isModuleActive ? compare?.difference.toLocaleString() || '0' : '—'}
          subValue={
            isModuleActive
              ? compare?.status === DataSyncStatus.InSync
                ? text.userTab.badges.match
                : text.userTab.badges.missMatch
              : text.dashboard.noData
          }
          icon={Zap}
          color={
            isModuleActive && compare?.status === DataSyncStatus.InSync
              ? 'success'
              : isModuleActive
                ? 'destructive'
                : 'primary'
          }
          loading={isModuleActive && summaryLoading}
        />
        <StatsCard
          title={text.stats.shards}
          value={isModuleActive ? stats?.numberOfShards || 0 : '—'}
          subValue={isModuleActive ? text.dashboard.primaryActive : text.dashboard.notDefined}
          icon={Terminal}
          color='primary'
          loading={isModuleActive && summaryLoading}
        />
      </div>

      <div className='flex flex-col gap-6'>
        {activeModule === 'users' && <UserIndexTab activeModule={activeModule} />}
        {activeModule === 'messages' && (
          <div className='p-12 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground animate-in fade-in zoom-in-95 duration-500'>
            <Database className='h-12 w-12 mb-4 opacity-20' />
            <p className='font-bold uppercase tracking-widest text-[12px]'>{text.dashboard.messagesComingSoon}</p>
          </div>
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
