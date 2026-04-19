import { Layers, Search, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Chunk } from '../../schemas/ingest-document.schema'
import { useIngestText } from '../../i18n/use-ingest-text'

interface ChunkListPanelProps {
  chunks: Chunk[]
  activeEmbeddingModel: string
  onNext: () => void
}

export function ChunkListPanel({ chunks, activeEmbeddingModel, onNext }: ChunkListPanelProps) {
  const { text } = useIngestText()

  return (
    <section className='xl:col-span-2 bg-dashboard-card-bg rounded-xl border border-border/40 shadow-sm overflow-hidden flex flex-col'>
      <div className='px-6 py-3 border-b border-section-divider bg-dashboard-card-header-bg flex items-center justify-between gap-4'>
        <h3 className='text-lg font-bold text-dashboard-header-text uppercase tracking-tight'>{text.stepTwo.list.title}</h3>
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='font-bold text-[10px] px-3 py-1 bg-dashboard-badge-bg text-muted-foreground border-border/60 rounded-lg shrink-0'
          >
            {text.stepTwo.list.count(chunks.length)}
          </Badge>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 bg-muted/20'>
        {chunks.length > 0 ? (
          <div className='grid grid-cols-1 gap-3'>
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className='group bg-background border border-border/60 rounded-lg p-4 hover:border-brand-blue-hover/40 hover:bg-brand-blue-light/10 transition-all'
              >
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <span className='text-[10px] font-bold text-white bg-brand-blue px-2 py-1 rounded-md tracking-widest'>
                      #{chunk.chunkIndex.toString().padStart(2, '0')}
                    </span>
                    <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5'>
                      <Clock size={12} /> {chunk.tokenCount} {text.stepTwo.list.tokenSuffix}
                    </span>
                  </div>
                  <Button variant='ghost' className='h-8 w-8 p-0 rounded-lg hover:bg-muted text-muted-foreground'>
                    <Search size={14} />
                  </Button>
                </div>

                <div>
                  <p className='text-sm text-foreground/90 leading-relaxed font-medium line-clamp-3 group-hover:line-clamp-none transition-all'>
                    "{chunk.chunkContent}"
                  </p>
                  <div className='mt-3 flex justify-end'>
                    <span className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                      {text.stepTwo.list.pageNumber}: {chunk.pageNumber} | {activeEmbeddingModel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='h-full flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl bg-background gap-4'>
            <div className='w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/60'>
              <Layers size={32} strokeWidth={1.5} />
            </div>
            <p className='text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center max-w-65 leading-relaxed'>
              {text.stepTwo.list.empty}
            </p>
          </div>
        )}
      </div>

      {chunks.length > 0 && (
        <div className='px-6 py-3 border-t border-section-divider bg-dashboard-card-header-bg flex justify-end'>
          <Button
            onClick={onNext}
            className='h-10 px-6 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-xs uppercase tracking-widest rounded-lg group'
          >
            {text.stepTwo.list.next}
            <ChevronRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
          </Button>
        </div>
      )}
    </section>
  )
}
