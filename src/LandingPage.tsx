import { useState } from 'react'
import './LandingPage.css'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <span className="landing-brand-icon">🧠</span>
            <span className="landing-brand-text">Brain2</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Tính năng</a>
            <a href="#how-it-works">Cách hoạt động</a>
            <a href="#pricing">Bảng giá</a>
          </div>
          <button className="landing-cta-nav" onClick={onGetStarted}>
            Bắt đầu miễn phí
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">✨ AI-Powered Second Brain</div>
          <h1 className="hero-title">
            <span className="hero-title-line">Bộ não thứ 2</span>
            <span className="hero-title-accent">hiểu bạn hơn mỗi ngày</span>
          </h1>
          <p className="hero-subtitle">
            ChatGPT biết mọi thứ nhưng không biết gì về <strong>bạn</strong>.
            <br />
            Brain2 chỉ biết đúng thứ bạn cần — và càng dùng càng hiểu bạn.
          </p>
          <div className="hero-actions">
            <button className="hero-btn primary" onClick={onGetStarted}>
              <span>🚀</span> Trải nghiệm miễn phí
            </button>
            <a href="#how-it-works" className="hero-btn secondary">
              Tìm hiểu thêm →
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">50</span>
              <span className="hero-stat-label">notes miễn phí</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">3</span>
              <span className="hero-stat-label">AI modes chuyên sâu</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">10+</span>
              <span className="hero-stat-label">AI models</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="landing-section" id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-badge">Vấn đề</span>
            <h2 className="section-title">Bạn đang mất tri thức mỗi ngày</h2>
            <p className="section-subtitle">
              Đọc sách xong quên. Chat AI xong mất. Insight đến rồi đi. Không có hệ thống nào giữ lại cho bạn.
            </p>
          </div>

          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">💨</div>
              <h3>Chat AI = Mất ngay</h3>
              <p>Bạn hỏi ChatGPT hàng ngày, nhưng insight sáng nay chiều đã quên. Không gì được giữ lại.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🗂️</div>
              <h3>Ghi chú = Nghĩa trang</h3>
              <p>Notes trong Notion, Google Docs, sổ tay... rải rác khắp nơi. Không bao giờ mở lại.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🤖</div>
              <h3>AI = Không biết bạn</h3>
              <p>ChatGPT trả lời generic cho 2 tỷ người. Không nhớ bạn đã học gì, đang làm gì.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution: 3 Modes */}
      <section className="landing-section modes-section" id="how-it-works">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-badge">Giải pháp</span>
            <h2 className="section-title">3 Modes — cover mọi nhu cầu</h2>
            <p className="section-subtitle">
              Không cần 20 tools phức tạp. Chỉ 3 modes đơn giản, mỗi cái đi SÂU.
            </p>
          </div>

          <div className="modes-grid">
            <div className="mode-card mode-mentoring">
              <div className="mode-icon">🧠</div>
              <h3 className="mode-name">Mentoring</h3>
              <p className="mode-desc">
                AI mentor cá nhân — hỏi bất kỳ điều gì. Nhớ context của bạn, kết nối kiến thức cũ, gợi ý insight mới.
              </p>
              <ul className="mode-features">
                <li>Socratic questioning — giúp bạn tự tìm đáp án</li>
                <li>Vault-aware — kết nối với kiến thức có sẵn</li>
                <li>Anti-generic — không giống ChatGPT vanilla</li>
              </ul>
              <div className="mode-tag">Mode mặc định</div>
            </div>

            <div className="mode-card mode-reflect">
              <div className="mode-icon">🪞</div>
              <h3 className="mode-name">Reflect</h3>
              <p className="mode-desc">
                Biến trải nghiệm thành tri thức. Chia sẻ câu chuyện → AI đào sâu → rút insight → lưu vault.
              </p>
              <ul className="mode-features">
                <li>Kolb learning cycle — chiêm nghiệm có cấu trúc</li>
                <li>Không phán xét — chỉ hỏi và đào sâu</li>
                <li>Auto-crystallize — đúc kết thành atomic notes</li>
              </ul>
              <div className="mode-tag">Cho chiêm nghiệm</div>
            </div>

            <div className="mode-card mode-research">
              <div className="mode-icon">🔬</div>
              <h3 className="mode-name">Deep Research</h3>
              <p className="mode-desc">
                Nghiên cứu sâu bất cứ concept nào. Phân tích 5 tầng: bản chất → lịch sử → cấu trúc → ứng dụng → kết nối.
              </p>
              <ul className="mode-features">
                <li>5-layer analysis — sâu hơn Wikipedia</li>
                <li>Cross-reference vault — liên kết tự động</li>
                <li>Atomic notes — kiến thức có cấu trúc</li>
              </ul>
              <div className="mode-tag">Cho nghiên cứu</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section how-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-badge">Đơn giản</span>
            <h2 className="section-title">Bắt đầu trong 30 giây</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Đăng nhập Google</h3>
              <p>Một click duy nhất. Không cần tạo account phức tạp.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Chọn mode & chat</h3>
              <p>Mentoring, Reflect, hay Deep Research — tuỳ nhu cầu.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Vault tự xây</h3>
              <p>AI tạo notes từ conversations. Càng dùng, Brain2 càng hiểu bạn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Import */}
      <section className="landing-section import-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-badge">Chuyển đổi dễ dàng</span>
            <h2 className="section-title">Mang tri thức cũ theo bạn</h2>
            <p className="section-subtitle">
              Đừng bắt đầu từ số 0. Import từ nền tảng bạn đang dùng.
            </p>
          </div>

          <div className="import-grid">
            <div className="import-card">
              <div className="import-icon">📓</div>
              <h3>Notion</h3>
              <p>Export markdown → import 1 click</p>
              <span className="import-status coming">Sắp ra mắt</span>
            </div>
            <div className="import-card">
              <div className="import-icon">💎</div>
              <h3>Obsidian</h3>
              <p>Drag & drop vault folder</p>
              <span className="import-status coming">Sắp ra mắt</span>
            </div>
            <div className="import-card">
              <div className="import-icon">📄</div>
              <h3>Markdown files</h3>
              <p>Upload .md files trực tiếp</p>
              <span className="import-status coming">Sắp ra mắt</span>
            </div>
            <div className="import-card">
              <div className="import-icon">📋</div>
              <h3>Copy & Paste</h3>
              <p>Paste text → AI tạo notes</p>
              <span className="import-status available">Đã sẵn sàng</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="landing-section pricing-section" id="pricing">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-badge">Bảng giá</span>
            <h2 className="section-title">Bắt đầu miễn phí, nâng cấp khi cần</h2>
          </div>

          <div className="billing-toggle">
            <button
              className={billingCycle === 'monthly' ? 'active' : ''}
              onClick={() => setBillingCycle('monthly')}
            >Hàng tháng</button>
            <button
              className={billingCycle === 'yearly' ? 'active' : ''}
              onClick={() => setBillingCycle('yearly')}
            >Hàng năm <span className="save-badge">-20%</span></button>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-tier">Free</div>
              <div className="pricing-price">
                <span className="price-amount">0đ</span>
                <span className="price-period">mãi mãi</span>
              </div>
              <p className="pricing-desc">Hoàn hảo để khám phá Brain2</p>
              <ul className="pricing-features">
                <li><span className="check">✓</span> 50 notes trong vault</li>
                <li><span className="check">✓</span> 20 messages/ngày</li>
                <li><span className="check">✓</span> 30 messages bonus đăng ký</li>
                <li><span className="check">✓</span> 3 AI modes đầy đủ</li>
                <li><span className="check">✓</span> Gemini 2.5 Flash & Pro</li>
                <li><span className="check">✓</span> Claude Haiku 4.5</li>
              </ul>
              <button className="pricing-btn free" onClick={onGetStarted}>
                Bắt đầu miễn phí
              </button>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-popular">Phổ biến nhất</div>
              <div className="pricing-tier">Pro</div>
              <div className="pricing-price">
                <span className="price-amount">
                  {billingCycle === 'monthly' ? '149.000đ' : '119.000đ'}
                </span>
                <span className="price-period">/tháng</span>
              </div>
              <p className="pricing-desc">Cho người dùng nghiêm túc</p>
              <ul className="pricing-features">
                <li><span className="check">✓</span> Unlimited notes</li>
                <li><span className="check">✓</span> 200 messages/ngày</li>
                <li><span className="check">✓</span> Tất cả Pro models</li>
                <li><span className="check">✓</span> Claude Sonnet 4.6</li>
                <li><span className="check">✓</span> GPT-4o & GPT-5.2</li>
                <li><span className="check">✓</span> Grok 4</li>
                <li><span className="check">✓</span> Advanced analytics</li>
              </ul>
              <button className="pricing-btn pro" onClick={onGetStarted}>
                Nâng cấp Pro
              </button>
            </div>

            <div className="pricing-card">
              <div className="pricing-tier">VIP</div>
              <div className="pricing-price">
                <span className="price-amount">
                  {billingCycle === 'monthly' ? '399.000đ' : '319.000đ'}
                </span>
                <span className="price-period">/tháng</span>
              </div>
              <p className="pricing-desc">Cho power users & creators</p>
              <ul className="pricing-features">
                <li><span className="check">✓</span> Tất cả tính năng Pro</li>
                <li><span className="check">✓</span> Unlimited messages</li>
                <li><span className="check">✓</span> Claude Opus 4.6</li>
                <li><span className="check">✓</span> Priority response</li>
                <li><span className="check">✓</span> API access (sắp tới)</li>
                <li><span className="check">✓</span> Custom tools (sắp tới)</li>
              </ul>
              <button className="pricing-btn vip" onClick={onGetStarted}>
                Nâng cấp VIP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-section cta-section">
        <div className="section-inner">
          <div className="cta-content">
            <h2 className="cta-title">Bắt đầu xây bộ não thứ 2 ngay hôm nay</h2>
            <p className="cta-subtitle">
              Miễn phí. Không thẻ tín dụng. 30 giây để bắt đầu.
            </p>
            <button className="hero-btn primary cta-btn" onClick={onGetStarted}>
              <span>🧠</span> Đăng nhập & trải nghiệm
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span>🧠 Brain2</span>
            <p>AI-Augmented Knowledge Platform</p>
          </div>
          <div className="footer-links">
            <a href="https://thongphan.com" target="_blank" rel="noopener noreferrer">Thông Phan</a>
            <span className="footer-dot">·</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
