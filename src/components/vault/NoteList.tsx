import type { Note } from '../../lib/types'
import { NOTE_TYPES, MATURITY_LEVELS } from '../../lib/constants'

interface NoteListProps {
  notes: Note[]
  selectedId: string | null
  onSelect: (note: Note) => void
  searchQuery?: string
}

function getNoteTypeInfo(type: string) {
  return NOTE_TYPES.find(t => t.value === type) || NOTE_TYPES[0]
}

function getMaturityInfo(maturity: string) {
  return MATURITY_LEVELS.find(m => m.value === maturity) || MATURITY_LEVELS[0]
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'vừa xong'
  if (diffMins < 60) return `${diffMins}p trước`
  if (diffHours < 24) return `${diffHours}g trước`
  if (diffDays < 7) return `${diffDays}ngày trước`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export function NoteList({ notes, selectedId, onSelect, searchQuery = '' }: NoteListProps) {
  return (
    <div className="note-list">
      {notes.map(note => {
        const typeInfo = getNoteTypeInfo(note.note_type)
        const maturityInfo = getMaturityInfo(note.maturity)
        const isSelected = selectedId === note.id

        // Highlight search match
        const titleHtml = searchQuery
          ? note.title.replace(
              new RegExp(`(${searchQuery})`, 'gi'),
              '<mark>$1</mark>'
            )
          : note.title

        return (
          <div
            key={note.id}
            className={`note-list-item ${isSelected ? 'active' : ''}`}
            onClick={() => onSelect(note)}
          >
            <div className="note-list-item-header">
              <span className="note-type-icon">{typeInfo.icon}</span>
              <span
                className="note-list-title"
                dangerouslySetInnerHTML={{ __html: titleHtml }}
              />
            </div>
            <div className="note-list-item-meta">
              <span className="note-maturity-badge" title={maturityInfo.desc}>
                {maturityInfo.icon}
              </span>
              {note.domain && (
                <span className="note-domain-chip">{note.domain}</span>
              )}
              <span className="note-list-date">{timeAgo(note.updated_at)}</span>
            </div>
            {note.content && (
              <div className="note-list-preview">
                {note.content.substring(0, 80)}
                {note.content.length > 80 ? '...' : ''}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
