import { useEffect, useMemo, useRef, useState } from 'react'
import { IngestDocumentStatus } from '@/constants/enum'
import type { IngestState } from '../schemas/ingest-document.schema'
import { useStartIngestMutation } from '../queries/use-mutations'
import { useIngestDocumentsQuery } from '../queries/use-queries'
import { StepThreeProgressCard } from './step-three/step-three-progress-card'
import { StepThreeTerminalView } from './step-three/step-three-terminal-view'
import { StepThreeActions } from './step-three/step-three-actions'
import { useIngestText } from '../i18n/use-ingest-text'

interface StepThreeStatusProps {
  state: IngestState
  onUpdate: (update: Partial<IngestState>) => void
}

export function StepThreeStatus({ state, onUpdate }: StepThreeStatusProps) {
  const { text } = useIngestText()
  const runtimeStartingText = text.stepThree.runtime.systemStarting
  const runtimeNoProgressText = text.stepThree.runtime.noProgress
  const runtimeTimeoutText = text.stepThree.runtime.timeout
  const runtimeStartFailedText = text.stepThree.runtime.startFailed

  const [ingestStatus, setIngestStatus] = useState<'vectorizing' | 'finalizing' | 'success' | 'failed'>('vectorizing')
  const [progress, setProgress] = useState(0)
  const [uploadedChunks, setUploadedChunks] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [currentVectorId, setCurrentVectorId] = useState<string | null>(null)
  const { refetch: refetchDocuments } = useIngestDocumentsQuery(state.conversationId, false)
  const { mutateAsync: startIngest } = useStartIngestMutation()
  const activePollingDocIdRef = useRef<string | null>(null)
  const latestUploadedDocumentsRef = useRef(state.uploadedDocuments)
  const activeChunksRef = useRef<IngestState['chunks']>([])
  const refetchDocumentsRef = useRef(refetchDocuments)
  const startIngestRef = useRef(startIngest)
  const onUpdateRef = useRef(onUpdate)
  const [terminalLines, setTerminalLines] = useState<string[]>([])

  const activeDocId = useMemo(
    () => state.chunks[0]?.docId ?? state.uploadedDocuments[0]?.id ?? null,
    [state.chunks, state.uploadedDocuments]
  )

  const activeChunks = useMemo(
    () => (activeDocId ? state.chunks.filter((chunk) => chunk.docId === activeDocId) : state.chunks),
    [activeDocId, state.chunks]
  )

  useEffect(() => {
    latestUploadedDocumentsRef.current = state.uploadedDocuments
  }, [state.uploadedDocuments])

  useEffect(() => {
    activeChunksRef.current = activeChunks
  }, [activeChunks])

  useEffect(() => {
    refetchDocumentsRef.current = refetchDocuments
  }, [refetchDocuments])

  useEffect(() => {
    startIngestRef.current = startIngest
  }, [startIngest])

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    const frozenChunks = activeChunksRef.current

    if (!activeDocId || frozenChunks.length === 0) {
      return
    }

    if (activePollingDocIdRef.current === activeDocId) {
      return
    }
    activePollingDocIdRef.current = activeDocId

    let cancelled = false

    const syncProgressFromServer = (doc: {
      status: string
      totalChunks: number
      uploadedChunks?: number
      currentVectorId?: string | null
      ingestLogs?: string[]
      errorMessage?: string | null
    }) => {
      const serverTotalChunks = Math.max(doc.totalChunks ?? 0, frozenChunks.length)
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
          return [runtimeStartingText]
        })

        const initialDocsResponse = await refetchDocumentsRef.current()
        const initialDocs = initialDocsResponse.data ?? []
        const initialCurrent = initialDocs.find((doc) => doc.id === activeDocId)
        let shouldStartIngest = true
        if (initialCurrent) {
          syncProgressFromServer(initialCurrent)
          const initialServerTotalChunks = initialCurrent.totalChunks ?? 0
          const initialTotalChunks = Math.max(initialCurrent.totalChunks ?? 0, frozenChunks.length)
          const initialUploadedChunks = initialCurrent.uploadedChunks ?? 0
          const initialReachedChunkTarget =
            initialTotalChunks > 0 &&
            initialUploadedChunks >= initialTotalChunks &&
            (initialCurrent.currentVectorId ?? null) === null

          if (initialCurrent.status === 'COMPLETED' || initialReachedChunkTarget) {
            setIngestStatus('success')
            setProgress(100)
            setUploadedChunks(Math.max(initialUploadedChunks, initialTotalChunks))
            setTotalChunks(initialTotalChunks)
            return
          }

          if (initialCurrent.status === 'FAILED') {
            setIngestStatus('failed')
            return
          }

          const initialInProgress =
            initialCurrent.status === 'INGESTING' &&
            initialServerTotalChunks > 0 &&
            initialUploadedChunks < initialServerTotalChunks
          if (initialInProgress) {
            shouldStartIngest = false
          }
        }

        if (shouldStartIngest) {
          await startIngestRef.current({
            docId: activeDocId,
            conversationId: state.conversationId,
            chunks: frozenChunks.map((chunk) => ({
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

        let lastProgressSignature = ''
        let stagnantRounds = 0

        for (let i = 0; i < 180; i += 1) {
          if (cancelled) {
            return
          }

          const docsResponse = await refetchDocumentsRef.current()
          const docs = docsResponse.data ?? []
          const current = docs.find((doc) => doc.id === activeDocId)
          if (!current) {
            await new Promise((resolve) => setTimeout(resolve, 1200))
            continue
          }

          syncProgressFromServer(current)

          const progressSignature = [
            current.status,
            String(current.uploadedChunks ?? 0),
            String(current.totalChunks ?? 0),
            current.currentVectorId ?? ''
          ].join(':')

          if (progressSignature === lastProgressSignature) {
            stagnantRounds += 1
          } else {
            stagnantRounds = 0
            lastProgressSignature = progressSignature
          }

          const resolvedTotalChunks = Math.max(current.totalChunks ?? 0, frozenChunks.length)
          const resolvedUploadedChunks = current.uploadedChunks ?? 0
          const reachedChunkTarget =
            resolvedTotalChunks > 0 &&
            resolvedUploadedChunks >= resolvedTotalChunks &&
            (current.currentVectorId ?? null) === null

          if (current?.status === 'COMPLETED' || reachedChunkTarget) {
            setIngestStatus('success')
            setProgress(100)
            setUploadedChunks(Math.max(current.uploadedChunks ?? 0, resolvedTotalChunks))
            setTotalChunks(resolvedTotalChunks)
            onUpdateRef.current({
              uploadedDocuments: latestUploadedDocumentsRef.current.map((doc) =>
                doc.id === activeDocId
                  ? {
                      ...doc,
                      status: IngestDocumentStatus.Completed,
                      totalChunks: current.totalChunks ?? frozenChunks.length
                    }
                  : doc
              )
            })
            return
          }

          if (current?.status === 'FAILED') {
            setIngestStatus('failed')
            onUpdateRef.current({
              uploadedDocuments: latestUploadedDocumentsRef.current.map((doc) =>
                doc.id === activeDocId ? { ...doc, status: IngestDocumentStatus.Failed } : doc
              )
            })
            return
          }

          setIngestStatus(current.uploadedChunks && current.uploadedChunks > 0 ? 'finalizing' : 'vectorizing')

          if (stagnantRounds >= 15) {
            setIngestStatus('failed')
            setTerminalLines((prev) => [...prev, runtimeNoProgressText])
            return
          }

          await new Promise((resolve) => setTimeout(resolve, 1200))
        }

        setIngestStatus('failed')
        setTerminalLines((prev) => [...prev, runtimeTimeoutText])
      } catch {
        setIngestStatus('failed')
        setTerminalLines((prev) => [...prev, runtimeStartFailedText])
      }
    }

    void runIngest()

    return () => {
      cancelled = true
      if (activePollingDocIdRef.current === activeDocId) {
        activePollingDocIdRef.current = null
      }
    }
  }, [
    activeDocId,
    state.conversationId,
    runtimeNoProgressText,
    runtimeStartFailedText,
    runtimeStartingText,
    runtimeTimeoutText
  ])

  const statusLabel =
    ingestStatus === 'success'
      ? text.stepThree.status.success
      : ingestStatus === 'failed'
        ? text.stepThree.status.failed
        : ingestStatus === 'finalizing'
          ? text.stepThree.status.finalizing
          : text.stepThree.status.vectorizing

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
