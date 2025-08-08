import { createConfig, http } from 'wagmi'
import { baseSepolia, base } from 'wagmi/chains'
import { 
  metaMaskWallet, 
  coinbaseWallet, 
  rainbowWallet, 
  trustWallet, 
  phantomWallet
} from '@rainbow-me/rainbowkit/wallets'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { pizzaPartyChain } from './chains'

// WalletConnect v2 configuration with proper project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9'

// Create connectors with mobile-optimized wallet support
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet,
      coinbaseWallet,
      rainbowWallet,
      trustWallet,
      phantomWallet,
    ],
  },
], {
  appName: 'Pizza Party',
  projectId,
})

// Create wagmi config with RainbowKit connectors
export const config = createConfig({
  chains: [pizzaPartyChain, base],
  connectors,
  ssr: true,
  transports: {
    [pizzaPartyChain.id]: http('https://sepolia.base.org'),
    [base.id]: http('https://mainnet.base.org'),
  },
}) 