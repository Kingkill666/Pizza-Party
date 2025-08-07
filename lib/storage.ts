// Simple storage implementation for wallet connections
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(`pizza-party-${key}`)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`pizza-party-${key}`, JSON.stringify(value))
    } catch {
      // Handle storage errors
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(`pizza-party-${key}`)
    } catch {
      // Handle storage errors
    }
  },
} 