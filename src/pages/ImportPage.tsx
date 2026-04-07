import { AppLayout } from '../components/layout/AppLayout'
import { Header } from '../components/layout/Header'
import { ImportManager } from '../components/import/ImportManager'

export function ImportPage() {
  return (
    <AppLayout>
      <Header title="Import" badge="Từ Notion / Files" />
      <div className="page-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="import-page-container">
          <ImportManager />
        </div>
      </div>
    </AppLayout>
  )
}
