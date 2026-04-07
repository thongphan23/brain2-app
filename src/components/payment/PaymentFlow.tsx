import { useState } from 'react'
import { Button } from '../shared/Button'
import { useTier } from '../../hooks/useTier'
import { TIER_CONFIGS } from '../../lib/constants'
import type { TierType } from '../../lib/types'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../shared/Toast'
import { supabase } from '../../lib/supabase'

interface PaymentFlowProps {
  onClose: () => void
}

export function PaymentFlow({ onClose }: PaymentFlowProps) {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null)
  const [loading, setLoading] = useState(false)

  const { getTransactionCode } = useTier(user?.id)
  const transactionCode = user ? getTransactionCode(user.id) : ''

  const config = (tier: TierType) => TIER_CONFIGS.find(c => c.tier === tier)!

  const handleSelectTier = async (tier: TierType) => {
    setSelectedTier(tier)
    setLoading(true)
    try {
      // Create pending payment record
      const tierConfig = config(tier)
      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: user!.id,
          tier_target: tier,
          amount: tierConfig.monthly_price_vnd,
          transaction_code: transactionCode,
          payment_method: 'bank_transfer',
          status: 'pending',
        })

      if (error) throw error
      setStep(2)
    } catch {
      showError('Lỗi', 'Không thể tạo yêu cầu thanh toán. Thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmed = () => {
    setStep(3)
  }

  const copy = (text: string, label = 'Đã copy!') => {
    navigator.clipboard.writeText(text).then(() => success(label, text))
  }

  const tierConfig = selectedTier ? config(selectedTier) : null

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-panel payment-flow">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Step indicator */}
        <div className="payment-steps">
          {[1, 2, 3].map(s => (
            <div key={s} className={`payment-step-dot ${s === step ? 'active' : ''} ${s < step ? 'done' : ''}`}>
              {s === 1 ? '1. Chọn gói' : s === 2 ? '2. Chuyển khoản' : '3. Xác nhận'}
            </div>
          ))}
        </div>

        {/* Step 1: Choose tier */}
        {step === 1 && (
          <div className="payment-step-content">
            <h2 className="payment-title">Chọn gói Brain2</h2>
            <div className="payment-tier-cards">
              {(['pro', 'vip'] as TierType[]).map(tier => {
                const cfg = config(tier)
                return (
                  <div key={tier} className="payment-tier-card">
                    <div className="payment-tier-icon">{tier === 'pro' ? '💫' : '👑'}</div>
                    <div className="payment-tier-name">{cfg.label}</div>
                    <div className="payment-tier-price">
                      {cfg.monthly_price_vnd.toLocaleString('vi-VN')}đ<span>/tháng</span>
                    </div>
                    <ul className="payment-tier-features">
                      {cfg.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                    <Button variant={tier === 'pro' ? 'primary' : 'accent'} onClick={() => handleSelectTier(tier)} disabled={loading}>
                      Chọn gói {cfg.label}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Bank transfer info */}
        {step === 2 && tierConfig && (
          <div className="payment-step-content">
            <h2 className="payment-title">Thông tin chuyển khoản</h2>

            <div className="payment-info-box">
              <div className="payment-info-row">
                <span className="payment-info-label">🏦 Ngân hàng</span>
                <span className="payment-info-value">VIB (Vietnam International Bank)</span>
              </div>
              <div className="payment-info-row">
                <span className="payment-info-label">👤 Tên tài khoản</span>
                <span className="payment-info-value">PHAN MINH THÔNG</span>
              </div>
              <div className="payment-info-row">
                <span className="payment-info-label">📋 Số tài khoản</span>
                <span className="payment-info-value">002031988</span>
              </div>
              <div className="payment-info-row">
                <span className="payment-info-label">💰 Số tiền</span>
                <span className="payment-info-value payment-amount">
                  {tierConfig.monthly_price_vnd.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="payment-info-row payment-code-row">
                <span className="payment-info-label">📝 Nội dung CK</span>
                <span className="payment-info-value payment-code">{transactionCode}</span>
                <button
                  className="copy-btn"
                  onClick={() => copy(transactionCode)}
                  title="Copy mã giao dịch"
                >📋</button>
              </div>
            </div>

            <div className="payment-warning">
              ⚠️ QUAN TRỌNG: Nhập ĐÚNG nội dung "{transactionCode}" để hệ thống tự xác nhận thanh toán!
            </div>

            <button
              className="btn btn-primary btn-full copy-all-btn"
              onClick={() => copy(
                `VIB\n002031988\nPHAN MINH THÔNG\n${tierConfig.monthly_price_vnd.toLocaleString('vi-VN')}đ\n${transactionCode}`,
                'Đã copy toàn bộ!'
              )}
            >
              📋 Copy toàn bộ thông tin
            </button>

            <div className="payment-confirm-row">
              <Button variant="ghost" onClick={() => setStep(1)}>← Quay lại</Button>
              <Button variant="accent" onClick={handleConfirmed}>Tôi đã chuyển khoản</Button>
            </div>
          </div>
        )}

        {/* Step 3: Waiting for confirmation */}
        {step === 3 && (
          <div className="payment-step-content payment-waiting">
            <div className="payment-waiting-icon">⏳</div>
            <h2 className="payment-title">Đang chờ xác nhận</h2>
            <p className="payment-waiting-desc">
              Chúng tôi sẽ xác nhận trong vài phút sau khi nhận được chuyển khoản.
              Thường mất 5-15 phút vào giờ hành chính.
            </p>
            <div className="payment-waiting-code">
              Mã giao dịch: <strong>{transactionCode}</strong>
            </div>
            <p className="payment-waiting-note">
              Nếu sau 24h chưa được xác nhận, liên hệ admin: <strong>admin@brain2.thongphan.com</strong>
            </p>
            <Button variant="primary" onClick={onClose}>Đóng</Button>
          </div>
        )}
      </div>
    </div>
  )
}
