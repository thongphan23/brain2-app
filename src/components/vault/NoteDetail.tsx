import { useState, useEffect } from 'react'
import type { Note, NoteType, MaturityLevel } from '../../lib/types'
import { NOTE_TYPES, MATURITY_LEVELS } from '../../lib/constants'
import { Button } from '../shared/Button'
import { useToast } from '../shared/Toast'

interface NoteDetailProps {
  note: Note
  onSave: (data: Partial<Note>) => Promise<void>
  onDelete: () => Promise<void>
  onClose: () => void
}

export function NoteDetail({ note, onSave, onDelete, onClose }: NoteDetailProps) {
  const { success, error: showError } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [domain, setDomain] = useState(note.domain || '')
  const [noteType, setNoteType] = useState<NoteType>(note.note_type)
  const [maturity, setMaturity] = useState<MaturityLevel>(note.maturity)
  const [tags, setTags] = useState(note.tags?.join(', ') || '')
  const [hasChanges, setHasChanges] = useState(false)

  // Sync when note changes
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setDomain(note.domain || '')
    setNoteType(note.note_type)
    setMaturity(note.maturity)
    setTags(note.tags?.join(', ') || '')
    setHasChanges(false)
    setEditing(false)
  }, [note.id])

  const markChanged = () => setHasChanges(true)

  const handleSave = async () => {
    if (!hasChanges) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim() || 'Untitled',
        content,
        domain: domain.trim() || null,
        note_type: noteType,
        maturity,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      success('Đã lưu!', 'Note của bạn đã được cập nhật.')
      setHasChanges(false)
      setEditing(false)
    } catch {
      showError('Lỗi', 'Không thể lưu. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Xóa note này?')) return
    setDeleting(true)
    try {
      await onDelete()
      success('Đã xóa', 'Note đã được xóa khỏi vault.')
    } catch {
      showError('Lỗi', 'Không thể xóa.')
    } finally {
      setDeleting(false)
    }
  }

  const lastEdited = new Date(note.updated_at).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="note-detail">
      {/* Toolbar */}
      <div className="note-detail-toolbar">
        <button className="note-close-btn" onClick={onClose} title="Đóng">✕</button>
        <div className="note-detail-actions">
          {!editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              ✏️ Sửa
            </Button>
          )}
          {editing && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={saving || !hasChanges}
              >
                {saving ? 'Đang lưu...' : '💾 Lưu'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setEditing(false); markChanged(); }}>
                Hủy
              </Button>
            </>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '...' : '🗑️'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="note-detail-content">
        {/* Title */}
        <div className="note-detail-field">
          {editing ? (
            <input
              className="input note-title-input"
              value={title}
              onChange={e => { setTitle(e.target.value); markChanged(); }}
              placeholder="Tiêu đề..."
            />
          ) : (
            <h1 className="note-detail-title">{title || 'Untitled'}</h1>
          )}
        </div>

        {/* Meta row */}
        <div className="note-detail-meta-row">
          {/* Note Type */}
          <div className="note-meta-group">
            <label className="note-meta-label">Loại</label>
            <div className="note-meta-pills">
              {NOTE_TYPES.map(t => (
                <button
                  key={t.value}
                  className={`note-meta-pill ${noteType === t.value ? 'active' : ''}`}
                  onClick={() => {
                    if (editing) { setNoteType(t.value as NoteType); markChanged(); }
                  }}
                  disabled={!editing}
                  title={t.label}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Maturity */}
          <div className="note-meta-group">
            <label className="note-meta-label">Maturity</label>
            <div className="note-meta-pills">
              {MATURITY_LEVELS.map(m => (
                <button
                  key={m.value}
                  className={`note-meta-pill ${maturity === m.value ? 'active' : ''}`}
                  onClick={() => {
                    if (editing) { setMaturity(m.value as MaturityLevel); markChanged(); }
                  }}
                  disabled={!editing}
                  title={m.desc}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Domain */}
        <div className="note-detail-field">
          <label className="note-meta-label">Domain</label>
          {editing ? (
            <input
              className="input"
              value={domain}
              onChange={e => { setDomain(e.target.value); markChanged(); }}
              placeholder="VD: Tâm lý, Kinh doanh, Sáng tạo..."
            />
          ) : (
            <span className="note-domain-badge">
              {domain || 'Chưa phân loại'}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="note-detail-field">
          <label className="note-meta-label">Tags</label>
          {editing ? (
            <input
              className="input"
              value={tags}
              onChange={e => { setTags(e.target.value); markChanged(); }}
              placeholder="tag1, tag2, tag3..."
            />
          ) : (
            <div className="note-tags-display">
              {note.tags?.length ? note.tags.map(tag => (
                <span key={tag} className="note-tag">{tag}</span>
              )) : <span className="text-muted text-sm">Không có tags</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="note-detail-field note-content-field">
          <label className="note-meta-label">Nội dung</label>
          {editing ? (
            <textarea
              className="input note-content-editor"
              value={content}
              onChange={e => { setContent(e.target.value); markChanged(); }}
              placeholder="Viết nội dung note ở đây..."
              rows={12}
            />
          ) : (
            <div
              className="note-content-display"
              dangerouslySetInnerHTML={{
                __html: content
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>')
                  .replace(/`([^`]+)`/g, '<code>$1</code>')
                  .replace(/\n/g, '<br>')
              }}
            />
          )}
        </div>

        {/* Timestamp */}
        <div className="note-detail-timestamp">
          Sửa lần cuối: {lastEdited}
        </div>
      </div>
    </div>
  )
}
