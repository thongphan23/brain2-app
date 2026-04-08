import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { ONBOARDING_GOALS } from '../lib/constants'

const ONBOARDING_PROMPT_KEY = 'brain2_first_prompt'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [firstPrompt, setFirstPrompt] = useState('')

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    )
  }

  const handleComplete = async () => {
    if (!user) return
    setLoading(true)

    try {
      // Use update-profile edge function (service role → bypasses RLS)
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      if (!token) {
        console.error('[Onboarding] No session token')
        setLoading(false)
        return
      }

      const { error: callError } = await supabase.functions.invoke('update-profile', {
        body: {
          display_name: displayName || user.user_metadata?.name || user.email?.split('@')[0],
          usage_goals: selectedGoals,
          onboarding_completed: true,
        },
        headers: { Authorization: `Bearer ${token}` },
      })

      if (callError) {
        console.error('[Onboarding] Edge function error:', callError)
        setLoading(false)
        return
      }

      await refreshProfile()

      // Save first prompt for ChatPage to auto-send
      if (firstPrompt.trim()) {
        sessionStorage.setItem(ONBOARDING_PROMPT_KEY, firstPrompt.trim())
      }

      navigate('/chat', { replace: true })
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, 2))
  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="onboarding">
      <div className="onboarding-card animate-scale-in">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-logo">🧠</div>
          <h1 className="onboarding-title">
            {step === 0 && 'Chào mừng đến Brain2!'}
            {step === 1 && 'Mục tiêu của bạn là gì?'}
            {step === 2 && 'Bạn muốn hỏi gì đầu tiên?'}
          </h1>
          <p className="onboarding-subtitle">
            {step === 0 && 'Vài bước ngắn để setup Brain2 cho bạn'}
            {step === 1 && 'Chọn những gì bạn muốn đạt được (có thể chọn nhiều)'}
            {step === 2 && 'Không cần hoàn hảo — hỏi bất cứ điều gì bạn đang nghĩ'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="onboarding-step-indicator">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`onboarding-step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="onboarding-form">
            <div>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontWeight: 400 }}>
                Bạn muốn được gọi là gì?
              </h3>
              <Input
                placeholder="Tên hiển thị..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                defaultValue={user?.user_metadata?.name || ''}
                autoFocus
              />
            </div>
            <div className="onboarding-actions">
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                Bạn có thể đổi sau trong Cài đặt
              </div>
              <Button variant="primary" onClick={nextStep}>
                Tiếp tục →
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Goals */}
        {step === 1 && (
          <div className="onboarding-form">
            <div className="onboarding-goals-grid">
              {ONBOARDING_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  className={`onboarding-goal-btn ${selectedGoals.includes(goal.id) ? 'selected' : ''}`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <span className="onboarding-goal-icon">{goal.icon}</span>
                  <span>{goal.label}</span>
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              <Button variant="ghost" onClick={prevStep}>← Quay lại</Button>
              <Button variant="primary" onClick={nextStep}>
                Tiếp tục →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: First prompt */}
        {step === 2 && (
          <div className="onboarding-form">
            <div>
              <textarea
                className="input textarea"
                placeholder="VD: Mình mới bắt đầu học về tư duy hệ thống. Giải thích cho mình..."
                value={firstPrompt}
                onChange={(e) => setFirstPrompt(e.target.value)}
                rows={4}
                autoFocus
              />
              <p className="input-hint" style={{ marginTop: '8px' }}>
                Hoặc cứ để trống — bạn có thể hỏi sau trong Chat
              </p>
            </div>
            <div className="onboarding-actions">
              <Button variant="ghost" onClick={prevStep}>← Quay lại</Button>
              <Button variant="accent" onClick={handleComplete} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Bắt đầu Brain2 🚀'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
