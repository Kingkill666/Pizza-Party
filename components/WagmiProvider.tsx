"use client"

import { WagmiConfig } from 'wagmi'
import { config } from '@/lib/wagmi-config'

interface WagmiProviderProps {
  children: React.ReactNode
}

export const WagmiProvider = ({ children }: WagmiProviderProps) => {
  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  )
} 