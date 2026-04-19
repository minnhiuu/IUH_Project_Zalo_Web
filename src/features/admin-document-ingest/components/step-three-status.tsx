import { useEffect, useMemo, useRef, useState } from 'react'
import { IngestDocumentStatus } from '@/constants/enum'
import { getDocuments, startIngest } from '../api/ingest.api'
import type { IngestState } from '../schemas/ingest-document.schema'
import { StepThreeProgressCard } from './step-three/step-three-progress-card'
import { StepThreeTerminalView } from './step-three/step-three-terminal-view'
import { StepThreeActions } from './step-three/step-three-actions'

interface StepThreeStatusProps {
  state: IngestState
  onUpdate: (update: Partial<IngestState>) => void
}

export function StepThreeStatus({ state, onUpdate }: StepThreeStatusProps) {
  const [ingestStatus, setIngestStatus] = useState<'vectorizing' | 'finalizing' | 'success' | 'failed'>('vectorizing')
  const [progress, setProgress] = useState(0)
  const [uploadedChunks, setUploadedChunks] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [currentVectorId, setCurrentVectorId] = useState<string | null>(null)
  const startedDocIdsRef = useRef<Set<string>>(new Set())
  const [terminalLines, setTerminalLines] = useState<string[]>([])

  const activeDocId = useMemo(
    () => state.chunks[0]?.docId ?? state.uploadedDocuments[0]?.id ?? null,
    [state.chunks, state.uploadedDocuments]
  )

  const activeDocument = useMemo(
    () => state.uploadedDocuments.find((doc) => doc.id === activeDocId) ?? state.uploadedDocuments[0],
    [activeDocId, state.uploadedDocuments]
  )

  const activeChunks = useMemo(
    () => (activeDocId ? state.chunks.filter((chunk) => chunk.docId === activeDocId) : state.chunks),
    [activeDocId, state.chunks]
  )

  useEffect(() => {
    if (!activeDocument || activeChunks.length === 0) {
      return
    }

    let cancelled = false
    const hasStartedIngest = startedDocIdsRef.current.has(activeDocument.id)
    if (!hasStartedIngest) {
      startedDocIdsRef.current.add(activeDocument.id)
    }

    const syncProgressFromServer = (doc: {
      status: string
      totalChunks: number
      uploadedChunks?: number
      currentVectorId?: string | null
      ingestLogs?: string[]
      errorMessage?: string | null
    }) => {
      const serverTotalChunks = Math.max(doc.totalChunks ?? 0, activeChunks.length)
      const serverUploadedChunks = doc.uploadedChunks ?? (doc.status === 'COMPLETED' ? serverTotalChunks : 0)

      setTotalChunks(serverTotalChunks)
      setUploadedChunks(serverUploadedChunks)
      setCurrentVectorId(doc.currentVectorId ?? null)

      if (serverTotalChunks > 0) {
        setProgress(Math.min(100, Math.round((serverUploadedChunks / serverTotalChunks) * 100)))
      } else {
        setProgress(doc.status === 'COMPLETED' ? 100 : 0)
      }

      if (doc.ingestLogs && doc.ingestLogs.length > 0) {
        setTerminalLines(doc.ingestLogs)
      }
      if (doc.status === 'FAILED' && doc.errorMessage) {
        setTerminalLines((prev) => {
          if (prev.some((line) => line.includes(doc.errorMessage ?? ''))) {
            return prev
          }
          return [...prev, `[ERROR] ${doc.errorMessage}`]
        })
      }
    }

    const runIngest = async () => {
      try {
        setTerminalLines((prev) => {
          if (prev.length > 0) {
            return prev
          }
          return ['[SYSTEM] Khoi dong ingest pipeline...']
        })

        if (!hasStartedIngest) {
          await startIngest({
            docId: activeDocument.id,
            conversationId: state.conversationId,
            chunks: activeChunks.map((chunk) => ({
              id: chunk.id,
              docId: chunk.docId,
              vectorId: chunk.vectorId,
              prevId: chunk.prevId,
              nextId: chunk.nextId,
              chunkContent: chunk.chunkContent,
              chunkIndex: chunk.chunkIndex,
              pageNumber: chunk.pageNumber,
              tokenCount: chunk.tokenCount
            }))
          })
        }

        for (let i = 0; i < 300; i += 1) {
          if (cancelled) {
            return
          }

          const docs = await getDocuments(state.conversationId)
          const current = docs.find((doc) => doc.id === activeDocument.id)
          if (!current) {
            await new Promise((resolve) => setTimeout(resolve, 800))
            continue
          }

          syncProgressFromServer(current)

          if (current?.status === 'COMPLETED') {
            setIngestStatus('success')
            setProgress(100)
            setUploadedChunks(Math.max(current.uploadedChunks ?? 0, current.totalChunks ?? activeChunks.length))
            setTotalChunks(Math.max(current.totalChunks ?? 0, activeChunks.length))
            onUpdate({
              uploadedDocuments: state.uploadedDocuments.map((doc) =>
                doc.id === activeDocument.id
                  ? {
                      ...doc,
                      status: IngestDocumentStatus.Completed,
                      totalChunks: current.totalChunks ?? activeChunks.length
                    }
                  : doc
              )
            })
            return
          }

          if (current?.status === 'FAILED') {
            setIngestStatus('failed')
            onUpdate({
              uploadedDocuments: state.uploadedDocuments.map((doc) =>
                doc.id === activeDocument.id ? { ...doc, status: IngestDocumentStatus.Failed } : doc
              )
            })
            return
          }

          setIngestStatus(current.uploadedChunks && current.uploadedChunks > 0 ? 'finalizing' : 'vectorizing')

          await new Promise((resolve) => setTimeout(resolve, 800))
        }

        setIngestStatus('failed')
        setTerminalLines((prev) => [...prev, '[ERROR] Timeout while waiting for ingest completion'])
      } catch {
        setIngestStatus('failed')
        setTerminalLines((prev) => [...prev, '[ERROR] Failed to start ingest job'])
      }
    }

    void runIngest()

    return () => {
      cancelled = true
    }
  }, [activeChunks, activeDocument, onUpdate, state.conversationId, state.uploadedDocuments])

  const statusLabel =
    ingestStatus === 'success'
      ? 'Hoàn tất'
      : ingestStatus === 'failed'
        ? 'Thất bại'
        : ingestStatus === 'finalizing'
          ? 'Đang hoàn tất'
          : 'Đang vector hóa'

  return (
    <div className='flex flex-col gap-6 w-full animate-in fade-in duration-500'>
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <StepThreeProgressCard
          ingestStatus={ingestStatus}
          statusLabel={statusLabel}
          progress={progress}
          uploadedChunks={uploadedChunks}
          totalChunks={totalChunks}
          activeChunksLength={activeChunks.length}
          currentVectorId={currentVectorId}
        />

        <StepThreeTerminalView terminalLines={terminalLines} />
      </div>

      <StepThreeActions onGoDashboard={() => (window.location.href = '/admin')} />
    </div>
  )
}
