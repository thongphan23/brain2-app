export type VaultViewFilter = 'all' | 'recent' | 'longform' | 'seed' | 'growing' | 'permanent'

interface VaultTagFilterProps {
  active: VaultViewFilter
  onChange: (f: VaultViewFilter) => void
}

const PILLS: { id: VaultViewFilter; label: string }[] = [
  { id: 'all',      label: 'Tất cả' },
  { id: 'recent',   label: '📅 Gần đây' },
  { id: 'longform', label: '📄 Dài' },
  { id: 'seed',     label: '🌱 Seed' },
  { id: 'growing',  label: '🌿 Growing' },
  { id: 'permanent', label: '💎 Permanent' },
]

export function VaultTagFilter({ active, onChange }: VaultTagFilterProps) {
  return (
    <div className="vault-tag-filter-bar">
      {PILLS.map(pill => (
        <button
          key={pill.id}
          className={`vault-tag-pill ${active === pill.id ? 'active' : ''}`}
          onClick={() => onChange(pill.id)}
        >
          {pill.label}
        </button>
      ))}
    </div>
  )
}
