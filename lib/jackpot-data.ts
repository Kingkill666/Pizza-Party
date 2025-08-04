// Jackpot calculation and data utilities

// Calculate community jackpot based on player activity
export const calculateCommunityJackpot = (): number => {
  if (typeof window === "undefined") return 0 // Default for SSR

  // Count today's players (each player pays 1 VMF)
  const today = new Date().toDateString()
  const keys = Object.keys(localStorage)
  let todaysPlayers = 0

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.includes(today) && localStorage.getItem(key) === "true") {
      todaysPlayers++
    }
  })

  // Each player pays 1 VMF, so jackpot = number of players
  return todaysPlayers
}

// Format jackpot amount for display
export const formatJackpotAmount = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toLocaleString()
}

// Get weekly jackpot information
export const getWeeklyJackpotInfo = () => {
  // Calculate time until next Sunday at 12pm PST
  const now = new Date()
  const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const pstTime = new Date(utc + pstOffset * 60000)

  // Find next Sunday at 12pm PST
  const nextSunday = new Date(pstTime)
  const daysUntilSunday = (7 - pstTime.getDay()) % 7
  if (daysUntilSunday === 0 && pstTime.getHours() >= 12) {
    // If it's Sunday and past 12pm, go to next Sunday
    nextSunday.setDate(nextSunday.getDate() + 7)
  } else {
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday)
  }
  nextSunday.setHours(12, 0, 0, 0)

  // Calculate time difference
  const difference = nextSunday.getTime() - pstTime.getTime()
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  // Count total toppings and players
  let totalToppings = 0
  let totalPlayers = 0

  if (typeof window !== "undefined") {
    const keys = Object.keys(localStorage)
    const uniquePlayers = new Set()

    keys.forEach((key) => {
      if (key.startsWith("pizza_toppings_")) {
        const toppings = Number.parseInt(localStorage.getItem(key) || "0")
        if (toppings > 0) {
          totalToppings += toppings
          const address = key.replace("pizza_toppings_", "")
          uniquePlayers.add(address)
        }
      }
    })

    totalPlayers = uniquePlayers.size
  }

  return {
    totalToppings,
    totalPlayers,
    timeUntilDraw: {
      days: Math.max(0, days),
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds),
    },
  }
}

// Simulate jackpot winner selection (for demo purposes)
export const selectJackpotWinner = (): string | null => {
  if (typeof window === "undefined") return null

  const players: { address: string; toppings: number }[] = []
  const keys = Object.keys(localStorage)

  // Collect all players with toppings
  keys.forEach((key) => {
    if (key.startsWith("pizza_toppings_")) {
      const toppings = Number.parseInt(localStorage.getItem(key) || "0")
      if (toppings > 0) {
        const address = key.replace("pizza_toppings_", "")
        players.push({ address, toppings })
      }
    }
  })

  if (players.length === 0) return null

  // Create weighted selection based on toppings
  const totalWeight = players.reduce((sum, player) => sum + player.toppings, 0)
  const random = Math.random() * totalWeight

  let currentWeight = 0
  for (const player of players) {
    currentWeight += player.toppings
    if (random <= currentWeight) {
      return player.address
    }
  }

  // Fallback to last player
  return players[players.length - 1].address
}

// Reset weekly jackpot (called after winner selection)
export const resetWeeklyJackpot = (): void => {
  if (typeof window === "undefined") return

  const keys = Object.keys(localStorage)

  // Clear all toppings
  keys.forEach((key) => {
    if (key.startsWith("pizza_toppings_")) {
      localStorage.removeItem(key)
    }
  })

  // Clear referral stats (reset remaining invites)
  keys.forEach((key) => {
    if (key.startsWith("pizza_referrer_stats_")) {
      localStorage.setItem(
        key,
        JSON.stringify({
          totalAllowed: 3,
          used: 0,
          remaining: 3,
          joined: 0,
        }),
      )
    }
  })

  console.log("🏆 Weekly jackpot reset completed")
}
