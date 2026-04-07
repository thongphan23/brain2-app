import { AppLayout } from '../components/layout/AppLayout'
import { Header } from '../components/layout/Header'
import { KnowledgeDashboard } from '../components/dashboard/KnowledgeDashboard'
import { useVault } from '../hooks/useVault'
import { useAuth } from '../hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const { totalCount } = useVault(user?.id)

  return (
    <AppLayout>
      <Header title="Dashboard" badge={`${totalCount} notes`} />
      <div className="page-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="dashboard-page-container">
          <KnowledgeDashboard />
        </div>
      </div>
    </AppLayout>
  )
}
