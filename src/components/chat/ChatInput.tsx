import { useRef, useEffect, type KeyboardEvent } from 'react'

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  disabled?: boolean
  isStreaming?: boolean
  placeholder?: string
  modelSelector?: React.ReactNode
  usageBadge?: React.ReactNode
  charLimit?: number
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  isStreaming = false,
  placeholder = 'Hỏi Brain2 bất kỳ điều gì...',
  modelSelector,
  usageBadge,
  charLimit = 4000,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`
  }, [value])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && !isStreaming && value.trim()) {
        onSend()
      }
    }
  }

  const remaining = charLimit - value.length
  const nearLimit = remaining < 200 && remaining > 0
  const overLimit = remaining < 0

  return (
    <div className="chat-input-container">
      <div className={`input-wrapper ${isStreaming ? 'streaming' : ''}`}>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          rows={1}
          tabIndex={0}
          aria-label="Nhập tin nhắn cho Brain2"
          aria-multiline="true"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            resize: 'none',
            padding: '8px 12px',
            maxHeight: '150px',
            minHeight: '40px',
          }}
        />
        {modelSelector}
        <button
          className={`send-btn ${!value.trim() || isStreaming ? 'disabled' : ''}`}
          onClick={onSend}
          disabled={!value.trim() || isStreaming}
          aria-label="Gửi tin nhắn"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--primary)',
            color: 'white',
            cursor: value.trim() && !isStreaming ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            transition: 'all 0.15s',
            opacity: !value.trim() || isStreaming ? 0.4 : 1,
            flexShrink: 0,
          }}
        >
          {isStreaming ? '⏳' : '↑'}
        </button>
      </div>
      <div className="input-meta">
        {usageBadge}
        <span style={{ fontSize: '0.65rem', color: nearLimit ? 'var(--warning)' : overLimit ? 'var(--error)' : 'var(--text-muted)' }}>
          {overLimit ? `${Math.abs(remaining)} quá giới hạn` : nearLimit ? `${remaining} ký tự` : ''}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          Enter gửi · Shift+Enter xuống dòng
        </span>
      </div>
    </div>
  )
}
