// Payout System Utilities
// Handles payout calculations, winner selection, and data management

export interface PayoutRecord {
  id: number
  type: 'daily' | 'weekly'
  timestamp: number
  winners: string[]
  jackpotAmount: number
  prizePerWinner: number
  totalEntries?: number
  totalToppings?: number
  totalPlayers?: number
  processed: boolean
}

export interface GameData {
  totalEntries: number
  jackpotAmount: number
}

export interface WeeklyData {
  totalToppings: number
  totalPlayers: number
  players: PlayerData[]
  jackpotAmount: number
}

export interface PlayerData {
  address: string
  toppings: number
}

// Error handling wrapper
export class PayoutError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'PayoutError'
  }
}

// Get current game data with error handling
export const getCurrentGameData = (): GameData => {
  try {
    if (typeof window === "undefined") {
      return { totalEntries: 0, jackpotAmount: 0 }
    }

    const today = new Date().toDateString()
    let totalEntries = 0
    let jackpotAmount = 0

    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("pizza_entry_") && key.endsWith(`_${today}`)) {
        if (localStorage.getItem(key) === "true") {
          totalEntries++
          jackpotAmount += 50 // 50 VMF per entry
        }
      }
    })

    return { totalEntries, jackpotAmount }
  } catch (error) {
    console.error("Error getting current game data:", error)
    throw new PayoutError("Failed to get current game data", "GAME_DATA_ERROR")
  }
}

// Get weekly data with error handling
export const getWeeklyData = (): WeeklyData => {
  try {
    if (typeof window === "undefined") {
      return { totalToppings: 0, totalPlayers: 0, players: [], jackpotAmount: 0 }
    }

    let totalToppings = 0
    let totalPlayers = 0
    const players: PlayerData[] = []

    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("pizza_toppings_")) {
        const toppings = Number.parseInt(localStorage.getItem(key) || "0")
        if (toppings > 0) {
          const address = key.replace("pizza_toppings_", "")
          totalToppings += toppings
          totalPlayers++
          players.push({ address, toppings })
        }
      }
    })

    return {
      totalToppings,
      totalPlayers,
      players,
      jackpotAmount: totalToppings * 25, // 25 VMF per topping
    }
  } catch (error) {
    console.error("Error getting weekly data:", error)
    throw new PayoutError("Failed to get weekly data", "WEEKLY_DATA_ERROR")
  }
}

// Get player addresses with error handling
export const getPlayerAddresses = (): string[] => {
  try {
    if (typeof window === "undefined") {
      return []
    }

    const addresses: string[] = []
    const keys = Object.keys(localStorage)
    
    keys.forEach((key) => {
      if (key.startsWith("pizza_entry_")) {
        const address = key.replace("pizza_entry_", "").split("_")[0]
        if (!addresses.includes(address)) {
          addresses.push(address)
        }
      }
    })
    
    return addresses
  } catch (error) {
    console.error("Error getting player addresses:", error)
    throw new PayoutError("Failed to get player addresses", "ADDRESS_ERROR")
  }
}

// Select daily winners with weighted randomness
export const selectDailyWinners = (totalEntries: number): string[] => {
  try {
    const winners: string[] = []
    const addresses = getPlayerAddresses()
    
    if (addresses.length === 0) {
      return winners
    }
    
    // Use weighted selection based on entry count
    const entryCounts = new Map<string, number>()
    addresses.forEach(address => {
      const count = getPlayerEntryCount(address)
      entryCounts.set(address, count)
    })
    
    const totalWeight = Array.from(entryCounts.values()).reduce((sum, count) => sum + count, 0)
    
    for (let i = 0; i < 8 && i < addresses.length; i++) {
      const random = Math.random() * totalWeight
      let currentWeight = 0
      
      for (const [address, count] of entryCounts) {
        currentWeight += count
        if (random <= currentWeight && !winners.includes(address)) {
          winners.push(address)
          break
        }
      }
    }
    
    return winners
  } catch (error) {
    console.error("Error selecting daily winners:", error)
    throw new PayoutError("Failed to select daily winners", "WINNER_SELECTION_ERROR")
  }
}

// Select weekly winners based on toppings (weighted)
export const selectWeeklyWinners = (players: PlayerData[]): string[] => {
  try {
    const winners: string[] = []
    
    if (players.length === 0) {
      return winners
    }
    
    // Create weighted selection based on toppings
    const totalWeight = players.reduce((sum, player) => sum + player.toppings, 0)
    
    for (let i = 0; i < 10 && i < players.length; i++) {
      const random = Math.random() * totalWeight
      let currentWeight = 0
      
      for (const player of players) {
        currentWeight += player.toppings
        if (random <= currentWeight && !winners.includes(player.address)) {
          winners.push(player.address)
          break
        }
      }
    }
    
    return winners
  } catch (error) {
    console.error("Error selecting weekly winners:", error)
    throw new PayoutError("Failed to select weekly winners", "WINNER_SELECTION_ERROR")
  }
}

// Get player entry count
export const getPlayerEntryCount = (address: string): number => {
  try {
    if (typeof window === "undefined") {
      return 0
    }

    const today = new Date().toDateString()
    let count = 0
    const keys = Object.keys(localStorage)
    
    keys.forEach((key) => {
      if (key.startsWith(`pizza_entry_${address}_`) && key.endsWith(`_${today}`)) {
        if (localStorage.getItem(key) === "true") {
          count++
        }
      }
    })
    
    return count
  } catch (error) {
    console.error("Error getting player entry count:", error)
    return 0
  }
}

// Save payout record with error handling
export const savePayoutRecord = (record: PayoutRecord): void => {
  try {
    if (typeof window === "undefined") {
      return
    }

    const history = JSON.parse(localStorage.getItem("pizza_payout_history") || "[]")
    history.unshift(record)
    localStorage.setItem("pizza_payout_history", JSON.stringify(history))
  } catch (error) {
    console.error("Error saving payout record:", error)
    throw new PayoutError("Failed to save payout record", "SAVE_ERROR")
  }
}

// Get payout history with error handling
export const getPayoutHistory = (): PayoutRecord[] => {
  try {
    if (typeof window === "undefined") {
      return []
    }

    return JSON.parse(localStorage.getItem("pizza_payout_history") || "[]")
  } catch (error) {
    console.error("Error getting payout history:", error)
    return []
  }
}

// Reset daily game with error handling
export const resetDailyGame = (): void => {
  try {
    if (typeof window === "undefined") {
      return
    }

    const today = new Date().toDateString()
    const keys = Object.keys(localStorage)
    
    keys.forEach((key) => {
      if (key.startsWith("pizza_entry_") && key.endsWith(`_${today}`)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("Error resetting daily game:", error)
    throw new PayoutError("Failed to reset daily game", "RESET_ERROR")
  }
}

// Reset weekly game with error handling
export const resetWeeklyGame = (): void => {
  try {
    if (typeof window === "undefined") {
      return
    }

    const keys = Object.keys(localStorage)
    
    keys.forEach((key) => {
      if (key.startsWith("pizza_toppings_")) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("Error resetting weekly game:", error)
    throw new PayoutError("Failed to reset weekly game", "RESET_ERROR")
  }
}

// Format timestamp for display
export const formatTimestamp = (timestamp: number): string => {
  try {
    return new Date(timestamp).toLocaleString()
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Invalid date"
  }
}

// Format address for display
export const formatAddress = (address: string): string => {
  try {
    if (!address || address.length < 10) {
      return "Invalid address"
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  } catch (error) {
    console.error("Error formatting address:", error)
    return "Invalid address"
  }
} 