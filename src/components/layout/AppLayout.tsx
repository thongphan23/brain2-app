import { useState } from 'react'
import { Sidebar } from './Sidebar'
import type { Conversation } from '../../lib/types'

interface AppLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  conversations?: Conversation[]
  onNewChat?: () => void
  onSelectConversation?: (id: string) => void
  activeConversationId?: string | null
}

export function AppLayout({
  children,
  header,
  conversations = [],
  onNewChat,
  onSelectConversation,
  activeConversationId,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          conversations={conversations}
          onNewChat={onNewChat}
          onSelectConversation={(id) => {
            onSelectConversation?.(id)
            setSidebarOpen(false)
          }}
          activeConversationId={activeConversationId}
        />
      </div>

      {/* Main Content */}
      <div className="main-content">
        {header}
        {children}
      </div>
    </div>
  )
}
