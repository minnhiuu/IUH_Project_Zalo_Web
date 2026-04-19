import http from '@/lib/axios-client'

const AI_BASE = '/v1/ai/ingest'

export type UploadIngestResponse = {
  docId: string
  conversationId: string
  key: string
  fileName: string
  originalFileName: string
  contentType: string
  size: number
}

export async function uploadIngestFile(file: File, conversationId: string): Promise<UploadIngestResponse> {
  const form = new FormData()
  form.append('file', file)

  const { data } = await http.post(`/files/ingest/upload?conversationId=${conversationId}`, form)
  return data.data
}

export async function parseDocument(payload: {
  docId: string
  conversationId: string
  s3Key: string
  fileName: string
}) {
  const { data } = await http.post(`${AI_BASE}/parse`, payload)
  return data
}

export async function chunkPreview(payload: {
  docId: string
  conversationId: string
  rawContent: string
  strategy: 'fixed' | 'recursive' | 'semantic' | 'excel_row'
  s3Key?: string
  fileName?: string
  chunkSize: number
  overlap: number
}) {
  const { data } = await http.post(`${AI_BASE}/chunk-preview`, payload)
  return data
}

export async function startIngest(payload: {
  docId: string
  conversationId: string
  chunks: Array<{
    id: string
    docId: string
    vectorId: string
    prevId?: string | null
    nextId?: string | null
    chunkContent: string
    chunkIndex: number
    pageNumber?: number | null
    tokenCount: number
  }>
}) {
  const { data } = await http.post(`${AI_BASE}`, payload)
  return data
}

export async function getDocuments(conversationId?: string) {
  const query = conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : ''
  const { data } = await http.get(`${AI_BASE}/documents${query}`)
  return data.documents as Array<{
    id: string
    conversationId: string
    fileName: string
    fileType: string
    sourceUrl: string
    checksum: string
    status: string
    totalChunks: number
    uploadedChunks?: number
    currentVectorId: string | null
    embeddingModel: string
    ingestLogs?: string[]
    uploadedAt?: string
    updatedAt?: string
    errorMessage?: string | null
  }>
}
