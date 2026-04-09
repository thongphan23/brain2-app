import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useVault } from '../../hooks/useVault'
import { useVaultSearch } from '../../hooks/useVaultSearch'
import { NoteList } from './NoteList'
import { NoteDetail } from './NoteDetail'
import { SearchBar } from './SearchBar'
import { FilterChips } from './FilterChips'
import { VaultTagFilter, type VaultViewFilter } from './VaultTagFilter'
import { EmptyState } from '../shared/EmptyState'
import { Skeleton } from '../shared/Skeleton'
import { useToast } from '../shared/Toast'
import { exportAllNotes } from '../../lib/exportUtils'
import type { Note } from '../../lib/types'

export function VaultBrowser() {
  const { user } = useAuth()
  const {
    notes, selectedNote, loading, filters,
    createNote, updateNote, deleteNote, selectNote,
    setFilters, totalCount,
  } = useVault(user?.id)
  const { results: searchResults, loading: searchLoading, search, clear: clearSearch } = useVaultSearch(user?.id)
  const { success, error: showError } = useToast()

  const [creatingNote, setCreatingNote] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [tagFilter, setTagFilter] = useState<VaultViewFilter>('all')

  const handleCreateNote = async () => {
    setCreatingNote(true)
    const note = await createNote({
      title: 'Untitled Note',
      content: '',
      note_type: 'concept',
      maturity: 'seed',
    })
    if (note) {
      selectNote(note)
    }
    setCreatingNote(false)
  }

  const handleExport = async () => {
    if (!user) return
    setExporting(true)
    try {
      await exportAllNotes(user.id)
      success('Đã xuất!', `${totalCount} notes đã được tải về.`)
    } catch (err) {
      showError('Lỗi xuất', String(err))
    } finally {
      setExporting(false)
    }
  }

  const applyTagFilter = (allNotes: Note[]): Note[] => {
    switch (tagFilter) {
      case 'recent': {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return allNotes.filter(n => new Date(n.updated_at) >= weekAgo)
      }
      case 'longform':
        return allNotes.filter(n => (n.content?.length || 0) > 800)
      case 'seed':
        return allNotes.filter(n => n.maturity === 'seed')
      case 'growing':
        return allNotes.filter(n => n.maturity === 'growing')
      case 'permanent':
        return allNotes.filter(n => n.maturity === 'permanent')
      default:
        return allNotes
    }
  }

  const displayNotes = searchResults.length > 0
    ? searchResults
    : applyTagFilter(notes)
  const isSearching = searchResults.length > 0 || searchLoading

  if (!user) return null

  return (
    <div className="vault-browser">
      {/* Left Panel */}
      <div className="vault-list-panel">
        {/* Header */}
        <div className="vault-list-header">
          <div className="vault-list-title">
            <span>📚</span>
            <span>Vault</span>
            <span className="vault-count">{totalCount}</span>
          </div>
          <button
            className="vault-export-btn"
            onClick={handleExport}
            disabled={exporting || totalCount === 0}
            title="Sao lưu toàn bộ Vault ra ZIP"
          >
            {exporting ? '⏳ Đang nén...' : '💾 Xuất ZIP'}
          </button>
          <button
            className="vault-new-note-btn"
            onClick={handleCreateNote}
            disabled={creatingNote}
            title="Tạo note mới"
          >
            +
          </button>
        </div>

        {/* Tag Filter Pills */}
        <VaultTagFilter active={tagFilter} onChange={setTagFilter} />

        {/* Search */}
        <SearchBar
          onSearch={search}
          onClear={clearSearch}
          loading={searchLoading}
        />

        {/* Filters */}
        <FilterChips
          filters={filters}
          onChange={setFilters}
        />

        {/* Note List */}
        <div className="vault-notes-scroll">
          {loading && !isSearching ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : displayNotes.length === 0 ? (
            <EmptyState
              icon="📝"
              title={isSearching ? 'Không tìm thấy' : 'Vault trống'}
              description={
                isSearching
                  ? 'Thử từ khóa khác hoặc bỏ bộ lọc'
                  : 'Bắt đầu bằng cách chat với AI — nó sẽ gợi ý lưu insight!'
              }
              action={
                !isSearching && (
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateNote}
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    ✨ Tạo Note Nhanh
                  </button>
                )
              }
            />
          ) : (
            <NoteList
              notes={displayNotes}
              selectedId={selectedNote?.id || null}
              onSelect={selectNote}
              searchQuery=""
            />
          )}
        </div>
      </div>

      {/* Right Panel — Detail */}
      <div className="vault-detail-panel">
        {selectedNote ? (
          <NoteDetail
            note={selectedNote}
            onSave={(data) => updateNote(selectedNote.id, data)}
            onDelete={async () => {
              await deleteNote(selectedNote.id)
              selectNote(null)
            }}
            onClose={() => selectNote(null)}
          />
        ) : (
          <EmptyState
            icon="🧠"
            title="Chọn một note để xem"
            description="Click vào note bên trái để xem chi tiết hoặc tạo note mới."
            action={
              <button className="btn btn-primary" onClick={handleCreateNote}>
                + Tạo note mới
              </button>
            }
          />
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton height="14px" width="80%" />
      <Skeleton height="12px" width="40%" />
    </div>
  )
}
