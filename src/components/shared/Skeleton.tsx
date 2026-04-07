interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
}

export function Skeleton({ width = '100%', height = '14px', borderRadius, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: borderRadius || undefined }}
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{
            width: i === lines - 1 ? '70%' : '100%',
            marginBottom: '8px',
          }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="flex items-center gap-md" style={{ marginBottom: '16px' }}>
        <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
        <div style={{ flex: 1 }}>
          <Skeleton height="14px" width="60%" />
          <div style={{ height: 4 }} />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}
