import { AppLayout } from '../components/layout/AppLayout'
import { Header } from '../components/layout/Header'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/shared/Toast'
import { TIER_CONFIGS, TIER_ICONS } from '../lib/constants'
import { PaymentFlow } from '../components/payment/PaymentFlow'
import { PaymentStatus } from '../components/payment/PaymentStatus'
import { useTier } from '../hooks/useTier'

export function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { success, error: showError } = useToast()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const { usageToday, limits } = useTier(user?.id)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      success('Đã lưu!', 'Thông tin của bạn đã được cập nhật.')
    } catch {
      showError('Lỗi', 'Không thể lưu. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const tier = profile?.tier || 'free'
  const tierConfig = TIER_CONFIGS.find((t) => t.tier === tier)

  return (
    <AppLayout>
      <Header title="Cài đặt" />
      <div className="page-scroll-narrow">

        {/* Profile Section */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">👤 Hồ sơ</div>
              <div className="card-subtitle">Thông tin cá nhân của bạn</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              hint="Email không thể thay đổi"
            />
            <Input
              label="Tên hiển thị"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tên của bạn..."
            />
            <div>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tier Section */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">💎 Gói hiện tại</div>
              <div className="card-subtitle">Quản lý subscription của bạn</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '2rem' }}>{TIER_ICONS[tier]}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>
                {tierConfig?.label || tier}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {tierConfig?.messages_per_day === 9999
                  ? 'Không giới hạn tin nhắn/ngày'
                  : `${tierConfig?.messages_per_day || 20} tin nhắn/ngày`}
              </div>
            </div>
          </div>

          {/* Usage stats */}
          {tier !== 'free' && (
            <div className="settings-usage-stats">
              <div className="settings-usage-stat">
                <span>Tin nhắn hôm nay</span>
                <strong>{usageToday.messages_used}/{limits.messages_per_day}</strong>
              </div>
              <div className="settings-usage-stat">
                <span>Notes đã tạo</span>
                <strong>{usageToday.notes_created}/{limits.notes_limit}</strong>
              </div>
            </div>
          )}

          <PaymentStatus />

          {tier === 'free' && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Nâng cấp Pro để mở khóa thêm 200 tin nhắn/ngày, dashboard, import Notion & Files.
              </p>
              <Button variant="accent" onClick={() => setShowPayment(true)}>
                🚀 Nâng cấp Pro — 499,000đ/tháng
              </Button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--error)' }}>⚠️ Vùng nguy hiểm</div>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
          </p>
          <Button variant="danger" onClick={() => {}}>
            🗑️ Xóa tài khoản
          </Button>
        </div>
      </div>

      {/* Payment Flow Modal */}
      {showPayment && (
        <PaymentFlow onClose={() => setShowPayment(false)} />
      )}
    </AppLayout>
  )
}
