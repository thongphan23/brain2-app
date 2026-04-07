import { useState, useRef, useEffect } from 'react'
import { AI_MODELS, TIER_COLORS } from '../../lib/constants'
import type { TierType } from '../../lib/types'

interface ModelSelectorProps {
  selectedModel: string
  userTier: TierType
  onModelChange: (modelId: string) => void
}

export function ModelSelector({ selectedModel, userTier, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = AI_MODELS.find(m => m.id === selectedModel)

  // If selected model is locked by tier, auto-switch to first allowed
  useEffect(() => {
    const tierOrder: TierType[] = ['free', 'pro', 'vip']
    const userTierIndex = tierOrder.indexOf(userTier)
    const model = AI_MODELS.find(m => m.id === selectedModel)
    if (model) {
      const modelTierIndex = tierOrder.indexOf(model.tier as TierType)
      if (modelTierIndex > userTierIndex) {
        const fallback = AI_MODELS.find(m => tierOrder.indexOf(m.tier as TierType) <= userTierIndex)
        if (fallback) onModelChange(fallback.id)
      }
    }
  }, [userTier])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const tierOrder: TierType[] = ['free', 'pro', 'vip']
  const userTierIndex = tierOrder.indexOf(userTier)

  const groupedModels = tierOrder.map(tier => ({
    tier,
    models: AI_MODELS.filter(m => m.tier === tier),
  }))

  const isLocked = (modelTier: string) => {
    const modelTierIndex = tierOrder.indexOf(modelTier as TierType)
    return modelTierIndex > userTierIndex
  }

  return (
    <div className="model-selector-wrap" ref={ref}>
      <button
        className="model-selector-btn"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <span>{selected?.icon} {selected?.name || 'Model'}</span>
        <span style={{ fontSize: '0.6rem' }}>▾</span>
      </button>

      {open && (
        <div className="model-dropdown" style={{
          position: 'absolute',
          bottom: '100%',
          right: 0,
          marginBottom: '8px',
          minWidth: '280px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50,
          overflow: 'hidden',
          animation: 'dropIn 0.15s ease',
        }}>
          {groupedModels.map(group => (
            group.models.length > 0 && (
              <div key={group.tier}>
                <div style={{
                  padding: '6px 12px',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: TIER_COLORS[group.tier] || 'var(--text-muted)',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                }}>
                  {group.tier === 'free' ? '🆓 Free' : group.tier === 'pro' ? '💫 Pro' : '👑 VIP'}
                </div>
                {group.models.map(model => {
                  const locked = isLocked(model.tier)
                  return (
                    <div
                      key={model.id}
                      onClick={() => {
                        if (!locked) {
                          onModelChange(model.id)
                          setOpen(false)
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        cursor: locked ? 'not-allowed' : 'pointer',
                        opacity: locked ? 0.5 : 1,
                        transition: 'background 0.12s',
                        background: selectedModel === model.id ? 'var(--primary-glow)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!locked) (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)' }}
                      onMouseLeave={e => { if (!locked) (e.currentTarget as HTMLElement).style.background = selectedModel === model.id ? 'var(--primary-glow)' : 'transparent' }}
                    >
                      <span style={{ fontSize: '1rem' }}>{locked ? '🔒' : model.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {model.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {model.desc}
                        </div>
                      </div>
                      {locked && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          Nâng cấp
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
