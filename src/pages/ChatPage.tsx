import { useState, useEffect } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Header } from '../components/layout/Header'
import { ChatInterface } from '../components/chat/ChatInterface'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { CognitiveTool } from '../lib/types'

const ONBOARDING_PROMPT_KEY = 'brain2_first_prompt'

export function ChatPage() {
  const { user, profile } = useAuth()
  const [tools, setTools] = useState<CognitiveTool[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState('chat_free')

  // Load tools
  useEffect(() => {
    if (!user) return
    supabase
      .from('cognitive_tools')
      .select('*')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) setTools(data as CognitiveTool[])
      })
  }, [user])

  // Load conversations for sidebar
  const loadConversations = async () => {
    if (!user) return
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50)
    if (data) setConversations(data)
  }

  useEffect(() => {
    loadConversations()
  }, [user])

  // Auto-send first prompt from onboarding
  const [initialPrompt] = useState(() => {
    const p = sessionStorage.getItem(ONBOARDING_PROMPT_KEY)
    sessionStorage.removeItem(ONBOARDING_PROMPT_KEY)
    return p ?? undefined
  })

  const handleConversationChange = (id: string | null, mode: string) => {
    setActiveConvId(id)
    setActiveMode(mode)
  }

  const handleNewChat = async () => {
    setActiveConvId(null)
  }

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id)
  }

  if (!user || !profile) return null

  const currentTool = tools.find(t => t.slug === activeMode)
  const modeName = currentTool?.name
    || ({ chat_free: 'Tự do', reflect: 'Chiêm nghiệm', deep_research: 'Nghiên cứu', mentoring: 'Cố vấn' }[activeMode] || activeMode)

  return (
    <AppLayout
      conversations={conversations}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
      activeConversationId={activeConvId}
      header={
        <Header
          title="Chat"
          subtitle={modeName}
          badge={profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
        />
      }
    >
      <ChatInterface
        userId={user.id}
        profile={profile}
        tools={tools}
        onConversationChange={handleConversationChange}
        onConversationsChange={loadConversations}
        initialPrompt={initialPrompt}
      />
    </AppLayout>
  )
}
