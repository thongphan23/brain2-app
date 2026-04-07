import { Button } from '../components/shared/Button'
import { TIER_CONFIGS, APP_NAME, APP_TAGLINE } from '../lib/constants'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <span className="landing-nav-logo-icon">🧠</span>
          <span>{APP_NAME}</span>
        </div>
        <div className="landing-nav-spacer" />
        <a href="#features" className="landing-nav-link">Tính năng</a>
        <a href="#pricing" className="landing-nav-link">Bảng giá</a>
        <Button variant="primary" size="sm" onClick={onGetStarted}>
          Bắt đầu ngay
        </Button>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          ⚡ AI Hiểu Bạn — Không Chỉ Biết Mọi Thứ
        </div>

        <h1 className="landing-hero-title">
          <span className="landing-hero-title-accent">{APP_TAGLINE}</span>
        </h1>

        <p className="landing-hero-subtitle">
          Chat với AI luôn nhớ bạn là ai, mục tiêu gì, và tri thức bạn đã tích lũy.
          Mỗi câu trả lời cá nhân hóa — không generic.
        </p>

        <div className="landing-hero-cta">
          <Button variant="accent" size="lg" onClick={onGetStarted}>
            🚀 Bắt đầu miễn phí
          </Button>
          <Button variant="secondary" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Xem tính năng
          </Button>
        </div>

        <p className="landing-hero-note">
          Không cần thẻ. Bắt đầu với 20 tin nhắn/ngày — miễn phí mãi mãi.
        </p>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="landing-section-label">Tính năng</div>
        <h2 className="landing-section-title">Bộ não số — thông minh hơn mỗi ngày</h2>

        <div className="landing-features-grid">
          {[
            {
              icon: '🧠',
              title: 'AI Hiểu Bạn',
              desc: 'Chat AI luôn nhớ context cá nhân — mục tiêu, tri thức, trải nghiệm. Không cần paste context mỗi lần.',
            },
            {
              icon: '💬',
              title: '4 Chế Độ Trò Chuyện',
              desc: 'Tự do, Chiêm nghiệm, Nghiên cứu sâu, Mentoring. Mỗi chế độ có AI riêng phù hợp mục đích.',
            },
            {
              icon: '📚',
              title: 'Vault Thông Minh',
              desc: 'Lưu insight từ chat tự động. Semantic search tìm kiếm tri thức như Google — hiểu ý, không chỉ từ.',
            },
            {
              icon: '📊',
              title: 'Radar Năng Lực',
              desc: 'Biểu đồ radar cho thấy năng lực tri thức của bạn. Biết điểm mạnh, học đúng thứ tiếp theo.',
            },
            {
              icon: '📥',
              title: 'Import Từ Mọi Nơi',
              desc: 'Kết nối Obsidian, Notion, hoặc upload files. Tri thức cũ chuyển vào Brain2 trong vài phút.',
            },
            {
              icon: '🔒',
              title: 'Riêng Tư & Bảo Mật',
              desc: 'Dữ liệu của bạn là của bạn. RLS enforced — không ai khác nhìn thấy vault của bạn.',
            },
          ].map((feature) => (
            <div key={feature.title} className="landing-feature-card">
              <div className="landing-feature-icon">{feature.icon}</div>
              <div className="landing-feature-title">{feature.title}</div>
              <div className="landing-feature-desc">{feature.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="landing-pricing" id="pricing">
        <div className="landing-pricing-inner">
          <div className="landing-section-label">Bảng giá</div>
          <h2 className="landing-section-title">Chọn gói phù hợp với bạn</h2>

          <div className="landing-pricing-grid">
            {TIER_CONFIGS.map((tier) => (
              <div
                key={tier.tier}
                className={`pricing-card ${tier.tier === 'pro' ? 'featured' : ''}`}
              >
                {tier.tier === 'pro' && (
                  <div className="pricing-card-badge">Phổ biến nhất</div>
                )}

                <div className="pricing-tier-name">{tier.label}</div>

                <div className="pricing-price">
                  <span className="pricing-price-value">
                    {tier.monthly_price_vnd === 0
                      ? 'Miễn phí'
                      : tier.monthly_price_vnd.toLocaleString('vi-VN')}
                  </span>
                  {tier.monthly_price_vnd > 0 && (
                    <span className="pricing-price-period">/tháng</span>
                  )}
                </div>

                <ul className="pricing-features">
                  {tier.features.map((f) => (
                    <li key={f} className="pricing-feature">
                      <span className="pricing-feature-icon">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.tier === 'pro' ? 'accent' : 'secondary'}
                  className="w-full"
                  onClick={onGetStarted}
                >
                  {tier.tier === 'free' ? 'Bắt đầu miễn phí' : 'Nâng cấp ngay'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2 className="landing-cta-title">Sẵn sàng xây dựng Brain2 của bạn?</h2>
        <p className="landing-cta-subtitle">
          Bắt đầu miễn phí. Không cần thẻ tín dụng.
        </p>
        <Button variant="accent" size="lg" onClick={onGetStarted}>
          🚀 Đăng nhập với Google ngay
        </Button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>🧠 {APP_NAME} — Bộ Não Thứ 2</div>
        <div>© {new Date().getFullYear()} Brain2 Platform</div>
      </footer>
    </div>
  )
}
