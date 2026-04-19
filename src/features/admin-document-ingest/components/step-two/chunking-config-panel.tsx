import { Settings2, Layers, Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ChunkingStrategy } from '../../schemas/ingest-document.schema'

interface ChunkingConfigPanelProps {
  strategy: ChunkingStrategy
  chunkSize: number
  overlap: number
  isProcessing: boolean
  onStrategyChange: (strategy: ChunkingStrategy) => void
  onChunkSizeChange: (value: number) => void
  onOverlapChange: (value: number) => void
  onProcess: () => void
}

const STRATEGIES: { id: ChunkingStrategy; label: string; desc: string }[] = [
  { id: 'fixed', label: 'Fixed-size', desc: 'Chia văn bản theo độ dài cứng nhắc' },
  { id: 'recursive', label: 'Recursive', desc: 'Phân tách thông minh theo cấu trúc câu' },
  { id: 'semantic', label: 'Semantic', desc: 'Sử dụng AI để nhóm theo ngữ nghĩa' },
  { id: 'excel_row', label: 'Excel Row', desc: 'Mỗi dòng bảng tính là một chunk độc lập' }
]

export function ChunkingConfigPanel({
  strategy,
  chunkSize,
  overlap,
  isProcessing,
  onStrategyChange,
  onChunkSizeChange,
  onOverlapChange,
  onProcess
}: ChunkingConfigPanelProps) {
  return (
    <aside className='xl:col-span-1 bg-dashboard-card-bg rounded-xl border border-border/40 shadow-sm overflow-hidden flex flex-col'>
      <div className='px-6 py-4 border-b border-section-divider bg-dashboard-card-header-bg space-y-4'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-lg bg-dashboard-icon-bg text-brand-blue border border-brand-blue-hover/30 flex items-center justify-center'>
            <Settings2 size={16} />
          </div>
          <h3 className='text-lg font-bold text-dashboard-header-text uppercase tracking-tight'>Cấu hình phân đoạn</h3>
        </div>

        <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Chiến lược phân đoạn</p>
        <div className='grid grid-cols-1 gap-2'>
          {STRATEGIES.map((item) => {
            const isSelected = strategy === item.id

            return (
              <div
                key={item.id}
                role='button'
                tabIndex={0}
                onClick={() => onStrategyChange(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onStrategyChange(item.id)
                  }
                }}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-all text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  isSelected
                    ? 'bg-brand-blue-light/20 border-brand-blue-hover/40'
                    : 'bg-background border-border/60 hover:border-brand-blue-hover/40 hover:bg-muted/40'
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onStrategyChange(item.id)
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Chọn chiến lược ${item.label}`}
                  className='mt-0.5 data-checked:bg-brand-blue-light data-checked:text-brand-blue data-checked:border-brand-blue'
                />
                <div className='flex flex-col items-start'>
                  <span className='text-[12px] font-bold uppercase tracking-wide text-foreground'>{item.label}</span>
                  <span className='text-[11px] mt-1 text-muted-foreground'>{item.desc}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Chunk Size</p>
            <Input
              type='number'
              value={chunkSize}
              onChange={(e) => onChunkSizeChange(parseInt(e.target.value))}
              className='h-10 bg-muted border-border rounded-lg font-semibold text-foreground text-sm'
            />
          </div>
          <div className='space-y-2'>
            <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Overlap (%)</p>
            <Input
              type='number'
              value={overlap}
              onChange={(e) => onOverlapChange(parseInt(e.target.value))}
              className='h-10 bg-muted border-border rounded-lg font-semibold text-foreground text-sm'
            />
          </div>
        </div>

        <div className='p-4 bg-brand-blue-light/20 rounded-lg flex gap-3 border border-brand-blue-hover/25'>
          <Info size={16} className='text-brand-blue shrink-0 mt-0.5' />
          <p className='text-[11px] text-muted-foreground font-medium leading-relaxed'>
            Kích thước đoạn đề xuất cho RAG thường là <b>512</b> hoặc <b>1024</b> tokens để đảm bảo đủ ngữ cảnh.
          </p>
        </div>
      </div>

      <div className='px-6 py-4 border-t border-section-divider bg-dashboard-card-header-bg'>
        <Button
          onClick={onProcess}
          disabled={isProcessing}
          className='w-full h-10 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all'
        >
          {isProcessing ? (
            <>
              Xử lý dữ liệu... <Loader2 className='ml-2 w-4 h-4 animate-spin' />
            </>
          ) : (
            <>
              Phân tách Chunks <Layers className='ml-2 w-4 h-4' />
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
