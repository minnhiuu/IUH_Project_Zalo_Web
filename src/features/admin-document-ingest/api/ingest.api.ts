import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'
import type {
  ChunkPreviewRequest,
  ChunkPreviewResponse,
  GetDocumentsResponse,
  IngestAckResponse,
  IngestRequest,
  ParseRequest,
  ParseResponse,
  UploadIngestResponse
} from '../schemas/ingest-document.schema'

const AI_BASE = '/v1/ai/ingest'

export const ingestApi = {
  uploadIngestFile: (file: File, conversationId: string) => {
    const form = new FormData()
    form.append('file', file)

    return http.post<ApiResponse<UploadIngestResponse>>(`/files/ingest/upload?conversationId=${conversationId}`, form)
  },

  parseDocument: (payload: ParseRequest) => http.post<ApiResponse<ParseResponse>>(`${AI_BASE}/parse`, payload),

  chunkPreview: (payload: ChunkPreviewRequest) =>
    http.post<ApiResponse<ChunkPreviewResponse>>(`${AI_BASE}/chunk-preview`, payload),

  startIngest: (payload: IngestRequest) => http.post<ApiResponse<IngestAckResponse>>(`${AI_BASE}`, payload),

  getDocuments: (conversationId?: string) => {
    const query = conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : ''
    return http.get<ApiResponse<GetDocumentsResponse>>(`${AI_BASE}/documents${query}`)
  }
}
