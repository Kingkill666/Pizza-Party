"use client";

import { FarcasterWalletProvider } from './FarcasterWalletProvider'
import { WagmiProvider } from './WagmiProvider'

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <FarcasterWalletProvider>
        {children}
      </FarcasterWalletProvider>
    </WagmiProvider>
  )
}
