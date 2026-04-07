import { useNavigate } from 'react-router-dom'
import type { Recommendation } from '../../lib/types'
import { Button } from '../shared/Button'

interface RecommendationCardsProps {
  recommendations: Recommendation[]
  onDismiss: (id: string) => void
  loading?: boolean
}

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  study_topic: { icon: '📚', label: 'Nghiên cứu', color: 'var(--primary)' },
  connect_notes: { icon: '🔗', label: 'Kết nối', color: 'var(--accent)' },
  review_note: { icon: '🔄', label: 'Review', color: 'var(--info)' },
  create_note: { icon: '📝', label: 'Tạo note', color: 'var(--success)' },
}

export function RecommendationCards({ recommendations, onDismiss, loading }: RecommendationCardsProps) {
  const navigate = useNavigate()

  const handleAction = (rec: Recommendation) => {
    if (rec.type === 'study_topic') {
      navigate('/chat')
    } else if (rec.type === 'connect_notes' || rec.type === 'review_note') {
      const noteId = rec.related_note_ids?.[0]
      if (noteId) navigate(`/vault?note=${noteId}`)
      else navigate('/vault')
    }
    onDismiss(rec.id)
  }

  if (loading) return null

  return (
    <div className="recommendation-cards">
      <div className="recommendation-cards-title">💡 Gợi ý cho bạn</div>
      {recommendations.length === 0 && (
        <div className="recommendation-empty">
          Không có gợi ý nào. Hãy chat nhiều hơn để Brain2 hiểu bạn!
        </div>
      )}
      {recommendations.map(rec => {
        const config = TYPE_CONFIG[rec.type] || { icon: '💡', label: rec.type, color: 'var(--primary)' }
        return (
          <div key={rec.id} className="recommendation-card">
            <div className="recommendation-card-header">
              <span className="recommendation-type-badge" style={{ color: config.color }}>
                {config.icon} {config.label}
              </span>
              <button
                className="recommendation-dismiss"
                onClick={() => onDismiss(rec.id)}
                title="Bỏ qua"
              >✕</button>
            </div>
            <div className="recommendation-card-title">{rec.title}</div>
            <div className="recommendation-card-desc">{rec.description}</div>
            <Button variant="ghost" size="sm" onClick={() => handleAction(rec)}>
              {rec.type === 'study_topic' ? 'Bắt đầu nghiên cứu' :
               rec.type === 'connect_notes' ? 'Xem chi tiết' :
               rec.type === 'review_note' ? 'Review ngay' : 'Hành động'}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
