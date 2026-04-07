import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sauuvyffudkmdbeglspb.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdXV2eWZmdWRrbWRiZWdsc3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDU3NjUsImV4cCI6MjA4OTg4MTc2NX0.B6_og5KTtimPlq2vWg7HGuK4iXuc2lzIJgHp9A45_9c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        storageKey: 'sb-brain2-auth-token',
        // Bypass navigator.locks to prevent deadlock on custom domains
        // Safe for SPA: only one tab context uses session at a time
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
            return await fn()
        },
    },
})

export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1`
