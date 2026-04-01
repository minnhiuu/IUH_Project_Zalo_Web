import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/axios-client'
import { getMessages } from '../api/chat.api'
import type { MessageResponse } from '../schemas/chat.schema'

export type AiMessageRole = 'user' | 'ai'

export interface AiMessage {
  id: string
  role: AiMessageRole
  content: string
  isStreaming?: boolean
  isClarification?: boolean
  timestamp: Date
}

const AI_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * Hook xử lý nghiệp vụ AI Chat:
 * 1. Fetch lịch sử tin nhắn từ message-service (MongoDB) để duy trì khi F5.
 * 2. Gửi tin nhắn mới đến ai-service và nhận Streaming (SSE).
 */
export function useAiChat(conversationId: string, recipientId: string) {
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  // BƯỚC 1: Lấy lịch sử tin nhắn từ Database (MongoDB) khi mở cửa sổ chat
  useEffect(() => {
    if (!recipientId) return

    const fetchHistory = async () => {
      try {
        setIsInitialLoading(true)
        const response = await getMessages(recipientId, 0) // Lấy page mới nhất

        // Map từ MessageResponse (DB) sang AiMessage (UI)
        const history: AiMessage[] = response.data
          .map((msg: MessageResponse) => ({
            id: msg.id,
            role: (msg.senderId === recipientId ? 'ai' : 'user') as AiMessageRole,
            content: msg.content || '',
            timestamp: new Date(msg.createdAt || Date.now()),
            isStreaming: false,
            isClarification: msg.content?.includes('Cần thêm thông tin') || false // Phỏng đoán đơn giản
          }))
          .reverse() // Vì API trả về tin mới nhất trước (DESC)

        setMessages(history)
      } catch (err) {
        console.error('[AiChat] Failed to fetch history:', err)
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchHistory()
  }, [recipientId])

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
        const params = new URLSearchParams({
          message: userText,
          conversationId
        })

        const response = await fetch(`${AI_BASE_URL}/ai/chat/agentic?${params.toString()}`, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'text/event-stream'
          },
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

              if (event.type === 'CLARIFICATION') {
                isClarification = true
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, content: event.content, isClarification: true, isStreaming: false } : m
                  )
                )
              } else if (event.type === 'ANSWER_CHUNK') {
                setMessages((prev) =>
                  prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + event.content } : m))
                )
              }
            } catch {
              // ignore
            }
          }
        }

        setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false, isClarification } : m)))
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
                  isStreaming: false
                }
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
