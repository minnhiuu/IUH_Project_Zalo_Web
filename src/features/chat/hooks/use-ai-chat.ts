import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/axios-client'
import i18n from '@/lib/i18n'
import { getMessages } from '../api/chat.api'
import type { MessageResponse } from '../schemas/chat.schema'
import type { AiProcessingStatus } from '@/constants/enum'
import { parseAiSuggestions, parseAiQuestion } from '../utils/ai-parser'

// Re-export cho các consumer khác giữ import path cũ
export type { AiProcessingStatus } from '@/constants/enum'

export type AiMessageRole = 'user' | 'ai'

export interface AiMessage {
  id: string
  role: AiMessageRole
  content: string
  suggestions?: string[] // follow-up questions extracted from <suggestions>...</suggestions>
  isStreaming?: boolean
  isClarification?: boolean
  processingStatus?: AiProcessingStatus
  timestamp: Date
}

/**
 * Parse toàn bộ tags cho một tin nhắn AI từ DB:
 * 1. Tách <question> → isClarification
 * 2. Tách <suggestions> → suggestions[]
 */
function parseAiMessageFromDb(raw: string): {
  cleanContent: string
  suggestions: string[]
  isClarification: boolean
} {
  const { cleanContent: afterQuestion, isClarification } = parseAiQuestion(raw)
  const { cleanContent, suggestions } = parseAiSuggestions(afterQuestion)
  return { cleanContent, suggestions, isClarification }
}

const AI_BASE_URL = import.meta.env.VITE_API_BASE_URL
const AI_ASSISTANT_ID = 'ai-assistant-001'

/**
 * Hook xử lý nghiệp vụ AI Chat:
 * 1. Fetch lịch sử tin nhắn từ message-service (MongoDB) để duy trì khi F5.
 * 2. Gửi tin nhắn mới đến ai-service và nhận Streaming (SSE).
 * 3. Xử lý STATUS events để hiển thị trạng thái pipeline real-time.
 */
