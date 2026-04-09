import { useState, useCallback, useRef } from 'react'
import { supabase, EDGE_FUNCTION_URL } from '../lib/supabase'
import type { Message, NoteSuggestion } from '../lib/types'

interface ContextNote {
  id: string
  title: string
  similarity: number
}

interface UseChatReturn {
  messages: Message[]
  isStreaming: boolean
  currentModel: string
  currentMode: string
  error: string | null
  conversationId: string | null
  contextUsed: ContextNote[]
  noteSuggestion: NoteSuggestion | null
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  sendMessage: (text: string, toolSlug: string, model: string, conversationId?: string) => Promise<void>
  clearChat: () => void
  dismissNoteSuggestion: () => void
  acceptNoteSuggestion: () => Promise<void>
  setConversationId: (id: string | null) => void
  setCurrentMode: (mode: string) => void
  setCurrentModel: (model: string) => void
}

export function useChat(userId: string | undefined): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentModel, setCurrentModel] = useState('free/qwen3-235b')
  const [currentMode, setCurrentMode] = useState('chat_free')
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [contextUsed, setContextUsed] = useState<ContextNote[]>([])
  const [noteSuggestion, setNoteSuggestion] = useState<NoteSuggestion | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessage = useCallback(async (
    text: string,
    toolSlug: string,
    model: string,
    existingConvId?: string
  ) => {
    if (!text.trim() || isStreaming) return
    if (!userId) {
      setError('Chưa đăng nhập. Vui lòng refresh trang.')
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: existingConvId || conversationId || 'pending',
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsStreaming(true)
    setError(null)
    setContextUsed([])
    setNoteSuggestion(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('No session token')

      const res = await fetch(`${EDGE_FUNCTION_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool_slug: toolSlug,
          message: text.trim(),
          model: model || currentModel,
          conversation_id: existingConvId || conversationId || undefined,
        }),
      })

      // Handle non-streaming errors
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('text/event-stream')) {
        const errData = await res.json()
        let errMsg = 'Có lỗi xảy ra. Vui lòng thử lại.'
        if (res.status === 429) {
          errMsg = errData.message || 'Đã đạt giới hạn sử dụng. Nâng cấp Pro để có thêm tin nhắn.'
        } else {
          errMsg = errData.message || 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.'
        }
        setError(errMsg)
        // Replace user message with error bubble — don't delete it
        setMessages(prev => {
          const withoutUser = prev.filter(m => m.id !== userMessage.id)
          return [...withoutUser, {
            id: crypto.randomUUID(),
            role: 'assistant' as const,
            content: `⚠️ ${errMsg}`,
            conversation_id: existingConvId || conversationId || '',
            created_at: new Date().toISOString(),
          }]
        })
        setIsStreaming(false)
        return
      }

      // Extract conversation ID from headers
      const newConvId = res.headers.get('X-Conversation-Id')
      if (newConvId) {
        setConversationId(newConvId)
      }

      // Stream SSE
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6))
              const delta = json.choices?.[0]?.delta?.content
              if (delta) {
                fullText += delta
                setMessages(prev => {
                  const last = prev[prev.length - 1]
                  if (last?.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...last, content: fullText }]
                  } else {
                    return [...prev, {
                      id: crypto.randomUUID(),
                      conversation_id: newConvId || conversationId || '',
                      role: 'assistant' as const,
                      content: fullText,
                      created_at: new Date().toISOString(),
                    }]
                  }
                })
              }
            } catch {}
          }
        }
      }

      // After streaming done, reload conversation list to pick up new conv
      // (parent component handles this via callbacks)

    } catch (err) {
      console.error('Chat error:', err)
      const errMsg = 'Có lỗi xảy ra. Vui lòng thử lại.'
      setError(errMsg)
      // Show error as AI bubble — keep user message visible
      setMessages(prev => {
        const withoutUser = prev.filter(m => m.id !== userMessage.id)
        return [...withoutUser, {
          id: crypto.randomUUID(),
          role: 'assistant' as const,
          content: `⚠️ ${errMsg}`,
          conversation_id: existingConvId || conversationId || '',
          created_at: new Date().toISOString(),
        }]
      })
    } finally {
      setIsStreaming(false)
    }
  }, [userId, isStreaming, conversationId, currentModel])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    setContextUsed([])
    setNoteSuggestion(null)
  }, [])

  const dismissNoteSuggestion = useCallback(() => {
    setNoteSuggestion(null)
  }, [])

  const acceptNoteSuggestion = useCallback(async () => {
    // Just clear — actual note creation handled by ChatInterface via useVault
    setNoteSuggestion(null)
  }, [])

  return {
    messages,
    isStreaming,
    currentModel,
    currentMode,
    error,
    conversationId,
    contextUsed,
    noteSuggestion,
    messagesEndRef,
    sendMessage,
    clearChat,
    dismissNoteSuggestion,
    acceptNoteSuggestion,
    setConversationId,
    setCurrentMode,
    setCurrentModel,
  }
}
