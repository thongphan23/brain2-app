interface ModeSelectorProps {
  modes: { slug: string; name: string; icon: string; description: string }[]
  activeMode: string
  onModeChange: (slug: string) => void
}

export function ModeSelector({ modes, activeMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <div className="mode-pills">
        {modes.map(mode => (
          <button
            key={mode.slug}
            className={`mode-pill ${activeMode === mode.slug ? 'active' : ''}`}
            onClick={() => onModeChange(mode.slug)}
            title={mode.description}
          >
            <span className="mode-pill-icon">{mode.icon}</span>
            <span className="mode-pill-label">{mode.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export const DEFAULT_MODES = [
  { slug: 'chat_free', name: 'Tự do', icon: '💬', description: 'Chat tự do, AI hiểu context vault của bạn' },
  { slug: 'reflect', name: 'Chiêm nghiệm', icon: '🪞', description: 'AI dẫn dắt chiêm nghiệm trải nghiệm, rút insight' },
  { slug: 'deep_research', name: 'Nghiên cứu', icon: '🔬', description: 'Phân tích sâu 1 concept, tạo atomic notes chất lượng' },
  { slug: 'mentoring', name: 'Cố vấn', icon: '🧠', description: 'AI cố vấn cá nhân, hiểu bạn qua vault' },
]
