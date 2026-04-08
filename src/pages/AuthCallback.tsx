import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AUTH_CALLBACK_TIMEOUT = 15000 // 15s

export function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Đang xử lý đăng nhập...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let timeoutId: ReturnType<typeof setTimeout>

    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (!code) {
          navigate('/', { replace: true })
          return
        }

        // Exchange code for session
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError) {
          // PKCE or session error — clear stale storage and redirect
          console.error('[AuthCallback] Session error:', sessionError.message)

          if (
            sessionError.message?.includes('code verifier') ||
            sessionError.message?.includes('PKCE') ||
            sessionError.message?.includes('Invalid')
          ) {
            localStorage.removeItem('sb-brain2-auth-token')
            setError('Phiên đăng nhập hết hạn. Đang chuyển về trang chủ...')
          } else {
            setError('Đăng nhập thất bại. Vui lòng thử lại.')
          }

          if (mounted) {
            setTimeout(() => navigate('/', { replace: true }), 2500)
          }
          return
        }

        // Check onboarding status
        const userId = data.session?.user?.id
        if (userId) {
          // Clean URL immediately
          window.history.replaceState({}, '', window.location.pathname)

          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', userId)
            .single()

          if (profile?.onboarding_completed) {
            setStatus('✓ Đăng nhập thành công! Đang chuyển...')
            if (mounted) navigate('/chat', { replace: true })
          } else {
            setStatus('✓ Tạo tài khoản thành công! Đang chuyển...')
            if (mounted) navigate('/onboarding', { replace: true })
          }
        } else {
          throw new Error('No user ID in session')
        }
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err)
        if (mounted) {
          setError('Đăng nhập thất bại. Vui lòng thử lại.')
          setTimeout(() => navigate('/', { replace: true }), 3000)
        }
      }
    }

    // Set timeout — if callback takes > 15s, force redirect
    timeoutId = setTimeout(() => {
      if (mounted) {
        setError('Đăng nhập quá chậm. Đang chuyển về trang chủ...')
        setTimeout(() => navigate('/', { replace: true }), 2000)
      }
    }, AUTH_CALLBACK_TIMEOUT)

    handleCallback()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
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
