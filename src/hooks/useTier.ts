import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { TierType } from '../lib/types'
import { TIER_CONFIGS } from '../lib/constants'

interface UsageToday {
  messages_used: number
  notes_created: number
  ai_cost_usd: number
}

interface UseTierReturn {
  tier: TierType
  loading: boolean
  usageToday: UsageToday
  limits: {
    messages_per_day: number
    notes_limit: number
    allowed_models: string[]
  }
  isUpgradeAvailable: boolean
  transactionCode: string
  refreshUsage: () => Promise<void>
  checkCanSendMessage: () => boolean
  checkCanCreateNote: () => boolean
  getTransactionCode: (userId: string) => string
}

export function useTier(userId: string | undefined): UseTierReturn {
  const [tier, setTier] = useState<TierType>('free')
  const [loading, setLoading] = useState(false)
  const [usageToday, setUsageToday] = useState<UsageToday>({
    messages_used: 0,
    notes_created: 0,
    ai_cost_usd: 0,
  })

  const getConfig = (t: TierType) =>
    TIER_CONFIGS.find(c => c.tier === t) || TIER_CONFIGS[0]

  const limits = getConfig(tier)
  const isUpgradeAvailable = tier === 'free'

  const getAllowedModels = (t: TierType): string[] => {
    const free = ['gemini-2.5-flash', 'prx/claude-haiku-4-5', 'Claude-r1']
    const pro = [...free, 'gemini-2.5-pro', 'prx/claude-sonnet-4-6', 'gpt-4o']
    if (t === 'pro') return pro
    if (t === 'vip') return [...pro, 'prx/claude-opus-4-6']
    return free
  }

  const refreshUsage = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      // Load tier from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', userId)
        .single()

      if (profile?.tier) {
        setTier(profile.tier as TierType)
      }

      // Load today's usage
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await supabase
        .from('usage_daily')
        .select('messages_used, notes_created, ai_cost_usd')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      setUsageToday({
        messages_used: usage?.messages_used ?? 0,
        notes_created: usage?.notes_created ?? 0,
        ai_cost_usd: usage?.ai_cost_usd ?? 0,
      })
    } catch (err) {
      console.error('[useTier] refreshUsage error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const checkCanSendMessage = useCallback((): boolean => {
    return usageToday.messages_used < limits.messages_per_day
  }, [usageToday.messages_used, limits.messages_per_day])

  const checkCanCreateNote = useCallback((): boolean => {
    return usageToday.notes_created < limits.notes_limit
  }, [usageToday.notes_created, limits.notes_limit])

  const getTransactionCode = useCallback((uid: string): string => {
    return `B2-${uid.substring(0, 8)}`
  }, [])

  return {
    tier,
    loading,
    usageToday,
    limits: {
      messages_per_day: limits.messages_per_day,
      notes_limit: limits.notes_limit,
      allowed_models: getAllowedModels(tier),
    },
    isUpgradeAvailable,
    transactionCode: userId ? getTransactionCode(userId) : '',
    refreshUsage,
    checkCanSendMessage,
    checkCanCreateNote,
    getTransactionCode,
  }
}
