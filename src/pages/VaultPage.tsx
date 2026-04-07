import { AppLayout } from '../components/layout/AppLayout'
import { Header } from '../components/layout/Header'
import { VaultBrowser } from '../components/vault/VaultBrowser'
import { useAuth } from '../hooks/useAuth'
import { useVault } from '../hooks/useVault'
import { useState } from 'react'

export function VaultPage() {
  const { user, profile } = useAuth()
  const { totalCount } = useVault(user?.id)
  const [conversations] = useState<any[]>([])

  if (!user || !profile) return null

  return (
    <AppLayout
      conversations={conversations}
      header={
        <Header
          title="Vault"
          badge={`${totalCount} notes`}
        />
      }
    >
      <VaultBrowser />
    </AppLayout>
  )
}
