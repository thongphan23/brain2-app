import type { NoteType, MaturityLevel } from '../../lib/types'
import { NOTE_TYPES, MATURITY_LEVELS } from '../../lib/constants'

interface VaultFilters {
  type?: NoteType
  maturity?: MaturityLevel
  domain?: string
}

interface FilterChipsProps {
  filters: VaultFilters
  onChange: (filters: VaultFilters) => void
}

export function FilterChips({ filters, onChange }: FilterChipsProps) {
  const toggleType = (type: NoteType) => {
    onChange({ ...filters, type: filters.type === type ? undefined : type })
  }

  const toggleMaturity = (maturity: MaturityLevel) => {
    onChange({ ...filters, maturity: filters.maturity === maturity ? undefined : maturity })
  }

  return (
    <div className="vault-filters">
      {/* Note Type */}
      <div className="filter-chip-group">
        <span className="filter-chip-label">Loại:</span>
        <div className="filter-chips">
          {NOTE_TYPES.map(t => (
            <button
              key={t.value}
              className={`filter-chip ${filters.type === t.value ? 'active' : ''}`}
              onClick={() => toggleType(t.value as NoteType)}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Maturity */}
      <div className="filter-chip-group">
        <span className="filter-chip-label">Maturity:</span>
        <div className="filter-chips">
          {MATURITY_LEVELS.map(m => (
            <button
              key={m.value}
              className={`filter-chip ${filters.maturity === m.value ? 'active' : ''}`}
              onClick={() => toggleMaturity(m.value as MaturityLevel)}
              title={m.desc}
            >
              {m.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
