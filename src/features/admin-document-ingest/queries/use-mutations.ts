import { useMutation } from '@tanstack/react-query'
import { ingestApi } from '../api/ingest.api'
import type { ChunkPreviewRequest, IngestRequest, ParseRequest } from '../schemas/ingest-document.schema'
import { ingestKeys } from './keys'

export const useUploadIngestFileMutation = () =>
  useMutation({
    mutationKey: ingestKeys.uploadIngestFile(),
    mutationFn: ({ file, conversationId }: { file: File; conversationId: string }) =>
      ingestApi.uploadIngestFile(file, conversationId)
  })

export const useParseDocumentMutation = () =>
  useMutation({
    mutationKey: ingestKeys.parseDocument(),
    mutationFn: (payload: ParseRequest) => ingestApi.parseDocument(payload)
  })

export const useChunkPreviewMutation = () =>
  useMutation({
    mutationKey: ingestKeys.chunkPreview(),
    mutationFn: (payload: ChunkPreviewRequest) => ingestApi.chunkPreview(payload)
  })

export const useStartIngestMutation = () =>
  useMutation({
    mutationKey: ingestKeys.startIngest(),
    mutationFn: (payload: IngestRequest) => ingestApi.startIngest(payload)
  })
