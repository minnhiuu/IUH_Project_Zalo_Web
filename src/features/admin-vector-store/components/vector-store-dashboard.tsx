import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Database, Layers, Activity, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { vectorStoreApi, type VectorStoreStats } from '../api/vector-store.api'

const COLLECTION_LABELS: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  post_vectors: {
    label: 'Post Vectors',
    icon: <Layers className='w-5 h-5 text-violet-400' />,
    description: 'Dense embeddings for every published post, used for semantic similarity search.',
  },
  user_vectors: {
    label: 'User Vectors',
    icon: <Activity className='w-5 h-5 text-blue-400' />,
    description: 'Dynamic interest profiles for each user, blended from their interactions and baseline interests.',
  },
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'green') {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'>
        <CheckCircle className='w-3 h-3' /> Healthy
      </span>
    )
  }
  if (status === 'yellow') {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25'>
        <Clock className='w-3 h-3' /> Optimizing
      </span>
    )
  }
  if (status === 'ERROR') {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 ring-1 ring-red-500/25'>
        <AlertTriangle className='w-3 h-3' /> Error
      </span>
    )
  }
  return (
    <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/25'>
      {status}
    </span>
  )
}

function StatItem({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>{label}</span>
      <span className='text-xl font-bold tabular-nums'>{typeof value === 'number' ? value.toLocaleString() : value}</span>
      {sub && <span className='text-xs text-muted-foreground'>{sub}</span>}
    </div>
  )
}

function CollectionCard({ name, stats }: { name: string; stats: VectorStoreStats[keyof VectorStoreStats] }) {
  const meta = COLLECTION_LABELS[name]
  const indexRatio = stats.vectors_count > 0
    ? Math.round((stats.indexed_vectors_count / stats.vectors_count) * 100)
    : 0

  return (
    <div className='rounded-xl border border-border bg-card p-5 flex flex-col gap-5'>
      {/* Header */}
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-muted border border-border shrink-0'>
            {meta?.icon ?? <Database className='w-5 h-5 text-muted-foreground' />}
          </div>
          <div>
            <h3 className='font-semibold text-sm'>{meta?.label ?? name}</h3>
            <p className='text-xs text-muted-foreground mt-0.5'>{name}</p>
          </div>
        </div>
        <StatusBadge status={stats.status} />
      </div>

      {stats.error ? (
        <p className='text-sm text-red-400'>{stats.error}</p>
      ) : (
        <>
          {/* Stats grid */}
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
            <StatItem label='Total Vectors' value={stats.vectors_count} />
            <StatItem label='Points' value={stats.points_count} />
            <StatItem label='Indexed' value={stats.indexed_vectors_count} />
            <StatItem label='Segments' value={stats.segments_count} />
          </div>

          {/* Index progress bar */}
          <div className='space-y-1.5'>
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>Index coverage</span>
              <span className='font-medium text-foreground'>{indexRatio}%</span>
            </div>
            <div className='w-full bg-muted rounded-full h-1.5 overflow-hidden'>
              <div
                className='h-1.5 rounded-full transition-all duration-700'
                style={{
                  width: `${indexRatio}%`,
                  background: indexRatio >= 90 ? 'hsl(142 70% 50%)' : indexRatio >= 60 ? 'hsl(45 90% 55%)' : 'hsl(0 72% 55%)',
                }}
              />
            </div>
          </div>

          {/* Config pills */}
          <div className='flex flex-wrap gap-2'>
            <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-xs font-mono border border-border'>
              <Zap className='w-3 h-3' /> dim: {stats.vector_size}
            </span>
            <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-xs font-mono border border-border'>
              metric: {stats.distance?.toLowerCase()}
            </span>
          </div>

          {/* Description */}
          {meta?.description && (
            <p className='text-xs text-muted-foreground leading-relaxed border-t border-border pt-3'>
              {meta.description}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export function VectorStoreDashboard() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<VectorStoreStats | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await vectorStoreApi.getStats()
      setStats(res.data.data ?? null)
      setLastRefreshed(new Date())
    } catch {
      showErrorToast('Không thể tải thông tin vector store.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleSyncAllUsers = async () => {
    try {
      setIsSyncing(true)
      const res = await vectorStoreApi.syncAllUsers()
      const synced = res.data?.data?.total_synced ?? '?'
      showSuccessToast(`Đồng bộ thành công ${synced} user profiles vào vector store.`)
      await fetchStats()
    } catch {
      showErrorToast('Không thể đồng bộ vector người dùng. Vui lòng thử lại sau.')
    } finally {
      setIsSyncing(false)
    }
  }

  const totalVectors = stats
    ? Object.values(stats).reduce((sum, c) => sum + (c.vectors_count ?? 0), 0)
    : 0

  return (
    <div className='p-6 space-y-6 max-w-6xl mx-auto'>
      {/* Page header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Vector Store</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Qdrant — semantic search &amp; recommendation engine storage
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border bg-muted hover:bg-muted/80 disabled:opacity-50 transition-colors'
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSyncAllUsers}
            disabled={isSyncing}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity'
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang đồng bộ...' : 'Sync User Profiles'}
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {[
          { label: 'Collections', value: stats ? Object.keys(stats).length : '—' },
          { label: 'Total Vectors', value: stats ? totalVectors.toLocaleString() : '—' },
          { label: 'User Vectors', value: stats?.user_vectors?.vectors_count?.toLocaleString() ?? '—' },
          { label: 'Post Vectors', value: stats?.post_vectors?.vectors_count?.toLocaleString() ?? '—' },
        ].map(item => (
          <div key={item.label} className='rounded-lg border border-border bg-card px-4 py-3'>
            <p className='text-xs text-muted-foreground'>{item.label}</p>
            <p className='text-2xl font-bold tabular-nums mt-0.5'>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Collection cards */}
      {isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2'>
          {[0, 1].map(i => (
            <div key={i} className='rounded-xl border border-border bg-card p-5 h-56 animate-pulse' />
          ))}
        </div>
      ) : stats ? (
        <div className='grid gap-4 sm:grid-cols-2'>
          {Object.entries(stats).map(([name, colStats]) => (
            <CollectionCard key={name} name={name} stats={colStats} />
          ))}
        </div>
      ) : (
        <div className='text-sm text-muted-foreground text-center py-12'>
          Không thể tải dữ liệu từ Qdrant.
        </div>
      )}

      {lastRefreshed && (
        <p className='text-xs text-muted-foreground text-right'>
          Last refreshed: {lastRefreshed.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
