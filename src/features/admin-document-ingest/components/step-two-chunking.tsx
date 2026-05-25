import { useState } from 'react'
import { ChunkListSchema, type IngestState, type Chunk } from '../schemas/ingest-document.schema'
import { useChunkPreviewMutation } from '../queries/use-mutations'
import { ChunkingConfigPanel } from './step-two/chunking-config-panel'
import { ChunkListPanel } from './step-two/chunk-list-panel'

interface StepTwoChunkingProps {
  state: IngestState
  onUpdate: (update: Partial<IngestState>) => void
  onNext: () => void
}

export function StepTwoChunking({ state, onUpdate, onNext }: StepTwoChunkingProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const chunkPreviewMutation = useChunkPreviewMutation()
  const activeDocument = state.uploadedDocuments[0]
  const activeEmbeddingModel = activeDocument?.embeddingModel ?? 'text-embedding-3-small'

  const handleProcess = async () => {
    if (!activeDocument) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await chunkPreviewMutation.mutateAsync({
        docId: activeDocument.id,
        conversationId: state.conversationId,
        rawContent: state.rawContent,
        strategy: state.strategy,
        s3Key: activeDocument.sourceUrl,
        fileName: activeDocument.fileName,
        chunkSize: state.chunkSize,
        overlap: state.overlap
      })

      const parsedChunks = ChunkListSchema.safeParse(response.data.data.chunks as Chunk[])
      if (!parsedChunks.success) {
        return
      }

      onUpdate({ chunks: parsedChunks.data })
    } catch {
      onUpdate({ chunks: [] })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='grid grid-cols-1 xl:grid-cols-3 gap-8 h-150 animate-in fade-in slide-in-from-right-2 duration-500'>
      <ChunkingConfigPanel
        strategy={state.strategy}
        chunkSize={state.chunkSize}
        overlap={state.overlap}
        isProcessing={isProcessing}
        onStrategyChange={(strategy) => onUpdate({ strategy })}
        onChunkSizeChange={(value) => onUpdate({ chunkSize: value })}
        onOverlapChange={(value) => onUpdate({ overlap: value })}
        onProcess={handleProcess}
      />

      <ChunkListPanel chunks={state.chunks} activeEmbeddingModel={activeEmbeddingModel} onNext={onNext} />
    </div>
  )
}
