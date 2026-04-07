import { FileImport } from './FileImport'
import { NotionImport } from './NotionImport'
import { useVault } from '../../hooks/useVault'
import { useAuth } from '../../hooks/useAuth'

export function ImportManager() {
  const { user } = useAuth()
  const { totalCount } = useVault(user?.id)

  return (
    <div className="import-manager">
      {/* Stats bar */}
      <div className="import-stats-bar">
        <span>📚 Vault hiện có <strong>{totalCount} notes</strong></span>
        <span className="import-stats-sub">Import .md, .txt, .doc files để mở rộng vault</span>
      </div>

      {/* Two cards */}
      <div className="import-cards">
        <div className="import-card">
          <div className="import-card-header">
            <span className="import-card-icon">📁</span>
            <div>
              <div className="import-card-title">Upload Files</div>
              <div className="import-card-sub">Kéo thả hoặc chọn file</div>
            </div>
          </div>
          <FileImport />
        </div>

        <div className="import-card">
          <div className="import-card-header">
            <span className="import-card-icon">📝</span>
            <div>
              <div className="import-card-title">Import từ Notion</div>
              <div className="import-card-sub">Kết nối workspace của bạn</div>
            </div>
          </div>
          <NotionImport />
        </div>
      </div>
    </div>
  )
}
