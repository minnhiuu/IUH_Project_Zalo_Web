import { z } from 'zod'
import { IngestDocumentStatus } from '@/constants/enum'

export type IngestStep = 1 | 2 | 3

export type ChunkingStrategy = 'fixed' | 'recursive' | 'semantic' | 'excel_row'

// Schemas currently used by ingest FE flow
const ChunkSchema = z.object({
  id: z.string().min(1),
  docId: z.string().min(1),
  vectorId: z.string().min(1),
  prevId: z.string().min(1).nullable().optional(),
  nextId: z.string().min(1).nullable().optional(),
  chunkContent: z.string().min(1),
  chunkIndex: z.number().int().min(0),
  pageNumber: z.number().int().positive().nullable().optional(),
  tokenCount: z.number().int().min(0)
})

export const IngestDocumentRecordSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  checksum: z.string().min(1),
  fileName: z.string().min(1),
  sourceUrl: z.string().min(1),
  fileType: z.string().min(1),
  status: z.nativeEnum(IngestDocumentStatus),
  totalChunks: z.number().int().min(0),
  uploadedChunks: z.number().int().min(0).optional(),
  currentVectorId: z.string().nullable().optional(),
  embeddingModel: z.string().min(1),
  ingestLogs: z.array(z.string()).optional(),
  errorMessage: z.string().nullable().optional(),
  displaySize: z.string().optional(),
  uploadedAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export type IngestDocumentRecord = z.infer<typeof IngestDocumentRecordSchema>

export const ChunkListSchema = z.array(ChunkSchema)

export type Chunk = z.infer<typeof ChunkSchema>

export type IngestState = {
  step: IngestStep
  conversationId: string
  file: File | null
  uploadedDocuments: IngestDocumentRecord[]
  isUploadModalOpen: boolean
  rawContent: string
  strategy: ChunkingStrategy
  chunkSize: number
  overlap: number
  chunks: Chunk[]
  isProcessing: boolean
}

export const INITIAL_INGEST_STATE: IngestState = {
  step: 1,
  conversationId: 'GLOBAL',
  file: null,
  uploadedDocuments: [],
  isUploadModalOpen: false,
  rawContent: '',
  strategy: 'recursive',
  chunkSize: 512,
  overlap: 10,
  chunks: [],
  isProcessing: false
}
