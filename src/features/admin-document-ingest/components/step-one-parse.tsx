import React, { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { IngestDocumentStatus } from '@/constants/enum'
import {
  IngestDocumentRecordSchema,
  type IngestState,
  type IngestDocumentRecord
} from '../schemas/ingest-document.schema'
import { getDocuments, parseDocument, uploadIngestFile } from '../api/ingest.api'
import { StepOneFilters } from './step-one/step-one-filters'
import { StepOneDocumentsTable } from './step-one/step-one-documents-table'
import { StepOneRawContentPanel } from './step-one/step-one-raw-content-panel'
import { StepOneUploadDialog } from './step-one/step-one-upload-dialog'

interface StepOneParseProps {
  state: IngestState
  onUpdate: (update: Partial<IngestState>) => void
  onNext: () => void
}

export function StepOneParse({ state, onUpdate, onNext }: StepOneParseProps) {
  const [isParsing, setIsParsing] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | IngestDocumentRecord['status']>('all')
  const pageSize = 6

  const mapBackendStatus = (status: string): IngestDocumentRecord['status'] => {
    const normalizedStatus = status.toUpperCase()
    if (normalizedStatus === IngestDocumentStatus.Completed) {
      return IngestDocumentStatus.Completed
    }
    if (normalizedStatus === IngestDocumentStatus.Failed) {
      return IngestDocumentStatus.Failed
    }
    return IngestDocumentStatus.Ingesting
  }

  const toDisplayDateTime = (value?: string) => {
    if (!value) {
      return undefined
    }

    return value.replace('T', ' ').substring(0, 16)
  }

  useEffect(() => {
    let mounted = true

    const loadDocuments = async () => {
      try {
        const documents = await getDocuments(state.conversationId)

        const mappedDocuments = documents
          .map((doc) => {
            const candidate: IngestDocumentRecord = {
              id: doc.id,
              checksum: doc.checksum ?? `doc:${doc.id}`,
              fileName: doc.fileName ?? doc.id,
              sourceUrl: doc.sourceUrl ?? `doc://${doc.id}`,
              fileType: (doc.fileType ?? 'UNKNOWN').toUpperCase(),
              status: mapBackendStatus(doc.status),
              totalChunks: Math.max(0, doc.totalChunks ?? 0),
              embeddingModel: doc.embeddingModel ?? 'text-embedding-3-small',
              uploadedAt: toDisplayDateTime(doc.uploadedAt),
              displaySize: undefined
            }

            const parsed = IngestDocumentRecordSchema.safeParse(candidate)
            return parsed.success ? parsed.data : null
          })
          .filter((doc): doc is IngestDocumentRecord => doc !== null)

        if (!mounted) {
          return
        }

        onUpdate({ uploadedDocuments: mappedDocuments })
      } catch {
        // Ignore fetch errors to avoid blocking local upload flow.
      }
    }

    void loadDocuments()

    return () => {
      mounted = false
    }
  }, [onUpdate, state.conversationId])

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || 'other'
    if (['pdf', 'docx', 'txt', 'xlsx', 'xls'].includes(extension)) {
      return extension
    }
    return 'other'
  }

  const formatFileSize = (sizeInBytes: number) => {
    const sizeInMb = sizeInBytes / (1024 * 1024)
    if (sizeInMb >= 1) {
      return `${sizeInMb.toFixed(1)} MB`
    }

    const sizeInKb = sizeInBytes / 1024
    return `${Math.max(1, Math.round(sizeInKb))} KB`
  }

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return state.uploadedDocuments.filter((doc) => {
      const docFileType = getFileType(doc.fileName)
      const matchesSearch = !normalizedSearch || doc.fileName.toLowerCase().includes(normalizedSearch)
      const matchesFileType = fileTypeFilter === 'all' || docFileType === fileTypeFilter
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter

      return matchesSearch && matchesFileType && matchesStatus
    })
  }, [fileTypeFilter, searchTerm, state.uploadedDocuments, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedDocuments = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredDocuments.slice(start, start + pageSize)
  }, [filteredDocuments, safeCurrentPage, pageSize])
  const paginatedDocumentIds = paginatedDocuments.map((doc) => doc.id)
  const allCurrentPageSelected =
    paginatedDocumentIds.length > 0 && paginatedDocumentIds.every((id) => selectedDocumentIds.includes(id))
  const hasSelectedDocuments = selectedDocumentIds.length > 0

  const hasActiveFilters = searchTerm.trim() !== '' || fileTypeFilter !== 'all' || statusFilter !== 'all'

  const handleUploadClick = () => {
    setPendingUploadFile(null)
    onUpdate({ isUploadModalOpen: true })
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setFileTypeFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingUploadFile(file)
    }

    e.target.value = ''
  }

  const handleConfirmUpload = async () => {
    if (!pendingUploadFile) {
      return
    }

    setIsParsing(true)

    let uploadedDocId: string | null = null
    let nextUploadedDocuments = state.uploadedDocuments

    try {
      const uploaded = await uploadIngestFile(pendingUploadFile, state.conversationId)
      uploadedDocId = uploaded.docId

      const fileType = uploaded.fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN'
      const uploadedAt = new Date().toISOString().replace('T', ' ').substring(0, 16)

      const newDocCandidate: IngestDocumentRecord = {
        id: uploaded.docId,
        checksum: `s3:${uploaded.key}`,
        fileName: uploaded.fileName,
        sourceUrl: uploaded.key,
        fileType,
        status: IngestDocumentStatus.Ingesting,
        totalChunks: 0,
        embeddingModel: 'text-embedding-3-small',
        displaySize: uploaded.size ? (uploaded.size / (1024 * 1024)).toFixed(1) + ' MB' : undefined,
        uploadedAt
      }

      const parsedDoc = IngestDocumentRecordSchema.safeParse(newDocCandidate)
      if (!parsedDoc.success) {
        return
      }

      nextUploadedDocuments = [parsedDoc.data, ...state.uploadedDocuments]

      const parsed = await parseDocument({
        docId: uploaded.docId,
        conversationId: state.conversationId,
        s3Key: uploaded.key,
        fileName: uploaded.fileName
      })

      onUpdate({
        uploadedDocuments: nextUploadedDocuments.map((item) =>
          item.id === uploaded.docId ? { ...item, status: IngestDocumentStatus.Ingesting } : item
        ),
        rawContent: parsed.rawContent ?? '',
        isUploadModalOpen: false
      })

      setSelectedFileId(uploaded.docId)
      setCurrentPage(1)
      setPendingUploadFile(null)
    } catch {
      if (uploadedDocId) {
        onUpdate({
          uploadedDocuments: nextUploadedDocuments.map((item) =>
            item.id === uploadedDocId ? { ...item, status: IngestDocumentStatus.Failed } : item
          )
        })
      }
    } finally {
      setIsParsing(false)
    }
  }

  const handleDeleteDocument = (documentId: string) => {
    const nextDocuments = state.uploadedDocuments.filter((doc) => doc.id !== documentId)
    const nextChunks = state.chunks.filter((chunk) => chunk.docId !== documentId)

    setSelectedDocumentIds((prev) => prev.filter((id) => id !== documentId))

    onUpdate({
      uploadedDocuments: nextDocuments,
      chunks: nextChunks,
      rawContent: selectedFileId === documentId ? '' : state.rawContent
    })

    if (selectedFileId === documentId) {
      setSelectedFileId(null)
      setIsParsing(false)
    }
  }

  const handleToggleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      setSelectedDocumentIds((prev) => Array.from(new Set([...prev, ...paginatedDocumentIds])))
      return
    }

    setSelectedDocumentIds((prev) => prev.filter((id) => !paginatedDocumentIds.includes(id)))
  }

  const handleToggleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocumentIds((prev) => (prev.includes(documentId) ? prev : [...prev, documentId]))
      return
    }

    setSelectedDocumentIds((prev) => prev.filter((id) => id !== documentId))
  }

  const handleDeleteSelectedDocuments = () => {
    if (!hasSelectedDocuments) {
      return
    }

    const shouldClearRawContent = selectedFileId !== null && selectedDocumentIds.includes(selectedFileId)
    const nextDocuments = state.uploadedDocuments.filter((doc) => !selectedDocumentIds.includes(doc.id))
    const nextChunks = state.chunks.filter((chunk) => !selectedDocumentIds.includes(chunk.docId))

    onUpdate({
      uploadedDocuments: nextDocuments,
      chunks: nextChunks,
      rawContent: shouldClearRawContent ? '' : state.rawContent
    })

    if (shouldClearRawContent) {
      setSelectedFileId(null)
      setIsParsing(false)
    }

    setSelectedDocumentIds([])
  }

  const startParsing = async (doc: IngestDocumentRecord) => {
    setSelectedFileId(doc.id)
    setIsParsing(true)
    try {
      const parsed = await parseDocument({
        docId: doc.id,
        conversationId: state.conversationId,
        s3Key: doc.sourceUrl,
        fileName: doc.fileName
      })

      onUpdate({
        rawContent: parsed.rawContent ?? '',
        uploadedDocuments: state.uploadedDocuments.map((item) =>
          item.id === doc.id ? { ...item, status: IngestDocumentStatus.Completed } : item
        )
      })
    } catch {
      onUpdate({
        uploadedDocuments: state.uploadedDocuments.map((item) =>
          item.id === doc.id ? { ...item, status: IngestDocumentStatus.Failed } : item
        )
      })
    } finally {
      setIsParsing(false)
    }
  }

  const getStatusBadge = (status: IngestDocumentRecord['status']) => {
    switch (status) {
      case IngestDocumentStatus.Completed:
        return (
          <Badge className='bg-success-solid text-white border-none text-[10px] font-bold px-2 h-5 rounded uppercase tracking-tighter shadow-sm'>
            Đã trích xuất
          </Badge>
        )
      case IngestDocumentStatus.Ingesting:
        return (
          <Badge
            variant='outline'
            className='text-[10px] font-bold px-2 h-5 rounded uppercase text-muted-foreground border-border/60 bg-dashboard-badge-bg'
          >
            Đang nạp
          </Badge>
        )
      case IngestDocumentStatus.Failed:
        return (
          <Badge className='bg-destructive-subtle text-destructive-text border-destructive-border text-[10px] font-bold px-2 h-5 rounded uppercase tracking-tighter shadow-none'>
            Lỗi
          </Badge>
        )
    }
  }

  return (
    <div className='flex flex-col gap-6 animate-in fade-in duration-500'>
      <StepOneFilters
        fileTypeFilter={fileTypeFilter}
        statusFilter={statusFilter}
        searchTerm={searchTerm}
        hasActiveFilters={hasActiveFilters}
        onFileTypeChange={(value) => {
          setFileTypeFilter(value)
          setCurrentPage(1)
        }}
        onStatusChange={(value) => {
          setStatusFilter(value)
          setCurrentPage(1)
        }}
        onSearchChange={(value) => {
          setSearchTerm(value)
          setCurrentPage(1)
        }}
        onResetFilters={handleResetFilters}
        onUploadClick={handleUploadClick}
      />

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8 h-150'>
        <StepOneDocumentsTable
          paginatedDocuments={paginatedDocuments}
          uploadedDocumentsCount={state.uploadedDocuments.length}
          allCurrentPageSelected={allCurrentPageSelected}
          selectedDocumentIds={selectedDocumentIds}
          hasSelectedDocuments={hasSelectedDocuments}
          selectedDocumentsCount={selectedDocumentIds.length}
          selectedFileId={selectedFileId}
          safeCurrentPage={safeCurrentPage}
          totalPages={totalPages}
          getStatusBadge={getStatusBadge}
          onToggleSelectAllCurrentPage={handleToggleSelectAllCurrentPage}
          onToggleSelectDocument={handleToggleSelectDocument}
          onStartParsing={startParsing}
          onDeleteDocument={handleDeleteDocument}
          onDeleteSelectedDocuments={handleDeleteSelectedDocuments}
          onPageChange={setCurrentPage}
        />

        <StepOneRawContentPanel isParsing={isParsing} rawContent={state.rawContent} onNext={onNext} />
      </div>

      <StepOneUploadDialog
        open={state.isUploadModalOpen}
        pendingUploadFile={pendingUploadFile}
        isParsing={isParsing}
        formatFileSize={formatFileSize}
        onOpenChange={(open) => {
          onUpdate({ isUploadModalOpen: open })
          if (!open) {
            setPendingUploadFile(null)
          }
        }}
        onFileChange={handleFileChange}
        onCancel={() => {
          setPendingUploadFile(null)
          onUpdate({ isUploadModalOpen: false })
        }}
        onConfirmUpload={handleConfirmUpload}
      />
    </div>
  )
}
