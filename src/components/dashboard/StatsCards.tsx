import { Skeleton } from '../shared/Skeleton'

interface StatsCardsProps {
  totalNotes: number
  totalConnections: number
  domainCount: number
  overallScore: number
  loading?: boolean
}

const CARDS = [
  { icon: '📝', label: 'Tổng notes', key: 'notes' as const, color: 'var(--primary)' },
  { icon: '🔗', label: 'Kết nối', key: 'connections' as const, color: 'var(--accent)' },
  { icon: '🌍', label: 'Domains', key: 'domains' as const, color: 'var(--success)' },
  { icon: '⭐', label: 'Điểm tổng', key: 'score' as const, color: 'var(--accent)' },
]

export function StatsCards({ totalNotes, totalConnections, domainCount, overallScore, loading }: StatsCardsProps) {
  const values = [totalNotes, totalConnections, domainCount, overallScore]

  return (
    <div className="stats-cards">
      {CARDS.map((card, i) => (
        <div key={card.key} className="stats-card">
          {loading ? (
            <Skeleton height="60px" />
          ) : (
            <>
              <div className="stats-card-icon" style={{ color: card.color }}>{card.icon}</div>
              <div className="stats-card-value" style={{ color: card.color }}>
                {i === 3 ? `${Math.round(Number(overallScore) * 100)}%` : values[i]}
              </div>
              <div className="stats-card-label">{card.label}</div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
