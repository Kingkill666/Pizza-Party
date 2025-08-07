"use client"
// DEPLOYMENT MARKER: Enhanced SSR Protection - Commit 5ff1c13

import { useState, useEffect } from 'react'
import { WagmiConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi-config'

interface WagmiProviderProps {
  children: React.ReactNode
}

export const WagmiProvider = ({ children }: WagmiProviderProps) => {
  const [isClient, setIsClient] = useState(false)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))

  useEffect(() => {
    // Only set client-side after hydration
    setIsClient(true)
  }, [])

  // SSR SAFETY: Don't render anything until client-side to prevent SSR issues
  if (!isClient) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    )
  }

  // SSR SAFETY: Only render Wagmi components after client-side hydration
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        {children}
      </WagmiConfig>
    </QueryClientProvider>
  )
} 