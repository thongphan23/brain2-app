import { useState, useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { ModeSelector, DEFAULT_MODES } from './ModeSelector'
import { ModelSelector } from './ModelSelector'
import { NoteCreateSuggestion } from './NoteCreateSuggestion'
import { useChat } from '../../hooks/useChat'
import { useConversations } from '../../hooks/useConversations'
import { useVault } from '../../hooks/useVault'
import { useTier } from '../../hooks/useTier'
import { useToast } from '../shared/Toast'
import type { TierType, CognitiveTool } from '../../lib/types'
import type { Profile } from '../../lib/types'

interface ChatInterfaceProps {
  userId: string
  profile: Profile | null
  tools: CognitiveTool[]
  onConversationChange?: (id: string | null, mode: string) => void
  onConversationsChange?: () => void
  initialPrompt?: string
}

const SUGGESTED_PROMPTS = [
  { icon: '📊', label: 'Phân tích kỹ năng hiện tại của tôi', prompt: 'Phân tích kỹ năng hiện tại của tôi dựa trên những gì tôi đã học và trải nghiệm?' },
  { icon: '🔍', label: 'Gợi ý chủ đề nên nghiên cứu', prompt: 'Dựa trên vault của tôi, gợi ý 3 chủ đề tôi nên nghiên cứu sâu tiếp theo?' },
  { icon: '📝', label: 'Tổng hợp bài học tuần này', prompt: 'Giúp tôi tổng hợp những bài học quan trọng từ tuần này?' },
  { icon: '🧠', label: 'Tư duy về...', prompt: 'Tôi đang muốn suy nghĩ sâu hơn về: ' },
]

export function ChatInterface({
  userId,
  profile,
  tools,
  onConversationChange,
  onConversationsChange,
  initialPrompt,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [activeMode, setActiveMode] = useState('chat_free')
  const [selectedModel, setSelectedModel] = useState('free/qwen3-235b')
  const [inputKey, setInputKey] = useState(0)
  const [savingNote, setSavingNote] = useState(false)
  const [autoSent, setAutoSent] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    isStreaming,
    error,
    conversationId,
    noteSuggestion,
    sendMessage,
    clearChat,
    dismissNoteSuggestion,
    setConversationId,
  } = useChat(userId)

  const {
    activeId,
    loadConversations,
    selectConversation,
    createConversation,
  } = useConversations(userId)

  const { success, error: showError } = useToast()
  const { createNote, refreshNotes } = useVault(userId)
  const { usageToday, limits, checkCanSendMessage, refreshUsage } = useTier(userId)

  // Refresh usage on mount
  useEffect(() => {
    refreshUsage()
  }, [refreshUsage])

  const userTier: TierType = profile?.tier || 'free'

  // Sync conversation selection
  useEffect(() => {
    if (activeId && activeId !== conversationId) {
      setConversationId(activeId)
    }
  }, [activeId, conversationId, setConversationId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-send first prompt from onboarding
  useEffect(() => {
    if (!initialPrompt || messages.length > 0 || isStreaming || autoSent) return
    setInput(initialPrompt)
    setAutoSent(true)
    // Small delay to let state settle before triggering send
    const timer = setTimeout(() => {
      const sendFn = async () => {
        if (!initialPrompt.trim()) return
        const text = initialPrompt.trim()
        setInput('')
        setInputKey(k => k + 1)
        const convId: string | null = await createConversation(activeMode) || null
        if (convId) selectConversation(convId)
        onConversationChange?.(convId, activeMode)
        await sendMessage(text, activeMode, selectedModel, convId ?? undefined)
        await refreshUsage()
        await loadConversations()
        onConversationsChange?.()
      }
      sendFn()
    }, 200)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleModeChange = async (slug: string) => {
    if (activeMode === slug) return
    setActiveMode(slug)
    clearChat()
    // Create new conversation for this mode
    const newId = await createConversation(slug) || null
    if (newId) {
      selectConversation(newId)
      onConversationChange?.(newId, slug)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    if (!checkCanSendMessage()) {
      showError(
        'Đã hết lượt hôm nay',
        `Bạn đã dùng ${usageToday.messages_used}/${limits.messages_per_day} tin nhắn. Nâng cấp Pro để có 200 tin nhắn/ngày.`
      )
      return
    }

    const text = input.trim()
    setInput('')
    setInputKey(k => k + 1)

    let convId = conversationId || undefined
    if (!convId) {
      convId = await createConversation(activeMode) || undefined
      if (convId) {
        selectConversation(convId)
        onConversationChange?.(convId, activeMode)
      }
    }

    await sendMessage(text, activeMode, selectedModel, convId)
    // Refresh usage + conversation list
    await refreshUsage()
    await loadConversations()
    onConversationsChange?.()
  }

  const handleNewChat = () => {
    clearChat()
    setConversationId(null)
    selectConversation(null)
    onConversationChange?.(null, activeMode)
  }

  const handleAcceptNote = async () => {
    if (!noteSuggestion) return
    setSavingNote(true)
    try {
      await createNote({
        title: noteSuggestion.title,
        content: noteSuggestion.content,
        note_type: noteSuggestion.note_type || 'insight',
        domain: noteSuggestion.domain || null,
        maturity: 'seed',
      })
      dismissNoteSuggestion()
      success('Đã lưu!', 'Note của bạn đã được lưu vào Vault.')
      refreshNotes()
    } catch {
      showError('Lỗi', 'Không thể lưu note. Vui lòng thử lại.')
    } finally {
      setSavingNote(false)
    }
  }

  // Merge tools with defaults
  const activeModes = tools.length > 0
    ? tools.filter(t => t.is_active).map(t => ({
        slug: t.slug,
        name: t.name,
        icon: t.icon,
        description: t.description,
      }))
    : DEFAULT_MODES

  const hasMessages = messages.length > 0

  return (
    <div className="chat-interface">
      {/* Mode Selector — sticky top */}
      <div className="chat-mode-bar">
        <ModeSelector
          modes={activeModes}
          activeMode={activeMode}
          onModeChange={handleModeChange}
        />
        <button
          className="new-chat-inline-btn"
          onClick={handleNewChat}
          title="Hội thoại mới"
        >
          ＋
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-area">
        {!hasMessages && !isStreaming ? (
          /* Welcome State */
          <div className="chat-welcome">
            <div className="chat-welcome-hero">
              <div className="chat-welcome-logo">🧠 Brain2</div>
              <p className="chat-welcome-subtitle">
                Bạn muốn khám phá gì hôm nay?
              </p>
            </div>

            <div className="chat-suggested-prompts">
              {SUGGESTED_PROMPTS.map((sp, i) => (
                <button
                  key={i}
                  className="chat-suggested-chip"
                  onClick={() => {
                    setInput(sp.prompt)
                    // Auto-focus
                  }}
                >
                  <span>{sp.icon}</span>
                  <span>{sp.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages-scroll">
            {messages.map((msg, idx) => {
              const prevMsg = idx > 0 ? messages[idx - 1] : null
              const isGrouped = prevMsg?.role === msg.role
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isGrouped={isGrouped}
                  toolName={activeModes.find(m => m.slug === activeMode)?.name || 'Brain2'}
                />
              )
            })}

            {/* Streaming indicator */}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="message thinking-streaming">
                <div className="message-avatar assistant">🧠</div>
                <div className="message-content">
                  <div className="thinking-indicator">
                    <div className="thinking-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span className="thinking-text">Brain2 đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="chat-error">
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Note Suggestion */}
      {noteSuggestion && (
        <NoteCreateSuggestion
          suggestion={noteSuggestion}
          onAccept={handleAcceptNote}
          onDismiss={dismissNoteSuggestion}
          loading={savingNote}
        />
      )}

      {/* Input Area */}
      <div className="chat-input-area">
        <ChatInput
          key={inputKey}
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isStreaming={isStreaming}
          placeholder={`Hỏi ${activeModes.find(m => m.slug === activeMode)?.name || 'Brain2'}...`}
          modelSelector={
            <ModelSelector
              selectedModel={selectedModel}
              userTier={userTier}
              onModelChange={setSelectedModel}
            />
          }
          usageBadge={
            <span className="chat-usage-badge" title="Tin nhắn hôm nay">
              {usageToday.messages_used}/{limits.messages_per_day}
            </span>
          }
        />
      </div>
    </div>
  )
}
