import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  try {
    const url = new URL(req.url)
    const supabase = createClient(
      url.searchParams.get('SUPABASE_URL')!,
      url.searchParams.get('SUPABASE_ANON_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // Get user notes
    const { data: notes } = await supabase
      .from('notes')
      .select('id, title, domain, maturity, tags')
      .eq('user_id', user.id)
      .not('deleted_at', 'neq', null)

    if (!notes || notes.length === 0) {
      return json({ recommendations: [] })
    }

    // Analyze domains
    const domainCount: Record<string, number> = {}
    const seedNotes: string[] = []
    const unconnected: string[] = []

    for (const note of notes) {
      if (note.domain) {
        domainCount[note.domain] = (domainCount[note.domain] || 0) + 1
      }
      if (note.maturity === 'seed') {
        seedNotes.push(note.title)
      }
      if (!note.domain) {
        unconnected.push(note.title)
      }
    }

    const recommendations = []

    // Domain gaps
    const sorted = Object.entries(domainCount).sort((a, b) => a[1] - b[1])
    if (sorted.length > 0) {
      const weakest = sorted[0][0]
      if (domainCount[weakest] < 3) {
        recommendations.push({
          user_id: user.id,
          type: 'study_topic',
          title: `Nghiên cứu thêm về "${weakest}"`,
          description: `Bạn mới có ${domainCount[weakest]} notes trong lĩnh vực này. Đây là cơ hội để phát triển thêm.`,
          related_note_ids: notes.filter(n => n.domain === weakest).map(n => n.id),
          priority: 1,
        })
      }
    }

    // Seed notes to grow
    if (seedNotes.length > 0) {
      const oldestSeed = seedNotes[0]
      recommendations.push({
        user_id: user.id,
        type: 'review_note',
        title: `Review "${oldestSeed}"`,
        description: 'Note này ở trạng thái Seed lâu rồi. Hãy cập nhật và nâng cấp maturity.',
        related_note_ids: notes.filter(n => n.title === oldestSeed).map(n => n.id),
        priority: 2,
      })
    }

    // Connect notes
    if (unconnected.length >= 2) {
      recommendations.push({
        user_id: user.id,
        type: 'connect_notes',
        title: 'Gán domain cho notes chưa phân loại',
        description: `Bạn có ${unconnected.length} notes chưa có domain. Hãy phân loại chúng để tăng overall score.`,
        related_note_ids: notes.filter(n => !n.domain).map(n => n.id).slice(0, 2),
        priority: 3,
      })
    }

    // Upsert recommendations
    if (recommendations.length > 0) {
      await supabase.from('recommendations').upsert(recommendations, {
        onConflict: 'user_id,type,title',
      })
    }

    return json({ recommendations })
  } catch (err) {
    console.error('[recommend]', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}