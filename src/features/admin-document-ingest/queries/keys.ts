export const ingestKeys = {
  all: () => ['ingest'] as const,

  documents: (conversationId?: string) =>
    conversationId
      ? ([...ingestKeys.all(), 'documents', conversationId] as const)
      : ([...ingestKeys.all(), 'documents'] as const),

  uploadIngestFile: () => [...ingestKeys.all(), 'upload-ingest-file'] as const,

  parseDocument: () => [...ingestKeys.all(), 'parse-document'] as const,

  chunkPreview: () => [...ingestKeys.all(), 'chunk-preview'] as const,

  startIngest: () => [...ingestKeys.all(), 'start-ingest'] as const
}
