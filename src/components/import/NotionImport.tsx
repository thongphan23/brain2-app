import { useState } from 'react'
import { Button } from '../shared/Button'
import { useAuth } from '../../hooks/useAuth'

export function NotionImport() {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!user) return
    setLoading(true)
    // Redirect to Notion OAuth (placeholder — requires client_id setup)
    const clientId = import.meta.env.VITE_NOTION_CLIENT_ID
    if (!clientId) {
      // Placeholder mode
      setLoading(false)
      return
    }
    const redirectUri = `${window.location.origin}/auth/notion/callback`
    window.location.href = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`
  }

  return (
    <div className="notion-import">
      {!connected ? (
        <div className="notion-import-disconnected">
          <div className="notion-import-icon">📝</div>
          <h3>Kết nối Notion</h3>
          <p>Import toàn bộ workspace Notion của bạn vào Brain2.</p>
          {!import.meta.env.VITE_NOTION_CLIENT_ID ? (
            <div className="notion-import-placeholder">
              Tính năng đang phát triển.<br />
              Bạn có thể dùng <strong>File Upload</strong> để import ngay.
            </div>
          ) : (
            <Button variant="primary" onClick={handleConnect} disabled={loading}>
              {loading ? 'Đang kết nối...' : '🔗 Kết nối Notion'}
            </Button>
          )}
        </div>
      ) : (
        <div className="notion-import-connected">
          <div className="notion-import-workspace">
            <span>📓 Workspace đã kết nối</span>
            <Button variant="ghost" size="sm" onClick={() => setConnected(false)}>
              Ngắt kết nối
            </Button>
          </div>
          <div className="notion-import-placeholder">
            Chọn trang để import...
          </div>
        </div>
      )}
    </div>
  )
}
