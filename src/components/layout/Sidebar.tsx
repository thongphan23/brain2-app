import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { NAV_ITEMS, TIER_ICONS } from '../../lib/constants'
import type { Conversation } from '../../lib/types'

interface SidebarProps {
  conversations?: Conversation[]
  onNewChat?: () => void
  onSelectConversation?: (id: string) => void
  activeConversationId?: string | null
  collapsed?: boolean
}

export function Sidebar({
  conversations = [],
  onNewChat,
  onSelectConversation,
  activeConversationId,
  collapsed = false,
}: SidebarProps) {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const tier = profile?.tier || 'free'

  return (
    <aside className={`sidebar ${collapsed ? '' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <Link to="/chat" className="sidebar-logo" style={{ textDecoration: 'none' }}>
          <span className="sidebar-logo-icon">🧠</span>
          <span>Brain2</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-label">Menu</div>
        <ul className="sidebar-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`sidebar-item ${location.pathname.startsWith(item.to) ? 'active' : ''}`}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-text">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Conversations */}
      <div className="sidebar-section-grow">
        <div className="sidebar-label">Hội thoại gần đây</div>
        <button className="sidebar-new-chat-btn" onClick={onNewChat}>
          <span>+</span> Hội thoại mới
        </button>
        <div className="conversation-list" style={{ marginTop: '8px' }}>
          {conversations.slice(0, 20).map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${activeConversationId === conv.id ? 'active' : ''}`}
              onClick={() => onSelectConversation?.(conv.id)}
            >
              <span style={{ fontSize: '0.8rem' }}>💬</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.title || 'Hội thoại không tên'}
              </span>
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Chưa có hội thoại nào
            </div>
          )}
        </div>
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{displayName}</div>
          <div className="user-tier">
            {TIER_ICONS[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </div>
        </div>
        <button
          onClick={signOut}
          className="logout-btn"
          title="Đăng xuất"
        >
          ↗
        </button>
      </div>
    </aside>
  )
}
