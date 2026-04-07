import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export function PaymentStatus() {
  const { user } = useAuth()
  const [status, setStatus] = useState<'none' | 'pending' | 'verified' | 'expired'>('none')
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('payments')
      .select('status, expires_at, tier_target')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) { setStatus('none'); return }
        setStatus(data.status as 'pending' | 'verified' | 'expired')
        setExpiresAt(data.expires_at)
      })
  }, [user])

  if (status === 'none') return null

  return (
    <div className="payment-status">
      {status === 'pending' && (
        <div className="payment-status-pending">
          ⏳ Đang chờ xác nhận thanh toán...
        </div>
      )}
      {status === 'verified' && expiresAt && (
        <div className="payment-status-verified">
          ✅ Thanh toán đã xác nhận
          <span className="payment-status-expiry">
            Hết hạn: {new Date(expiresAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      )}
      {status === 'expired' && (
        <div className="payment-status-expired">
          ⏰ Gói đã hết hạn
          <span className="payment-status-cta"> — Nâng cấp lại để tiếp tục</span>
        </div>
      )}
    </div>
  )
}