import { useState, useEffect, useCallback } from 'react'
import { supabase, EDGE_FUNCTION_URL } from './lib/supabase'
import './NotionImport.css'

interface NotionPage {
  id: string
  title: string
  icon: string | null
  last_edited: string
  url: string
  already_imported: boolean
}

interface WorkspaceInfo {
  name: string
  icon: string
  synced_count?: number
  last_synced?: string
}

interface NotionImportProps {
  onClose: () => void
  onImportComplete: () => void
}

export default function NotionImport({ onClose, onImportComplete }: NotionImportProps) {
  const [status, setStatus] = useState<'loading' | 'disconnected' | 'connected' | 'listing' | 'importing' | 'done'>('loading')
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null)
  const [pages, setPages] = useState<NotionPage[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get auth token for Edge Function calls
  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }, [])

  // Call Edge Function
  const callNotion = useCallback(async (action: string, body?: any) => {
    const token = await getToken()
    const res = await fetch(`${EDGE_FUNCTION_URL}/notion-connect?action=${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data
  }, [getToken])

  // Check connection status on mount + handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    // FIX BUG-C3/M1: Detect Notion OAuth code (SPA — path is always '/')
    if (code && state) {
      handleOAuthCallback(code)
      // Clean URL after consuming code
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      checkStatus()
    }
  }, [])

  const checkStatus = async () => {
    try {
      const data = await callNotion('status')
      if (data.connected) {
        setWorkspace({ name: data.workspace_name, icon: data.workspace_icon })
        setStatus('connected')
      } else {
        setStatus('disconnected')
      }
    } catch {
      setStatus('disconnected')
    }
  }

  const handleOAuthCallback = async (code: string) => {
    try {
      setStatus('loading')
      setError(null)
      // Backend automatically uses NOTION_REDIRECT_URI from vault_kv
      const data = await callNotion('callback', { code })
      setWorkspace({
        name: data.workspace_name,
        icon: data.workspace_icon,
      })
      setStatus('connected')
    } catch (err: any) {
      setError(err.message || 'Kết nối Notion thất bại')
      setStatus('disconnected')
    }
  }

  // Start OAuth flow
  const connectNotion = async () => {
    try {
      const data = await callNotion('client-id')
      // Use exact registered redirect_uri from backend instead of guessing
      const redirectUri = encodeURIComponent(data.redirect_uri)
      const state = crypto.randomUUID() // Notion OAuth uses state param
      const url = `https://api.notion.com/v1/oauth/authorize?client_id=${data.client_id}&response_type=code&owner=user&redirect_uri=${redirectUri}&state=${state}`
      window.location.href = url
    } catch (err: any) {
      setError(err.message)
    }
  }

  // List pages
  const listPages = async () => {
    try {
      setStatus('listing')
      const data = await callNotion('list-pages')
      setPages(data.pages || [])
    } catch (err: any) {
      setError(err.message)
      setStatus('connected')
    }
  }

  // Import selected pages + auto-embed
  const importPages = async () => {
    try {
      setStatus('importing')
      const data = await callNotion('import', { page_ids: [...selected] })
      setImportResult({ imported: data.imported, errors: data.total - data.imported })

      // Auto-trigger embedding after import
      try {
        const token = await getToken()
        await fetch(`${EDGE_FUNCTION_URL}/embed`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch: true }),
        })
      } catch { /* embedding is best-effort */ }

      setStatus('done')
      onImportComplete()
    } catch (err: any) {
      setError(err.message)
      setStatus('connected')
    }
  }

  // Disconnect
  const disconnect = async () => {
    try {
      await callNotion('disconnect')
      setWorkspace(null)
      setPages([])
      setSelected(new Set())
      setStatus('disconnected')
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Toggle page selection
  const togglePage = (pageId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(pageId)) next.delete(pageId)
      else next.add(pageId)
      return next
    })
  }

  // Select/deselect all
  const toggleAll = () => {
    if (selected.size === pages.filter(p => !p.already_imported).length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(pages.filter(p => !p.already_imported).map(p => p.id)))
    }
  }

  return (
    <div className="notion-overlay" onClick={onClose}>
      <div className="notion-modal" onClick={e => e.stopPropagation()}>
        <div className="notion-header">
          <h2>📓 Import từ Notion</h2>
          <button className="notion-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="notion-error">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Loading */}
        {status === 'loading' && (
          <div className="notion-center">
            <div className="notion-spinner" />
            <p style={{ fontWeight: 500, fontSize: '1.1rem', marginTop: '16px' }}>Đang xác thực kết nối với Notion...</p>
            <p className="notion-desc">Brain2 đang thiết lập đường ống dữ liệu bảo mật.</p>
          </div>
        )}

        {/* Disconnected — show connect button */}
        {status === 'disconnected' && (
          <div className="notion-center">
            <div className="notion-icon-big">📓</div>
            <h3>Kết nối Notion workspace</h3>
            <p className="notion-desc">
              Cho phép Brain2 đọc pages từ Notion của bạn để import vào vault.
              <br />Brain2 chỉ đọc — không thay đổi bất kỳ dữ liệu nào trong Notion.
            </p>
            <button className="notion-btn primary" onClick={connectNotion}>
              Kết nối Notion →
            </button>
          </div>
        )}

        {/* Connected — show workspace info + list button */}
        {status === 'connected' && (
          <div className="notion-center">
            <div style={{ background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', padding: '10px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
              <span>✅</span> Kết nối Notion thành công!
            </div>
            <div className="notion-workspace" style={{ border: '2px solid rgba(108, 99, 255, 0.2)', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
              <span className="notion-ws-icon">{workspace?.icon || '📓'}</span>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{workspace?.name}</strong>
                {workspace?.synced_count !== undefined && (
                  <p className="notion-ws-meta" style={{ marginTop: '4px' }}>
                    📦 {workspace.synced_count} pages đã import
                    {workspace.last_synced && ` · Lần cuối: ${new Date(workspace.last_synced).toLocaleDateString('vi')}`}
                  </p>
                )}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Brain2 đã được quyền đọc nội dung từ Workspace này.</p>
              </div>
            </div>
            <div className="notion-actions" style={{ marginTop: '24px' }}>
              <button className="notion-btn primary" onClick={listPages} style={{ padding: '12px', fontSize: '1rem' }}>
                📄 Chọn Pages để Import →
              </button>
              <button className="notion-btn danger" onClick={disconnect}>
                Ngắt kết nối
              </button>
            </div>
          </div>
        )}

        {/* Listing pages */}
        {status === 'listing' && (
          <div className="notion-pages">
            <div className="notion-pages-header">
              <label className="notion-check-all">
                <input
                  type="checkbox"
                  checked={selected.size === pages.filter(p => !p.already_imported).length && selected.size > 0}
                  onChange={toggleAll}
                />
                <span>Chọn tất cả ({pages.filter(p => !p.already_imported).length})</span>
              </label>
              <button
                className="notion-btn primary"
                disabled={selected.size === 0}
                onClick={importPages}
              >
                Import {selected.size} pages →
              </button>
            </div>
            <div className="notion-pages-list">
              {pages.map(page => (
                <label
                  key={page.id}
                  className={`notion-page-item ${page.already_imported ? 'imported' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(page.id)}
                    onChange={() => togglePage(page.id)}
                    disabled={page.already_imported}
                  />
                  <span className="notion-page-icon">{page.icon || '📄'}</span>
                  <div className="notion-page-info">
                    <span className="notion-page-title">{page.title}</span>
                    <span className="notion-page-date">
                      {new Date(page.last_edited).toLocaleDateString('vi')}
                    </span>
                  </div>
                  {page.already_imported && (
                    <span className="notion-imported-badge">Đã import</span>
                  )}
                </label>
              ))}
              {pages.length === 0 && (
                <div className="notion-center" style={{ padding: '2rem' }}>
                  <p>Không tìm thấy page nào. Hãy chia sẻ pages với integration trong Notion.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Importing */}
        {status === 'importing' && (
          <div className="notion-center">
            <div className="notion-spinner" />
            <p>Đang import {selected.size} pages...</p>
            <p className="notion-desc">Quá trình này có thể mất vài giây.</p>
          </div>
        )}

        {/* Done */}
        {status === 'done' && importResult && (
          <div className="notion-center">
            <div className="notion-icon-big">✅</div>
            <h3>Import hoàn tất!</h3>
            <div className="notion-result">
              <p>✅ <strong>{importResult.imported}</strong> pages đã import thành công</p>
              {importResult.errors > 0 && (
                <p>⚠️ <strong>{importResult.errors}</strong> pages bị lỗi</p>
              )}
            </div>
            <button className="notion-btn primary" onClick={onClose}>
              Đóng & bắt đầu sử dụng
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
