import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { supabase } from '../lib/supabase'

export async function exportAllNotes(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error || !data || data.length === 0) {
    throw new Error('Không có notes để xuất.')
  }

  const zip = new JSZip()
  const folder = zip.folder('brain2-vault')

  if (!folder) throw new Error('Không thể tạo thư mục trong ZIP.')

  for (const note of data) {
    // Build frontmatter
    const frontmatter = [
      '---',
      `title: "${note.title.replace(/"/g, '\\"')}"`,
      `type: ${note.note_type}`,
      `maturity: ${note.maturity}`,
      note.domain ? `domain: ${note.domain}` : null,
      note.tags?.length ? `tags: [${note.tags.map((t: string) => `"${t}"`).join(', ')}]` : null,
      `created: ${note.created_at}`,
      `updated: ${note.updated_at}`,
      '---',
      '',
    ].filter(Boolean).join('\n')

    const filename = `${sanitizeFilename(note.title || 'untitled')}.md`
    folder.file(filename, frontmatter + note.content)
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  const dateStr = new Date().toISOString().split('T')[0]
  saveAs(blob, `brain2-vault-${dateStr}.zip`)
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || 'untitled'
}