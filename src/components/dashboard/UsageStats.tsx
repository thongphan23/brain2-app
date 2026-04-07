import { TIER_ICONS } from '../../lib/constants'

interface UsageStatsProps {
  messagesUsed: number
  messagesLimit: number
  notesCreated: number
  tier: string
  loading?: boolean
}

export function UsageStats({ messagesUsed, messagesLimit, notesCreated, tier }: UsageStatsProps) {
  const pct = messagesLimit > 0 ? Math.min((messagesUsed / messagesLimit) * 100, 100) : 0

  return (
    <div className="usage-stats">
      <div className="usage-stats-header">
        <span>{TIER_ICONS[tier] || '🆓'}</span>
        <span className="usage-stats-tier">{tier.toUpperCase()}</span>
      </div>
      <div className="usage-stats-row">
        <span>Tin nhắn hôm nay</span>
        <span className="usage-stats-val">{messagesUsed}/{messagesLimit === 9999 ? '∞' : messagesLimit}</span>
      </div>
      <div className="usage-stats-progress">
        <div
          className="usage-stats-progress-fill"
          style={{
            width: `${pct}%`,
            background: pct > 80 ? 'var(--warning)' : pct > 95 ? 'var(--error)' : 'var(--primary)',
          }}
        />
      </div>
      <div className="usage-stats-row">
        <span>Notes tuần này</span>
        <span className="usage-stats-val">{notesCreated}</span>
      </div>
    </div>
  )
}