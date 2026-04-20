import type { MessageSearchRequest, MessageSearchSection } from '../schemas/message-search.schema'

export const messageSearchKeys = {
  all: ['message-search'] as const,
  results: (request: MessageSearchRequest, section: MessageSearchSection) =>
    [...messageSearchKeys.all, 'results', request, section] as const,
  overview: (request: MessageSearchRequest, sectionSize: number) =>
    [...messageSearchKeys.all, 'overview', request, sectionSize] as const
}
