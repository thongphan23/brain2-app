import { useState, useCallback, useRef } from 'react'
import { supabase, EDGE_FUNCTION_URL } from '../lib/supabase'
import type { Note } from '../lib/types'

interface SearchResult {
  notes: Note[]
  total: number
  query: string
}

interface UseVaultSearchReturn {
  results: Note[]
  loading: boolean
  searchMode: 'keyword' | 'semantic' | 'hybrid'
  error: string | null
  search: (query: string, mode?: 'keyword' | 'semantic' | 'hybrid', limit?: number) => Promise<void>
  clear: () => void
}

export function useVaultSearch(userId: string | undefined): UseVaultSearchReturn {
  const [results, setResults] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid')
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (
    query: string,
    mode: 'keyword' | 'semantic' | 'hybrid' = 'hybrid',
    limit = 20
  ) => {
    // Debounce
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setError(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      setSearchMode(mode)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) throw new Error('No session')

        if (mode === 'keyword') {
          // Direct Supabase keyword search
          const { data } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', userId!)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('updated_at', { ascending: false })
            .limit(limit)

          setResults((data as Note[]) || [])
        } else {
          // Semantic or hybrid — call edge function
          const res = await fetch(`${EDGE_FUNCTION_URL}/search-notes`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, limit }),
          })

          if (!res.ok) throw new Error('Search failed')
          const data: SearchResult = await res.json()
          setResults(data.notes as Note[])
        }
      } catch (err) {
        console.error('Vault search error:', err)
        setError('Tìm kiếm thất bại. Vui lòng thử lại.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [userId])

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setResults([])
    setError(null)
  }, [])

  return { results, loading, searchMode, error, search, clear }
}
