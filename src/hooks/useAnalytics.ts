import { useState, useCallback } from 'react'
import { supabase, EDGE_FUNCTION_URL } from '../lib/supabase'
import type { KnowledgeAnalytics, Recommendation } from '../lib/types'

interface UseAnalyticsReturn {
  analytics: KnowledgeAnalytics | null
  recommendations: Recommendation[]
  loading: boolean
  error: string | null
  loadAnalytics: () => Promise<void>
  refreshAnalytics: () => Promise<void>
  dismissRecommendation: (id: string) => Promise<void>
}

export function useAnalytics(userId: string | undefined): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<KnowledgeAnalytics | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('No auth')

      // Call analyze-vault
      const res = await fetch(`${EDGE_FUNCTION_URL}/analyze-vault`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }

      // Load recommendations
      const { data: recs } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .limit(5)

      if (recs) {
        setRecommendations(recs as Recommendation[])
      }
    } catch (err) {
      console.error('[useAnalytics]', err)
      setError('Không thể tải dữ liệu analytics.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const refreshAnalytics = useCallback(async () => {
    await loadAnalytics()
  }, [loadAnalytics])

  const dismissRecommendation = useCallback(async (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id))
    await supabase.from('recommendations').delete().eq('id', id)
  }, [])

  return { analytics, recommendations, loading, error, loadAnalytics, refreshAnalytics, dismissRecommendation }
}
