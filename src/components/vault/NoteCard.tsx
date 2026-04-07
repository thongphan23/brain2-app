import type { Note } from '../../lib/types'
import { NOTE_TYPES, MATURITY_LEVELS } from '../../lib/constants'

interface NoteCardProps {
  note: Note
  onClick: (note: Note) => void
  isActive?: boolean
}

export function NoteCard({ note, onClick, isActive }: NoteCardProps) {
  const typeInfo = NOTE_TYPES.find(t => t.value === note.note_type) || NOTE_TYPES[0]
  const maturityInfo = MATURITY_LEVELS.find(m => m.value === note.maturity) || MATURITY_LEVELS[0]

  return (
    <div
      className={`note-card ${isActive ? 'active' : ''}`}
      onClick={() => onClick(note)}
    >
      <div className="note-card-header">
        <span className="note-card-type-icon">{typeInfo.icon}</span>
        <span className="note-card-maturity">{maturityInfo.icon}</span>
      </div>
      <div className="note-card-title">{note.title || 'Untitled'}</div>
      {note.domain && (
        <div className="note-card-domain">{note.domain}</div>
      )}
      <div className="note-card-preview">
        {note.content?.substring(0, 100)}
        {(note.content?.length || 0) > 100 ? '...' : ''}
      </div>
      <div className="note-card-footer">
        {note.tags?.slice(0, 3).map(tag => (
          <span key={tag} className="note-card-tag">{tag}</span>
        ))}
      </div>
    </div>
  )
}
