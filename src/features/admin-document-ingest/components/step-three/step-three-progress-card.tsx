import { CheckCircle2, Database, Loader2, ShieldCheck, Activity, Globe } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StepThreeProgressCardProps {
  ingestStatus: 'vectorizing' | 'finalizing' | 'success' | 'failed'
  statusLabel: string
  progress: number
  uploadedChunks: number
  totalChunks: number
  activeChunksLength: number
  currentVectorId: string | null
}

export function StepThreeProgressCard({
  ingestStatus,
  statusLabel,
  progress,
  uploadedChunks,
  totalChunks,
  activeChunksLength,
  currentVectorId
}: StepThreeProgressCardProps) {
  return (
    <div className='bg-dashboard-card-bg rounded-xl border border-border/40 shadow-sm overflow-hidden'>
      <div className='px-6 py-3 border-b border-section-divider bg-dashboard-card-header-bg flex items-center justify-between'>
        <h3 className='text-lg font-bold text-dashboard-header-text uppercase tracking-tight'>Visual Progress Card</h3>
        <Badge
          variant='outline'
          className={cn(
            'font-bold text-[10px] px-3 py-1 rounded-lg uppercase tracking-wide border',
            ingestStatus === 'success'
              ? 'bg-success-bg text-success-text border-success-border'
              : ingestStatus === 'failed'
                ? 'bg-destructive-subtle text-destructive-text border-destructive-border'
                : 'bg-dashboard-badge-bg text-muted-foreground border-border/60'
          )}
        >
          {statusLabel}
        </Badge>
      </div>

      <div className='p-6 space-y-6'>
        <div className='flex items-start gap-4'>
          <div
            className={cn(
              'h-14 w-14 rounded-xl border flex items-center justify-center shrink-0',
              ingestStatus === 'success'
                ? 'bg-success-bg border-success-border text-success-text'
                : ingestStatus === 'failed'
                  ? 'bg-destructive-subtle border-destructive-border text-destructive-text'
                  : 'bg-dashboard-icon-bg border-brand-blue-hover/30 text-brand-blue'
            )}
          >
            {ingestStatus === 'success' ? (
              <CheckCircle2 size={26} strokeWidth={2.2} />
            ) : (
              <div className='relative flex items-center justify-center'>
                <Database size={24} strokeWidth={2.2} />
                <Loader2 size={12} className='absolute -top-2.5 -right-2 animate-spin' />
              </div>
            )}
          </div>

          <div className='space-y-1'>
            <h2 className='text-2xl font-bold tracking-tight text-foreground uppercase'>
              {ingestStatus === 'success' ? 'Dữ liệu đã sẵn sàng' : 'Đang nạp dữ liệu vào hệ thống'}
            </h2>
            <p className='text-muted-foreground font-medium leading-relaxed'>
              {ingestStatus === 'success'
                ? 'Tài liệu đã được chuyển đổi thành mã nhúng và đồng bộ thành công vào cụm chỉ mục tìm kiếm.'
                : 'Hệ thống đang vector hóa dữ liệu, chuẩn hóa metadata và tạo chỉ mục để phục vụ truy vấn nhanh.'}
            </p>
          </div>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
              Tiến trình đồng bộ
            </span>
            <span className='text-sm font-bold text-brand-blue'>{Math.min(progress, 100)}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} className='h-2.5 bg-muted' />
          <p className='text-xs text-muted-foreground font-medium'>
            Da upload {uploadedChunks} tren tong {Math.max(totalChunks, activeChunksLength)} chunks
            {currentVectorId ? ` | Dang upload chunk ${currentVectorId}` : ''}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          {[
            { icon: ShieldCheck, label: 'Security', val: 'AES-256', color: 'text-brand-blue' },
            { icon: Activity, label: 'Performance', val: '0.4s ingest', color: 'text-success-text' },
            { icon: Globe, label: 'CDN Sync', val: 'Global node', color: 'text-primary' }
          ].map((stat, i) => (
            <div
              key={i}
              className='flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-dashboard-card-header-bg'
            >
              <div className='h-8 w-8 rounded-lg bg-dashboard-icon-bg border border-border/40 flex items-center justify-center'>
                <stat.icon size={15} className={stat.color} />
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                  {stat.label}
                </span>
                <span className='text-sm font-bold text-foreground'>{stat.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
