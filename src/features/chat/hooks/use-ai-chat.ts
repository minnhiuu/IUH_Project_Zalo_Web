import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/axios-client'
import { getMessages } from '../api/chat.api'
import type { MessageResponse } from '../schemas/chat.schema'
import type { AiProcessingStatus } from '@/constants/enum'

// Re-export cho các consumer khác giữ import path cũ
export type { AiProcessingStatus } from '@/constants/enum'

export type AiMessageRole = 'user' | 'ai'

export interface AiMessage {
  id: string
  role: AiMessageRole
  content: string
  suggestions?: string[]       // follow-up questions extracted from <suggestions>...</suggestions>
  isStreaming?: boolean
  isClarification?: boolean
  processingStatus?: AiProcessingStatus
  timestamp: Date
}

/** Tách <suggestions>Q1|Q2</suggestions> ra khỏi content. Returns { cleanContent, suggestions } */
function parseSuggestions(raw: string): { cleanContent: string; suggestions: string[] } {
  const match = raw.match(/<suggestions>(.*?)<\/suggestions>/s)
  if (!match) return { cleanContent: raw.trim(), suggestions: [] }
  const suggestions = match[1]
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
  const cleanContent = raw.replace(/<suggestions>.*?<\/suggestions>/s, '').trim()
  return { cleanContent, suggestions }
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
  const abortRef = useRef<AbortController | null>(null)

  // BƯỚC 1: Lấy lịch sử tin nhắn từ Database (MongoDB) khi mở cửa sổ chat
  useEffect(() => {
    if (!conversationId) return

    const fetchHistory = async () => {
      try {
        setIsInitialLoading(true)
        const response = await getMessages(conversationId, 0)

        // Map từ MessageResponse (DB) sang AiMessage (UI)
        const history: AiMessage[] = response.data
          .map((msg: MessageResponse) => ({
            id: msg.id,
            role: (msg.senderId === AI_ASSISTANT_ID ? 'ai' : 'user') as AiMessageRole,
            content: msg.content || '',
            timestamp: new Date(msg.createdAt || Date.now()),
            isStreaming: false,
            isClarification: msg.content?.includes('Cần thêm thông tin') || false
          }))
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
    mutationFn: async (userText: string) => {
      if (!userText.trim()) return

      const userMsgId = `user-${Date.now()}`
      setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: userText, timestamp: new Date() }])

      const aiMsgId = `ai-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: 'ai', content: '', isStreaming: true, timestamp: new Date() }
      ])

      abortRef.current = new AbortController()

      try {
        const token = getAccessToken()
        const response = await fetch(`${AI_BASE_URL}/ai/chat/agentic`, {
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
            isForwarded: false
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
                // Cập nhật trạng thái pipeline real-time
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, processingStatus: event.content as AiProcessingStatus }
                      : m
                  )
                )
              } else if (event.type === 'CLARIFICATION') {
                isClarification = true
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: event.content, isClarification: true, isStreaming: false, processingStatus: undefined }
                      : m
                  )
                )
              } else if (event.type === 'ANSWER_CHUNK') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: m.content + event.content, processingStatus: undefined }
                      : m
                  )
                )
              }
            } catch {
              // ignore malformed JSON
            }
          }
        }

        // Khi stream kết thúc: parse suggestions, xóa tag khỏi content hiển thị
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== aiMsgId) return m
            const { cleanContent, suggestions } = parseSuggestions(m.content)
            return { ...m, content: cleanContent, suggestions, isStreaming: false, isClarification, processingStatus: undefined }
          })
        )
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.', isStreaming: false, processingStatus: undefined }
              : m
          )
        )
      }
    }
  })

  const sendMessage = useCallback(
    (userText: string) => {
      if (mutation.isPending) return
      mutation.mutate(userText)
    },
    [mutation]
  )

  const clearHistory = useCallback(() => setMessages([]), [])

  return {
    messages,
    isLoading: mutation.isPending || isInitialLoading,
    sendMessage,
    clearHistory
  }
}
