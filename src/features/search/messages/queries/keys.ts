import type { MessageSearchRequest } from '../schemas/message-search.schema'

export const messageSearchKeys = {
  all: ['message-search'] as const,
  results: (request: MessageSearchRequest) => [...messageSearchKeys.all, request] as const
}
