import { useState, useRef } from 'react'
import { supabase, EDGE_FUNCTION_URL } from '../../lib/supabase'
import { useToast } from '../shared/Toast'
import { useAuth } from '../../hooks/useAuth'

interface FileItem {
  file: File
  status: 'pending' | 'importing' | 'done' | 'error'
  error?: string
}

const ALLOWED_EXTENSIONS = ['md', 'txt', 'doc', 'docx']
const MAX_SIZE = 50 * 1024 * 1024 // 50MB total
const MAX_SINGLE = 5 * 1024 * 1024 // 5MB single file
const MAX_FILES = 200

export function FileImport() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [files, setFiles] = useState<FileItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0)
  const validFiles = files.filter(f => f.status === 'pending')

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    if (files.length + arr.length > MAX_FILES) {
      showError('Quá nhiều files', `Tối đa ${MAX_FILES} files.`)
      return
    }
    if (totalSize + arr.reduce((s, f) => s + f.size, 0) > MAX_SIZE) {
      showError('Quá lớn', 'Tổng kích thước vượt quá 50MB.')
      return
    }
    const added: FileItem[] = arr.map(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!ALLOWED_EXTENSIONS.includes(ext || '')) {
        return { file, status: 'error', error: `Định dạng .${ext} không hỗ trợ` }
      }
      if (file.size > MAX_SINGLE) {
        return { file, status: 'error', error: 'File quá lớn (>5MB)' }
      }
      if (file.size === 0) {
        return { file, status: 'error', error: 'File trống' }
      }
      return { file, status: 'pending' }
    })
    setFiles(prev => [...prev, ...added])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleImport = async () => {
    if (!user || validFiles.length === 0) return
    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    validFiles.forEach(item => formData.append('files', item.file))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('No auth')

      const res = await fetch(`${EDGE_FUNCTION_URL}/import-files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      // Mark all as done
      setFiles(prev => prev.map(item => {
        if (validFiles.some(v => v.file === item.file)) {
          const noteId = data.notes_created?.shift()
          return { ...item, status: noteId ? 'done' : 'error', error: noteId ? undefined : 'Import failed' }
        }
        return item
      }))

      setProgress(100)
      const imported = data.imported || 0
      const skipped = data.skipped || 0
      success(
        'Import hoàn tất',
        `Đã import ${imported}/${validFiles.length} files thành công.${skipped > 0 ? ` ${skipped} files bị bỏ qua.` : ''}`
      )
    } catch (err) {
      showError('Lỗi', 'Không thể import. Thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const clearAll = () => setFiles([])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="file-import">
      {/* Drop zone */}
      <div
        className={`file-import-dropzone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".md,.txt,.doc,.docx"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files) addFiles(e.target.files) }}
        />
        <div className="file-import-dropzone-icon">📂</div>
        <div className="file-import-dropzone-text">Kéo thả file vào đây</div>
        <div className="file-import-dropzone-sub">Hỗ trợ .md, .txt, .doc, .docx — Tối đa 200 files, 50MB</div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="file-import-list">
          <div className="file-import-list-header">
            <span>{files.length} files · {formatSize(totalSize)}</span>
            <button className="btn-ghost-sm" onClick={clearAll}>Xóa tất cả</button>
          </div>
          {files.map((item, idx) => (
            <div key={idx} className={`file-import-item file-import-item--${item.status}`}>
              <span className="file-import-item-icon">📄</span>
              <div className="file-import-item-info">
                <div className="file-import-item-name">{item.file.name}</div>
                {item.error && <div className="file-import-item-error">{item.error}</div>}
              </div>
              <div className="file-import-item-size">{formatSize(item.file.size)}</div>
              <div className="file-import-item-status">
                {item.status === 'pending' && <button className="file-import-remove" onClick={() => removeFile(idx)}>✕</button>}
                {item.status === 'importing' && <span className="file-import-spinner">⟳</span>}
                {item.status === 'done' && <span className="file-import-done">✅</span>}
                {item.status === 'error' && <span className="file-import-err">❌</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import button */}
      {validFiles.length > 0 && (
        <div className="file-import-footer">
          {uploading ? (
            <div className="file-import-progress">
              <div className="file-import-progress-bar">
                <div className="file-import-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span>Đang import...</span>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleImport}>
              Import {validFiles.length} file{validFiles.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
