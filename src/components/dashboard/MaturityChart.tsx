import type { MaturityLevel } from '../../lib/types'

interface MaturityData {
  seed: number
  growing: number
  permanent: number
}

interface MaturityChartProps {
  data: MaturityData
}

const MATURITY_CONFIG = [
  { key: 'seed' as MaturityLevel, icon: '🌱', label: 'Seed', color: 'var(--warning)' },
  { key: 'growing' as MaturityLevel, icon: '🌿', label: 'Growing', color: 'var(--info)' },
  { key: 'permanent' as MaturityLevel, icon: '🌳', label: 'Permanent', color: 'var(--success)' },
]

export function MaturityChart({ data }: MaturityChartProps) {
  const total = data.seed + data.growing + data.permanent

  return (
    <div className="maturity-chart">
      <div className="maturity-chart-title">📊 Phân bổ Maturity</div>
      {MATURITY_CONFIG.map(({ key, icon, label, color }) => {
        const count = data[key]
        const pct = total > 0 ? (count / total) * 100 : 0
        return (
          <div key={key} className="maturity-bar-row">
            <div className="maturity-bar-label">
              <span>{icon}</span>
              <span>{label}</span>
              <span className="maturity-bar-count">{count}</span>
            </div>
            <div className="maturity-bar-track">
              <div
                className="maturity-bar-fill"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <span className="maturity-bar-pct">{Math.round(pct)}%</span>
          </div>
        )
      })}
    </div>
  )
}
