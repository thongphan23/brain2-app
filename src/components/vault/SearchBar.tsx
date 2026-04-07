import { useState, useRef } from 'react'

interface SearchBarProps {
  onSearch: (query: string, mode?: 'keyword' | 'semantic' | 'hybrid') => void
  onClear: () => void
  loading?: boolean
}

export function SearchBar({ onSearch, onClear, loading = false }: SearchBarProps) {
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid')
  const [modeMenuOpen, setModeMenuOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (val: string) => {
    setValue(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!val.trim()) {
      onClear()
      return
    }

    debounceRef.current = setTimeout(() => {
      onSearch(val, mode)
    }, 300)
  }

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode)
    setModeMenuOpen(false)
    if (value.trim()) {
      onSearch(value, newMode)
    }
  }

  const handleClear = () => {
    setValue('')
    onClear()
  }

  const modeLabels: Record<typeof mode, string> = {
    hybrid: '🔀 Hybrid',
    semantic: '🧠 Ngữ nghĩa',
    keyword: '📝 Từ khóa',
  }

  return (
    <div className="vault-search">
      <div className="vault-search-bar">
        <span className="vault-search-icon">{loading ? '⏳' : '🔍'}</span>
        <input
          className="vault-search-input"
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder="Tìm kiếm notes..."
        />
        {value && (
          <button className="vault-search-clear" onClick={handleClear}>
            ✕
          </button>
        )}
        <div className="vault-search-mode-wrap">
          <button
            className="vault-search-mode-btn"
            onClick={() => setModeMenuOpen(!modeMenuOpen)}
            title="Chọn chế độ tìm kiếm"
          >
            {modeLabels[mode]}
          </button>
          {modeMenuOpen && (
            <div className="vault-search-mode-dropdown">
              {(['hybrid', 'semantic', 'keyword'] as const).map(m => (
                <button
                  key={m}
                  className={`vault-search-mode-option ${mode === m ? 'active' : ''}`}
                  onClick={() => handleModeChange(m)}
                >
                  {modeLabels[m]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
