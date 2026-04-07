import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Conversation } from '../lib/types'

interface UseConversationsReturn {
  conversations: Conversation[]
  activeId: string | null
  loading: boolean
  loadConversations: () => Promise<void>
  selectConversation: (id: string | null) => void
  createConversation: (toolSlug: string) => Promise<string | null>
  pinConversation: (id: string) => Promise<void>
  archiveConversation: (id: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
}

export function useConversations(userId: string | undefined): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadConversations = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(50)

      if (!error && data) {
        setConversations(data as Conversation[])
      }
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    loadConversations()

    // Realtime subscription
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, loadConversations])

  const selectConversation = useCallback((id: string | null) => {
    setActiveId(id)
  }, [])

  const createConversation = useCallback(async (toolSlug: string): Promise<string | null> => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId, tool_slug: toolSlug, title: null })
      .select('id')
      .single()

    if (error || !data) return null
    setActiveId(data.id)
    await loadConversations()
    return data.id
  }, [userId, loadConversations])

  const pinConversation = useCallback(async (id: string) => {
    await supabase
      .from('conversations')
      .update({ pinned_at: new Date().toISOString() })
      .eq('id', id)
    await loadConversations()
  }, [conversations, loadConversations])

  const archiveConversation = useCallback(async (id: string) => {
    await supabase
      .from('conversations')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
    if (activeId === id) setActiveId(null)
    await loadConversations()
  }, [activeId, loadConversations])

  const deleteConversation = useCallback(async (id: string) => {
    await supabase
      .from('conversations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (activeId === id) setActiveId(null)
    await loadConversations()
  }, [activeId, loadConversations])

  return {
    conversations,
    activeId,
    loading,
    loadConversations,
    selectConversation,
    createConversation,
    pinConversation,
    archiveConversation,
    deleteConversation,
  }
}
