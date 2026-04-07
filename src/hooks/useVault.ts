import { useState, useCallback, useEffect } from 'react'
import { supabase, EDGE_FUNCTION_URL } from '../lib/supabase'
import type { Note, NoteType, MaturityLevel } from '../lib/types'

interface VaultFilters {
  type?: NoteType
  maturity?: MaturityLevel
  domain?: string
}

interface UseVaultReturn {
  notes: Note[]
  selectedNote: Note | null
  loading: boolean
  searchQuery: string
  filters: VaultFilters
  totalCount: number
  loadNotes: () => Promise<void>
  createNote: (data: Partial<Note>) => Promise<Note | null>
  updateNote: (id: string, data: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (note: Note | null) => void
  setSearchQuery: (q: string) => void
  setFilters: (f: VaultFilters) => void
  refreshNotes: () => Promise<void>
}

export function useVault(userId: string | undefined): UseVaultReturn {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<VaultFilters>({})
  const [totalCount, setTotalCount] = useState(0)

  const loadNotes = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      let query = supabase
        .from('notes')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(200)

      if (filters.type) query = query.eq('note_type', filters.type)
      if (filters.maturity) query = query.eq('maturity', filters.maturity)
      if (filters.domain) query = query.eq('domain', filters.domain)

      const { data, error, count } = await query
      if (!error && data) {
        setNotes(data as Note[])
        setTotalCount(count || 0)
      }
    } finally {
      setLoading(false)
    }
  }, [userId, filters])

  useEffect(() => {
    if (!userId) return
    loadNotes()
  }, [userId, loadNotes])

  const createNote = useCallback(async (data: Partial<Note>): Promise<Note | null> => {
    if (!userId) return null
    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: data.title || 'Untitled',
        content: data.content || '',
        domain: data.domain || null,
        note_type: data.note_type || 'concept',
        maturity: data.maturity || 'seed',
        tags: data.tags || [],
      })
      .select()
      .single()

    if (error || !note) return null

    const newNote = note as Note
    setNotes(prev => [newNote, ...prev])
    setTotalCount(prev => prev + 1)

    // Trigger embed asynchronously
    const triggerEmbed = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return
        await fetch(`${EDGE_FUNCTION_URL}/embed`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ note_id: newNote.id }),
        })
      } catch {}
    }
    triggerEmbed()

    return newNote
  }, [userId])

  const updateNote = useCallback(async (id: string, data: Partial<Note>) => {
    const { error } = await supabase
      .from('notes')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (!error) {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n))
      if (selectedNote?.id === id) {
        setSelectedNote(prev => prev ? { ...prev, ...data } : null)
      }
    }
  }, [selectedNote])

  const deleteNote = useCallback(async (id: string) => {
    // Soft delete — set deleted_at
    const { error } = await supabase
      .from('notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setNotes(prev => prev.filter(n => n.id !== id))
      if (selectedNote?.id === id) setSelectedNote(null)
      setTotalCount(prev => Math.max(0, prev - 1))
    }
  }, [selectedNote])

  const selectNote = useCallback((note: Note | null) => {
    setSelectedNote(note)
  }, [])

  const refreshNotes = useCallback(async () => {
    await loadNotes()
  }, [loadNotes])

  return {
    notes,
    selectedNote,
    loading,
    searchQuery,
    filters,
    totalCount,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    setSearchQuery,
    setFilters,
    refreshNotes,
  }
}
