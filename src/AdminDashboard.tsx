import { useState, useEffect, useCallback } from 'react'
import { supabase, EDGE_FUNCTION_URL } from './lib/supabase'

interface Overview {
  overview: {
    total_users: number
    active_today: number
    total_notes: number
    total_conversations: number
    total_messages: number
    notion_connections: number
  }
  tiers: Record<string, number>
  mode_usage_7d: Record<string, number>
}

interface UserRow {
  id: string
  email: string
  display_name: string | null
  created_at: string
  tier: string
  total_messages: number
  daily_messages: number
  notes_count: number
  conversations_count: number
}

interface ActivityRow {
  id: string
  email: string
  tool_slug: string
  content_preview: string
  created_at: string
}

const TIER_COLORS: Record<string, string> = {
  free: '#888',
  pro: '#6C63FF',
  vip: '#FFD700',
}

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'users' | 'activity'>('overview')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }, [])

  const callAdmin = useCallback(async (action: string) => {
    const token = await getToken()
    const res = await fetch(`${EDGE_FUNCTION_URL}/admin-dashboard?action=${action}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data
  }, [getToken])

  useEffect(() => { loadTab(tab) }, [tab])

  const loadTab = async (t: string) => {
    try {
      setLoading(true)
      setError(null)
      switch (t) {
        case 'overview': setOverview(await callAdmin('overview')); break
        case 'users': setUsers(await callAdmin('users')); break
        case 'activity': setActivity(await callAdmin('activity')); break
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>🎛️ Admin Dashboard</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {(['overview', 'users', 'activity'] as const).map(t => (
            <button
              key={t}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
              onClick={() => setTab(t)}
            >
              {t === 'overview' ? '📊 Tổng quan' : t === 'users' ? '👥 Users' : '📝 Hoạt động'}
            </button>
          ))}
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <div style={styles.content}>
          {loading ? (
            <div style={styles.center}>
              <div style={styles.spinner} />
              <p>Đang tải...</p>
            </div>
          ) : tab === 'overview' && overview ? (
            <div>
              {/* Stats Grid */}
              <div style={styles.statsGrid}>
                <StatCard label="Tổng Users" value={overview.overview.total_users} icon="👥" />
                <StatCard label="Active Hôm nay" value={overview.overview.active_today} icon="🟢" />
                <StatCard label="Tổng Notes" value={overview.overview.total_notes} icon="📝" />
                <StatCard label="Tổng Hội thoại" value={overview.overview.total_conversations} icon="💬" />
                <StatCard label="Tổng Messages" value={overview.overview.total_messages} icon="📨" />
                <StatCard label="Notion Kết nối" value={overview.overview.notion_connections} icon="📓" />
              </div>

              {/* Tiers */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Phân bổ Tier</h3>
                <div style={styles.tierRow}>
                  {Object.entries(overview.tiers).map(([tier, count]) => (
                    <div key={tier} style={styles.tierBadge}>
                      <span style={{ ...styles.tierDot, background: TIER_COLORS[tier] || '#888' }} />
                      <span style={styles.tierLabel}>{tier.toUpperCase()}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode Usage */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Mode Usage (7 ngày)</h3>
                <div style={styles.modeGrid}>
                  {Object.entries(overview.mode_usage_7d).map(([mode, count]) => (
                    <div key={mode} style={styles.modeCard}>
                      <div style={styles.modeIcon}>
                        {mode === 'mentoring' ? '🧠' : mode === 'reflect' ? '🪞' : mode === 'deep-research' ? '🔬' : '⚡'}
                      </div>
                      <div style={styles.modeName}>{mode}</div>
                      <div style={styles.modeCount}>{count} msgs</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : tab === 'users' ? (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Tier</th>
                    <th style={styles.th}>Messages</th>
                    <th style={styles.th}>Notes</th>
                    <th style={styles.th}>Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>{u.email || 'N/A'}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.tierTag, background: TIER_COLORS[u.tier] + '22', color: TIER_COLORS[u.tier] }}>
                          {u.tier.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>{u.total_messages}</td>
                      <td style={styles.td}>{u.notes_count}</td>
                      <td style={styles.td}>{new Date(u.created_at).toLocaleDateString('vi')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tab === 'activity' ? (
            <div style={styles.activityList}>
              {activity.map(a => (
                <div key={a.id} style={styles.activityItem}>
                  <div style={styles.activityHeader}>
                    <span style={styles.activityEmail}>{a.email}</span>
                    <span style={styles.activityMode}>{a.tool_slug}</span>
                    <span style={styles.activityTime}>
                      {new Date(a.created_at).toLocaleString('vi')}
                    </span>
                  </div>
                  <div style={styles.activityContent}>{a.content_preview}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { width: 800, maxWidth: '95vw', maxHeight: '85vh', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' },
  title: { fontSize: '1.1rem', fontWeight: 600 },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' },
  tabs: { display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)' },
  tab: { flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' },
  tabActive: { borderBottomColor: 'var(--accent-primary)', color: 'var(--text-accent)' },
  content: { flex: 1, overflow: 'auto', padding: '20px 24px' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40 },
  spinner: { width: 32, height: 32, border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  error: { padding: '8px 24px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.85rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: 16, textAlign: 'center' },
  statIcon: { fontSize: '1.5rem', marginBottom: 4 },
  statValue: { fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-accent)' },
  statLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 },
  tierRow: { display: 'flex', gap: 16 },
  tierBadge: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' },
  tierDot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block' },
  tierLabel: { color: 'var(--text-secondary)', fontSize: '0.8rem' },
  modeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  modeCard: { background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center', border: '1px solid var(--border-subtle)' },
  modeIcon: { fontSize: '1.5rem' },
  modeName: { fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 },
  modeCount: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-accent)', marginTop: 4 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid var(--border-subtle)' },
  td: { padding: '8px 12px' },
  tierTag: { padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600 },
  activityList: { display: 'flex', flexDirection: 'column', gap: 8 },
  activityItem: { padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' },
  activityHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: '0.8rem' },
  activityEmail: { fontWeight: 500 },
  activityMode: { background: 'var(--accent-primary)', color: 'white', padding: '1px 6px', borderRadius: 8, fontSize: '0.7rem' },
  activityTime: { color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.7rem' },
  activityContent: { fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
}