export function useAiChat(conversationId: string) {
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryResult, setSummaryResult] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // BƯỚC 1: Lấy lịch sử tin nhắn từ Database (MongoDB) khi mở cửa sổ chat
  useEffect(() => {
    if (!conversationId) return

    const fetchHistory = async () => {
      try {
        setIsInitialLoading(true)
        const response = await getMessages(conversationId, 0)

        // Map từ MessageResponse (DB) sang AiMessage (UI)
        // Quan trọng: parse <suggestions> và <question> tags khỏi content được lưu raw trong DB
        const history: AiMessage[] = response.data
          .map((msg: MessageResponse) => {
            const isAi = msg.senderId === AI_ASSISTANT_ID
            const rawContent = msg.content || ''

            if (!isAi) {
              return {
                id: msg.id,
                role: 'user' as AiMessageRole,
                content: rawContent,
                timestamp: new Date(msg.createdAt || Date.now()),
                isStreaming: false
              }
            }

            // AI message: parse tất cả tags
            const { cleanContent, suggestions, isClarification } = parseAiMessageFromDb(rawContent)
            return {
              id: msg.id,
              role: 'ai' as AiMessageRole,
              content: cleanContent,
              suggestions,
              isClarification,
              timestamp: new Date(msg.createdAt || Date.now()),
              isStreaming: false
            }
          })
          .reverse() // API trả về tin mới nhất trước (DESC)

        setMessages(history)
      } catch (err) {
        console.error('[AiChat] Failed to fetch history:', err)
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchHistory()
  }, [conversationId])

  const mutation = useMutation({
    mutationFn: async (payload: { userText: string; isMention?: boolean }) => {
      const { userText, isMention = false } = payload
      if (!userText.trim()) return

      const userMsgId = `user-${Date.now()}`
      if (!isMention) {
        setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: userText, timestamp: new Date() }])
      }

      const aiMsgId = `ai-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: 'ai', content: '', isStreaming: true, timestamp: new Date() }
      ])

      abortRef.current = new AbortController()

      // Đánh dấu cho WebSocket biết đang stream AI để tránh lặp tin nhắn
      import('./ai-streaming-registry').then(({ aiStreamingRegistry }) => {
        aiStreamingRegistry.setStreaming(conversationId, true, aiMsgId)
      })

      try {
        const token = getAccessToken()
        const response = await fetch(`${AI_BASE_URL}/v1/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            content: userText,
            conversationId,
            clientMessageId: userMsgId,
            isForwarded: false,
            isMention
          }),
          signal: abortRef.current?.signal
        })

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let isClarification = false
        const bufferState = { content: '' }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue

            const rawJson = trimmed.slice('data:'.length).trim()
            if (!rawJson || rawJson === '[DONE]') continue

            try {
              const event = JSON.parse(rawJson) as { type: string; content: string }

              if (event.type === 'STATUS') {
                import('./ai-streaming-registry').then(({ aiStreamingRegistry }) => {
                  aiStreamingRegistry.updateStream(conversationId, bufferState.content, event.content)
                })
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, processingStatus: event.content as AiProcessingStatus } : m
                  )
                )
              } else if (event.type === 'CLARIFICATION') {
                isClarification = true
                const { cleanContent: clarificationContent } = parseAiQuestion(event.content || '')
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? {
                          ...m,
                          content: clarificationContent,
                          isClarification: true,
                          isStreaming: false,
                          processingStatus: undefined
                        }
                      : m
                  )
                )
              } else if (event.type === 'ANSWER_CHUNK') {
                console.log('[AiChat] Stream chunk:', event.content)
                bufferState.content += event.content
                import('./ai-streaming-registry').then(({ aiStreamingRegistry }) => {
                  aiStreamingRegistry.updateStream(conversationId, bufferState.content)
                })
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, content: m.content + event.content, processingStatus: undefined } : m
                  )
                )
              }
            } catch {
              // ignore malformed JSON
            }
          }
        }

        // Khi stream kết thúc: parse <suggestions> khỏi content hiển thị
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== aiMsgId) return m
            const { cleanContent: contentWithoutQuestion, isClarification: parsedClarification } = parseAiQuestion(
              m.content
            )
            const { cleanContent, suggestions } = parseAiSuggestions(contentWithoutQuestion)
            return {
              ...m,
              content: cleanContent,
              suggestions,
              isStreaming: false,
              isClarification: isClarification || parsedClarification || !!m.isClarification,
              processingStatus: undefined
            }
          })
        )
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: i18n.t('chat:ai.window.errorFallback'),
                  isStreaming: false,
                  processingStatus: undefined
                }
              : m
          )
        )
      } finally {
        // Tắt cờ streaming để WebSocket có thể nhận tin nhắn bình thường
        import('./ai-streaming-registry').then(({ aiStreamingRegistry }) => {
          aiStreamingRegistry.setStreaming(conversationId, false)
        })
      }
    }
  })

  const sendMessage = useCallback(
    (userText: string, isMention: boolean = false) => {
      if (mutation.isPending) return
      mutation.mutate({ userText, isMention })
    },
    [mutation]
  )

  const handleSummarize = useCallback(
    async (snapshotId: string) => {
      if (!snapshotId || !conversationId) return
      setIsSummarizing(true)
      setSummaryResult('')

      try {
        const token = getAccessToken()
        const response = await fetch(`${AI_BASE_URL}/v1/ai/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ conversationId, sinceMessageId: snapshotId })
        })

        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const rawJson = trimmed.slice('data:'.length).trim()
            try {
              const event = JSON.parse(rawJson)
              if (event.content) {
                setSummaryResult((prev) => (prev || '') + event.content)
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch (err) {
        console.error('[AiChat] Summarize failed:', err)
        setSummaryResult(null)
      } finally {
        setIsSummarizing(false)
      }
    },
    [conversationId]
  )

  const clearSummary = useCallback(() => setSummaryResult(null), [])

  const clearHistory = useCallback(() => setMessages([]), [])

  return {
    messages,
    isLoading: mutation.isPending || isInitialLoading,
    isSummarizing,
    summaryResult,
    sendMessage,
    handleSummarize,
    clearSummary,
    clearHistory
  }
}
