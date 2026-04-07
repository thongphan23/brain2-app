import { useEffect } from 'react'
import { RadarChart } from './RadarChart'
import { StatsCards } from './StatsCards'
import { MaturityChart } from './MaturityChart'
import { RecommendationCards } from './RecommendationCards'
import { UsageStats } from './UsageStats'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useTier } from '../../hooks/useTier'
import { useAuth } from '../../hooks/useAuth'
import { Skeleton } from '../shared/Skeleton'
import { EmptyState } from '../shared/EmptyState'

const MIN_NOTES_FOR_DASHBOARD = 5

export function KnowledgeDashboard() {
  const { user } = useAuth()
  const { analytics, recommendations, loading, loadAnalytics, dismissRecommendation } = useAnalytics(user?.id)
  const { usageToday, limits, tier } = useTier(user?.id)

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  if (loading) {
    return (
      <div className="knowledge-dashboard">
        <div className="dashboard-skeleton">
          <div className="dashboard-skeleton-cards">
            <Skeleton height="100px" />
            <Skeleton height="100px" />
            <Skeleton height="100px" />
            <Skeleton height="100px" />
          </div>
          <Skeleton height="400px" />
        </div>
      </div>
    )
  }

  const totalNotes = analytics?.total_notes || 0

  if (totalNotes < MIN_NOTES_FOR_DASHBOARD) {
    return (
      <div className="knowledge-dashboard">
        <EmptyState
          icon="🧠"
          title="Cần thêm notes để mở khóa Dashboard"
          description={`Bạn cần ít nhất ${MIN_NOTES_FOR_DASHBOARD} notes để mở khóa bản đồ tri thức. Chat với AI hoặc import notes để bắt đầu.`}
        />
      </div>
    )
  }

  const domainLabels = analytics?.domain_scores?.map(d => d.domain) || []
  const domainValues = analytics?.domain_scores?.map(d => d.score) || []

  return (
    <div className="knowledge-dashboard">
      {/* Top: 4 stats */}
      <div className="dashboard-section">
        <StatsCards
          totalNotes={totalNotes}
          totalConnections={analytics?.total_connections || 0}
          domainCount={domainLabels.length}
          overallScore={analytics?.overall_score || 0}
          loading={loading}
        />
      </div>

      {/* Middle: Radar + Usage */}
      <div className="dashboard-section dashboard-middle">
        <div className="dashboard-radar">
          <div className="dashboard-section-title">🧭 Bản đồ tri thức</div>
          <RadarChart labels={domainLabels} values={domainValues} size={380} />
        </div>
        <div className="dashboard-sidebar">
          <UsageStats
            messagesUsed={usageToday.messages_used}
            messagesLimit={limits.messages_per_day}
            notesCreated={usageToday.notes_created}
            tier={tier}
          />
          <RecommendationCards
            recommendations={recommendations}
            onDismiss={dismissRecommendation}
          />
        </div>
      </div>

      {/* Bottom: Maturity */}
      <div className="dashboard-section">
        <MaturityChart
          data={{
            seed: analytics?.maturity_distribution?.seed || 0,
            growing: analytics?.maturity_distribution?.growing || 0,
            permanent: analytics?.maturity_distribution?.permanent || 0,
          }}
        />
      </div>
    </div>
  )
}
