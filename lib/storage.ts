import { createStorage } from '@rainbow-me/rainbowkit/storage'

export const storage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  getKeyName: (key) => `pizza-party-${key}`,
  onError: (error) => {
    console.error('Storage error:', error)
    // Fallback to memory storage if localStorage fails
    return {
      get: () => null,
      set: () => {},
      remove: () => {},
    }
  },
}) 