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

    const formData = await req.formData()
    const files: File[] = []
    formData.forEach((value, key) => {
      if (value instanceof File) files.push(value)
    })

    if (files.length === 0) return json({ error: 'No files provided' }, 400)
    if (files.length > 200) return json({ error: 'Tối đa 200 files' }, 400)

    const results = { imported: 0, skipped: 0, errors: [] as {filename:string, reason:string}[], notes_created: [] as string[] }

    for (const file of files) {
      // Size check
      if (file.size > 5 * 1024 * 1024) {
        results.skipped++
        results.errors.push({ filename: file.name, reason: 'File quá lớn (>5MB)' })
        continue
      }
      if (file.size === 0) {
        results.skipped++
        results.errors.push({ filename: file.name, reason: 'File trống' })
        continue
      }

      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!['md', 'txt', 'doc', 'docx'].includes(ext || '')) {
        results.skipped++
        results.errors.push({ filename: file.name, reason: `Định dạng .${ext} không hỗ trợ` })
        continue
      }

      let content = ''
      let title = file.name.replace(/\.[^.]+$/, '')

      try {
        if (ext === 'md' || ext === 'txt') {
          content = await file.text()
          // Extract title from first H1
          const h1Match = content.match(/^#\s+(.+)$/m)
          if (h1Match) title = h1Match[1].trim()
        } else {
          // For doc/docx, just read raw text (basic)
          content = await file.text()
          if (!content.trim()) {
            results.skipped++
            results.errors.push({ filename: file.name, reason: 'Không đọc được nội dung file' })
            continue
          }
        }
      } catch {
        results.skipped++
        results.errors.push({ filename: file.name, reason: 'Lỗi đọc file' })
        continue
      }

      // Check duplicate title → append counter
      let finalTitle = title
      const { data: existing } = await supabase
        .from('notes')
        .select('id')
        .eq('user_id', user.id)
        .like('title', `${title}%`)
        .limit(1)

      if (existing && existing.length > 0) {
        finalTitle = `${title} (${existing.length + 1})`
      }

      const { data: note, error: insertError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: finalTitle,
          content,
          note_type: 'concept',
          maturity: 'seed',
          tags: ['import'],
        })
        .select('id')
        .single()

      if (insertError || !note) {
        results.skipped++
        results.errors.push({ filename: file.name, reason: insertError?.message || 'Lỗi tạo note' })
        continue
      }

      results.notes_created.push(note.id)
      results.imported++
    }

    return json({ total_files: files.length, ...results })
  } catch (err) {
    console.error('[import-files]', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
