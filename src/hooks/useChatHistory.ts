import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Message } from '../lib/types'

interface UseChatHistoryReturn {
  messages: Message[]
  loading: boolean
  loadMessages: (conversationId: string) => Promise<Message[]>
  clearMessages: () => void
}

export function useChatHistory(): UseChatHistoryReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (!error && data) {
        setMessages(data as Message[])
        return data as Message[]
      } else {
        setMessages([])
        return []
      }
    } catch {
      setMessages([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, loading, loadMessages, clearMessages }
}
