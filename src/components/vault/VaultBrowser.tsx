import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useVault } from '../../hooks/useVault'
import { useVaultSearch } from '../../hooks/useVaultSearch'
import { NoteList } from './NoteList'
import { NoteDetail } from './NoteDetail'
import { SearchBar } from './SearchBar'
import { FilterChips } from './FilterChips'
import { EmptyState } from '../shared/EmptyState'
import { Skeleton } from '../shared/Skeleton'

export function VaultBrowser() {
  const { user } = useAuth()
  const {
    notes, selectedNote, loading, filters,
    createNote, updateNote, deleteNote, selectNote,
    setFilters, totalCount,
  } = useVault(user?.id)
  const { results: searchResults, loading: searchLoading, search, clear: clearSearch } = useVaultSearch(user?.id)

  const [creatingNote, setCreatingNote] = useState(false)

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

  const displayNotes = searchResults.length > 0 ? searchResults : notes
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
            className="vault-new-note-btn"
            onClick={handleCreateNote}
            disabled={creatingNote}
            title="Tạo note mới"
          >
            +
          </button>
        </div>

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
