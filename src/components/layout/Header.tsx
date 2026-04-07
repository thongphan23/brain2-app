import { Button } from '../shared/Button'

interface HeaderProps {
  title: string
  subtitle?: string
  badge?: string
  actions?: React.ReactNode
  onMenuToggle?: () => void
}

export function Header({ title, subtitle, badge, actions, onMenuToggle }: HeaderProps) {
  return (
    <header className="app-header">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        icon
        onClick={onMenuToggle}
        className="sidebar-toggle-btn"
        style={{ display: 'none' }}
        aria-label="Toggle menu"
      >
        ☰
      </Button>

      {title && <span className="app-header-title">{title}</span>}
      {subtitle && <span className="app-header-subtitle">{subtitle}</span>}
      {badge && <span className="tool-badge">{badge}</span>}

      <div className="header-spacer" />

      {actions && <div className="header-actions">{actions}</div>}
    </header>
  )
}
