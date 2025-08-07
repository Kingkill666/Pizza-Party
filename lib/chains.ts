import { baseSepolia } from 'wagmi/chains'

// Pizza Party chain configuration for Base Sepolia
export const pizzaPartyChain = {
  ...baseSepolia,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Base',
    symbol: 'BASE',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Base Sepolia Explorer',
      url: 'https://sepolia.basescan.org',
    },
  },
}

export { baseSepolia } 