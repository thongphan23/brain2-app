interface RadarChartProps {
  labels: string[]
  values: number[]
  size?: number
}

export function RadarChart({ labels, values, size = 400 }: RadarChartProps) {
  const count = Math.min(labels.length, values.length)
  if (count === 0) return null

  const cx = size / 2
  const cy = size / 2
  const maxRadius = (size / 2) * 0.75

  // Pentagon if count=5, hexagon if 6, etc.
  const getPoint = (i: number, radius: number) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  const labelRadius = maxRadius + 28

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
  const gridPolygons = gridLevels.map(level => {
    const points = Array.from({ length: count }, (_, i) => {
      const p = getPoint(i, maxRadius * level)
      return `${p.x},${p.y}`
    })
    return points.join(' ')
  })

  // Data polygon
  const dataPoints = Array.from({ length: count }, (_, i) => {
    const val = Math.max(0, Math.min(1, values[i] || 0))
    return getPoint(i, maxRadius * val)
  })
  const dataPointsStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="radar-chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid polygons */}
        {gridPolygons.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="var(--border)"
            strokeWidth="0.5"
            opacity={0.4}
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: count }, (_, i) => {
          const p = getPoint(i, maxRadius)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth="0.5" opacity={0.3} />
        })}

        {/* Data fill */}
        <polygon
          points={dataPointsStr}
          fill="var(--primary)"
          fillOpacity={0.15}
          stroke="var(--primary)"
          strokeWidth="2"
          style={{
            animation: 'radarFill 1s ease-out',
          }}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill="var(--primary)" stroke="var(--bg-primary)" strokeWidth={2} />
        ))}

        {/* Labels */}
        {labels.slice(0, count).map((label, i) => {
          const p = getPoint(i, labelRadius)
          const angle = (Math.PI * 2 * i) / count - Math.PI / 2
          const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
          let textAnchor: 'start' | 'middle' | 'end' = 'middle'
          let dx = 0
          let dy = 0
          if (normalizedAngle < Math.PI / 4 || normalizedAngle > Math.PI * 7 / 4) {
            textAnchor = 'start'; dx = 4
          } else if (normalizedAngle > Math.PI / 4 && normalizedAngle < Math.PI * 3 / 4) {
            textAnchor = 'start'; dx = 4; dy = 4
          } else if (normalizedAngle > Math.PI * 3 / 4 && normalizedAngle < Math.PI * 5 / 4) {
            textAnchor = 'middle'; dy = 14
          } else if (normalizedAngle > Math.PI * 5 / 4 && normalizedAngle < Math.PI * 7 / 4) {
            textAnchor = 'end'; dx = -4; dy = 4
          }

          return (
            <text
              key={i}
              x={p.x + dx}
              y={p.y + dy}
              textAnchor={textAnchor}
              fontSize={11}
              fill="var(--text-secondary)"
              fontFamily="var(--font-sans)"
            >
              {label.length > 12 ? label.substring(0, 11) + '…' : label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}