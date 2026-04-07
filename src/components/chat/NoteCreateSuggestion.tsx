import { Button } from '../shared/Button'
import type { NoteSuggestion } from '../../lib/types'

interface NoteCreateSuggestionProps {
  suggestion: NoteSuggestion
  onAccept: () => void
  onDismiss: () => void
  loading?: boolean
}

export function NoteCreateSuggestion({
  suggestion,
  onAccept,
  onDismiss,
  loading = false,
}: NoteCreateSuggestionProps) {
  return (
    <div className="note-suggestion animate-slide-up">
      <div className="note-suggestion-icon">💡</div>
      <div className="note-suggestion-content">
        <div className="note-suggestion-title">{suggestion.title}</div>
        <div className="note-suggestion-preview">
          {suggestion.content.substring(0, 120)}
          {suggestion.content.length > 120 ? '...' : ''}
        </div>
      </div>
      <div className="note-suggestion-actions">
        <Button
          variant="primary"
          size="sm"
          onClick={onAccept}
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : '💾 Lưu'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Bỏ qua
        </Button>
      </div>
    </div>
  )
}
