import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Đang xử lý đăng nhập...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for Supabase auth code in URL
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (code) {
          // Exchange code for session
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
          if (sessionError) throw sessionError

          // Check if user needs onboarding
          const userId = data.session?.user?.id
          if (userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', userId)
              .single()

            // Clean URL
            window.history.replaceState({}, '', window.location.pathname)

            if (profile?.onboarding_completed) {
              setStatus('✓ Đăng nhập thành công! Đang chuyển...')
              navigate('/chat', { replace: true })
            } else {
              setStatus('✓ Tạo tài khoản thành công! Đang chuyển...')
              navigate('/onboarding', { replace: true })
            }
          } else {
            throw new Error('No user ID in session')
          }
        } else {
          // No code — redirect to landing
          navigate('/', { replace: true })
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Đăng nhập thất bại. Vui lòng thử lại.')
        setTimeout(() => navigate('/', { replace: true }), 3000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="auth-callback">
      <div className="auth-callback-card animate-scale-in">
        <div className="auth-callback-spinner">⏳</div>
        <div className="auth-callback-title">
          {error ? '❌' : '🧠'} Brain2
        </div>
        <div className="auth-callback-subtitle">
          {error || status}
        </div>
      </div>
    </div>
  )
}
