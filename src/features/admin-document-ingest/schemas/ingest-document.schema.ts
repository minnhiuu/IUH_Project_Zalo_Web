import { z } from 'zod'

export type IngestStep = 1 | 2 | 3

export const ChunkingStrategySchema = z.enum(['fixed', 'recursive', 'semantic', 'excel_row'])
export type ChunkingStrategy = z.infer<typeof ChunkingStrategySchema>

// Request schemas (1-1 backend dto/request/ingest_request.py)
export const ParseRequestSchema = z.object({
  docId: z.string().min(1),
  conversationId: z.string().min(1),
  s3Key: z.string().min(1),
  fileName: z.string().min(1)
})

export type ParseRequest = z.infer<typeof ParseRequestSchema>

export const ChunkPreviewRequestSchema = z.object({
  docId: z.string().min(1),
  conversationId: z.string().min(1),
  rawContent: z.string().default(''),
  strategy: ChunkingStrategySchema.default('recursive'),
  s3Key: z.string().min(1).optional(),
  fileName: z.string().min(1).optional(),
  chunkSize: z.number().int().min(100).max(4096).default(512),
  overlap: z.number().int().min(0).max(100).default(10)
})

export type ChunkPreviewRequest = z.infer<typeof ChunkPreviewRequestSchema>

export const IngestChunkPayloadSchema = z.object({
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

export type IngestChunkPayload = z.infer<typeof IngestChunkPayloadSchema>

export const IngestRequestSchema = z.object({
  docId: z.string().min(1),
  conversationId: z.string().min(1),
  chunks: z.array(IngestChunkPayloadSchema)
})

export type IngestRequest = z.infer<typeof IngestRequestSchema>

// Response schemas (1-1 backend dto/response/ingest_response.py)
export const ParseResponseSchema = z.object({
  docId: z.string().min(1),
  conversationId: z.string().min(1),
  rawContent: z.string()
})

export type ParseResponse = z.infer<typeof ParseResponseSchema>

export const IngestAckResponseSchema = z.object({
  docId: z.string().min(1),
  conversationId: z.string().min(1),
  status: z.string().min(1),
  message: z.string().min(1)
})

export type IngestAckResponse = z.infer<typeof IngestAckResponseSchema>

export const IngestDocumentStatusSchema = z.enum(['INGESTING', 'COMPLETED', 'FAILED'])
export type IngestDocumentStatus = z.infer<typeof IngestDocumentStatusSchema>

export const IngestChunkResponseSchema = z.object({
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

export type IngestChunkResponse = z.infer<typeof IngestChunkResponseSchema>

export const ChunkPreviewResponseSchema = z.object({
  docId: z.string().min(1),
  conversationId: z.string().min(1),
  chunks: z.array(IngestChunkResponseSchema)
})

export type ChunkPreviewResponse = z.infer<typeof ChunkPreviewResponseSchema>

export const IngestDocumentResponseSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  checksum: z.string().min(1),
  fileName: z.string().min(1),
  sourceUrl: z.string().min(1),
  fileType: z.string().min(1),
  status: IngestDocumentStatusSchema,
  totalChunks: z.number().int().min(0),
  uploadedChunks: z.number().int().min(0),
  currentVectorId: z.string().nullable().optional(),
  embeddingModel: z.string().min(1),
  ingestLogs: z.array(z.string()),
  errorMessage: z.string().nullable().optional(),
  displaySize: z.string().optional(),
  uploadedAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export type IngestDocumentResponse = z.infer<typeof IngestDocumentResponseSchema>

export const GetDocumentsResponseSchema = z.object({
  documents: z.array(IngestDocumentResponseSchema)
})

export type GetDocumentsResponse = z.infer<typeof GetDocumentsResponseSchema>

// Upload response from file-service endpoint
export const UploadIngestResponseSchema = z.object({
  docId: z.string().min(1),
  conversationId: z.string().min(1),
  key: z.string().min(1),
  fileName: z.string().min(1),
  originalFileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative()
})

export type UploadIngestResponse = z.infer<typeof UploadIngestResponseSchema>

// Compatibility aliases for existing FE components
export const IngestDocumentRecordSchema = IngestDocumentResponseSchema
export type IngestDocumentRecord = IngestDocumentResponse

export const ChunkSchema = IngestChunkResponseSchema
export type Chunk = IngestChunkResponse

export const ChunkListSchema = z.array(IngestChunkResponseSchema)

// Local page state schema/type
export const IngestStateSchema = z.object({
  step: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  conversationId: z.string().min(1),
  file: z.instanceof(File).nullable(),
  uploadedDocuments: z.array(IngestDocumentRecordSchema),
  isUploadModalOpen: z.boolean(),
  rawContent: z.string(),
  strategy: ChunkingStrategySchema,
  chunkSize: z.number().int().positive(),
  overlap: z.number().int().min(0).max(100),
  chunks: z.array(ChunkSchema),
  isProcessing: z.boolean()
})

export type IngestState = z.infer<typeof IngestStateSchema>

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
