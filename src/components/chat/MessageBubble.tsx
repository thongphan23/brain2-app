import { useMemo } from 'react'
import type { Message } from '../../lib/types'

interface MessageBubbleProps {
  message: Message
  isGrouped?: boolean
  toolName?: string
}

// Simple markdown renderer using dangerouslySetInnerHTML for demo
// PRD says regex-based — we'll implement it properly
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks (```lang\ncode\n```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-block-lang">${lang || 'code'}</span>
        <button class="code-copy-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').innerText)">📋 Copy</button>
      </div>
      <pre class="code-pre"><code>${escaped}</code></pre>
    </div>`
  })

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // Bold (**text**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic (*text*)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>')

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>')

  // Paragraphs (double newline)
  html = html.split(/\n\n+/).map(block => {
    if (block.startsWith('<') || !block.trim()) return block
    return `<p>${block.replace(/\n/g, '<br>')}</p>`
  }).join('')

  return html
}

export function MessageBubble({ message, isGrouped = false, toolName = 'Brain2' }: MessageBubbleProps) {
  const html = useMemo(() => renderMarkdown(message.content), [message.content])

  const timeStr = new Date(message.created_at).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isUser = message.role === 'user'

  return (
    <div
      className={`message ${isGrouped ? 'grouped' : ''}`}
      style={isUser ? { justifyContent: 'flex-end' } : {}}
    >
      {isUser ? (
        <div
          className="message-bubble user"
          style={{
            maxWidth: '75%',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            padding: '10px 14px',
            borderBottomRightRadius: '4px',
          }}
        >
          <div
            className="message-text"
            style={{ color: 'var(--text-primary)' }}
          >
            {message.content.split('\n').map((line, i) => (
              <p key={i} style={{ marginBottom: i < message.content.split('\n').length - 1 ? '0.3em' : 0 }}>
                {line || '\u00A0'}
              </p>
            ))}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
            {timeStr}
          </div>
        </div>
      ) : (
        <>
          {!isGrouped && (
            <div className="message-avatar assistant">🧠</div>
          )}
          <div
            className="message-content"
            style={isGrouped ? { marginLeft: isGrouped ? '44px' : undefined } : { flex: 1 }}
          >
            {!isGrouped && (
              <div className="message-role">{toolName}</div>
            )}
            <div
              className="message-text"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {!isGrouped && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {timeStr}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
