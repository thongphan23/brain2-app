/**
 * AuthContext — Single source of truth for auth state
 *
 * IMPORTANT: Only ONE onAuthStateChange listener exists here.
 * All components use useAuth() which consumes this context.
 * No component should create its own supabase.auth.onAuthStateChange() listener.
 */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../lib/types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Use ref to avoid re-creating fetchProfile on every render
  const fetchingRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) setProfile(data as Profile)
    } catch (err) {
      console.error('[AuthContext] fetchProfile error:', err)
    } finally {
      fetchingRef.current = false
    }
  }, [])

  const createProfileIfNeeded = useCallback(async (authUser: User) => {
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single()

      if (!existing) {
        const displayName = authUser.user_metadata?.full_name
          || authUser.user_metadata?.name
          || authUser.email?.split('@')[0]
          || 'User'
        const avatarUrl = authUser.user_metadata?.avatar_url || null

        await supabase.from('profiles').insert({
          id: authUser.id,
          display_name: displayName,
          avatar_url: avatarUrl,
          usage_goals: [],
          onboarding_completed: false,
          tier: 'free',
        })
      }
    } catch (err) {
      console.error('[AuthContext] createProfileIfNeeded error:', err)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  // ── SINGLE auth listener — the ONLY one in the entire app ──
  // CRITICAL: Track user ID to prevent infinite fetch loop.
  // Without lock protection, onAuthStateChange fires frequently
  // (TOKEN_REFRESHED, etc). We must only fetch profile when
  // the user ID actually changes, not on every event.
  const currentUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          currentUserIdRef.current = currentUser.id
          await createProfileIfNeeded(currentUser)
          await fetchProfile(currentUser.id)
        }
      } catch (err) {
        console.error('[AuthContext] init error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // Safety timeout: if init hangs (getSession stuck with no-op lock),
    // force loading=false after 5s so app doesn't show infinite spinner
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[AuthContext] Safety timeout: forcing loading=false after 5s')
        setLoading(false)
      }
    }, 5000)

    // Single onAuthStateChange listener — cleaned up when component unmounts
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return

        const currentUser = session?.user ?? null

        // SIGNED_OUT → clear everything
        if (!currentUser) {
          currentUserIdRef.current = null
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        // Same user → just update user object, skip profile re-fetch
        // This prevents infinite loop from TOKEN_REFRESHED events
        if (currentUser.id === currentUserIdRef.current) {
          setUser(currentUser)
          return
        }

        // New user (SIGNED_IN) → fetch profile
        currentUserIdRef.current = currentUser.id
        setUser(currentUser)
        await createProfileIfNeeded(currentUser)
        await fetchProfile(currentUser.id)
        if (mounted) setLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [fetchProfile, createProfileIfNeeded])

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Public hook ──────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth() must be used within <AuthProvider>')
  return ctx
}