import { useState } from 'react'
import type { Note, NoteType, MaturityLevel } from '../../lib/types'
import { NOTE_TYPES, MATURITY_LEVELS } from '../../lib/constants'
import { useToast } from '../shared/Toast'
import { Button } from '../shared/Button'

interface NoteEditorProps {
  note: Partial<Note>
  onSave: (data: Partial<Note>) => Promise<void>
  onCancel: () => void
}

export function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const { success, error: showError } = useToast()
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [title, setTitle] = useState(note.title || '')
  const [content, setContent] = useState(note.content || '')
  const [domain, setDomain] = useState(note.domain || '')
  const [noteType, setNoteType] = useState<NoteType>(note.note_type || 'concept')
  const [maturity, setMaturity] = useState<MaturityLevel>(note.maturity || 'seed')
  const [tags, setTags] = useState(note.tags?.join(', ') || '')

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề cho note.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        content,
        domain: domain.trim() || null,
        note_type: noteType as any,
        maturity: maturity as any,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      success('Đã lưu!', 'Note của bạn đã được lưu.')
    } catch {
      showError('Lỗi', 'Không thể lưu. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const insertMarkdown = (before: string, after = '') => {
    const textarea = document.querySelector('.note-editor-textarea') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  const toolbarActions = [
    { label: 'B', title: 'Bold', action: () => insertMarkdown('**', '**') },
    { label: 'I', title: 'Italic', action: () => insertMarkdown('*', '*') },
    { label: 'H', title: 'Heading', action: () => insertMarkdown('## ') },
    { label: '—', title: 'List', action: () => insertMarkdown('- ') },
    { label: '🔗', title: 'Link', action: () => insertMarkdown('[', '](url)') },
  ]

  return (
    <div className="note-editor">
      {/* Toolbar */}
      <div className="note-editor-toolbar">
        <div className="note-editor-toolbar-actions">
          {toolbarActions.map(action => (
            <button
              key={action.label}
              className="note-editor-toolbar-btn"
              onClick={action.action}
              title={action.title}
            >
              {action.label}
            </button>
          ))}
        </div>
        <button
          className={`note-editor-preview-toggle ${showPreview ? 'active' : ''}`}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? '✏️ Sửa' : '👁️ Xem'}
        </button>
      </div>

      <div className="note-editor-body">
        {/* Edit */}
        {!showPreview && (
          <div className="note-editor-edit">
            <input
              className="input note-editor-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Tiêu đề note..."
              autoFocus
            />

            {/* Meta row */}
            <div className="note-editor-meta">
              <select
                className="input note-editor-select"
                value={noteType}
                onChange={e => setNoteType(e.target.value as NoteType)}
              >
                {NOTE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
              <select
                className="input note-editor-select"
                value={maturity}
                onChange={e => setMaturity(e.target.value as MaturityLevel)}
              >
                {MATURITY_LEVELS.map(m => (
                  <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                ))}
              </select>
              <input
                className="input"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="Domain..."
              />
            </div>

            <textarea
              className="input note-editor-textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Viết nội dung note ở đây...&#10;&#10;Hỗ trợ markdown: **bold**, *italic*, ## heading, - list, `code`"
              rows={15}
            />

            <input
              className="input"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Tags (comma-separated): tag1, tag2..."
            />
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="note-editor-preview">
            <h2 className="note-editor-preview-title">{title || 'Untitled'}</h2>
            <div className="note-editor-preview-meta">
              <span>{NOTE_TYPES.find(t => t.value === noteType)?.icon} {NOTE_TYPES.find(t => t.value === noteType)?.label}</span>
              <span>{MATURITY_LEVELS.find(m => m.value === maturity)?.icon} {MATURITY_LEVELS.find(m => m.value === maturity)?.label}</span>
              {domain && <span className="note-domain-badge">{domain}</span>}
            </div>
            <div
              className="note-editor-preview-content"
              dangerouslySetInnerHTML={{
                __html: content
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>')
                  .replace(/`([^`]+)`/g, '<code>$1</code>')
                  .replace(/^## (.+)$/gm, '<h3>$1</h3>')
                  .replace(/^### (.+)$/gm, '<h4>$1</h4>')
                  .replace(/^- (.+)$/gm, '<li>$1</li>')
                  .replace(/\n/g, '<br>')
              }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="note-editor-footer">
        <Button variant="ghost" onClick={onCancel}>Hủy</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : '💾 Lưu note'}
        </Button>
      </div>
    </div>
  )
}
