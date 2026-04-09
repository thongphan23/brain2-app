import { useState, useEffect, useCallback } from 'react'

export function useNetworkState() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const handleOffline = useCallback(() => setIsOffline(true), [])
  const handleOnline = useCallback(() => setIsOffline(false), [])

  useEffect(() => {
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [handleOffline, handleOnline])

  return isOffline
}
