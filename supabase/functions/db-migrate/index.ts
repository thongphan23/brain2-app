import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// This Edge Function runs SQL migrations using the service role key
// It is NOT deployed — use Supabase Dashboard SQL Editor or Management API
// See migration file: ../migrations/20260407000000_phase56_system_tables.sql

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'Unauthorized — requires Authorization header' }, 401)
  }

  // Only allow service role calls
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (authHeader !== `Bearer ${serviceKey}`) {
    return json({ error: 'Forbidden — service role only' }, 403)
  }

  const body = await req.json()
  const { sql } = body
  if (!sql) {
    return json({ error: 'Missing sql field in body' }, 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  }).catch(() => null)

  // Note: This approach requires a stored procedure. For direct execution,
  // use Supabase Dashboard → SQL Editor or Management API.
  return json({
    note: 'Run the migration SQL in Supabase Dashboard SQL Editor directly.',
    migration_file: 'supabase/migrations/20260407000000_phase56_system_tables.sql',
    instructions: '1. Go to Supabase Dashboard → SQL Editor\n2. Paste the contents of the migration file\n3. Click Run',
  })
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}
