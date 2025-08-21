// Jackpot data and timer logic for Pizza Party game

// Get next Sunday at 12pm PST
function getNextSundayAt12PM(): Date {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay // If today is Sunday, get next Sunday
  
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + daysUntilSunday)
  nextSunday.setHours(12, 0, 0, 0) // 12pm PST
  
  // If it's already past 12pm on Sunday, get next Sunday
  if (currentDay === 0 && now.getHours() >= 12) {
    nextSunday.setDate(nextSunday.getDate() + 7)
  }
  
  return nextSunday
}

// Calculate time until next draw
function calculateTimeUntilDraw(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const nextDraw = getNextSundayAt12PM()
  const timeDiff = nextDraw.getTime() - now.getTime()
  
  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds }
}

// Check if it's time for weekly jackpot draw (Sunday 12pm PST)
function isWeeklyJackpotTime(): boolean {
  const now = new Date()
  const nextDraw = getNextSundayAt12PM()
  const timeDiff = nextDraw.getTime() - now.getTime()
  
  // Consider it time if within 1 minute of draw time
  return timeDiff <= 60000 && timeDiff > 0
}

// Check if it's time for daily jackpot draw
function isDailyJackpotTime(): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Daily draw happens at 12pm PST every day
  return currentHour === 12 && currentMinute === 0
}

// Get time until claiming window (Sunday 12pm PST to Monday 12pm PST)
function getTimeUntilClaimingWindow(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const currentDay = now.getDay()
  const currentHour = now.getHours()
  
  let nextClaimingStart: Date
  
  if (currentDay === 0 && currentHour >= 12) {
    // It's Sunday after 12pm, next claiming is next Sunday
    nextClaimingStart = new Date(now)
    nextClaimingStart.setDate(now.getDate() + 7)
    nextClaimingStart.setHours(12, 0, 0, 0)
  } else if (currentDay === 1 && currentHour < 12) {
    // It's Monday before 12pm, claiming is still open
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  } else {
    // Get next Sunday at 12pm
    nextClaimingStart = getNextSundayAt12PM()
  }
  
  const timeDiff = nextClaimingStart.getTime() - now.getTime()
  
  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds }
}

// Check if toppings can be claimed (Sunday 12pm PST to Monday 12pm PST)
function canClaimToppings(): boolean {
  const now = new Date()
  const currentDay = now.getDay()
  const currentHour = now.getHours()
  
  // Claiming window: Sunday 12pm PST to Monday 12pm PST
  return (currentDay === 0 && currentHour >= 12) || (currentDay === 1 && currentHour < 12)
}

// Simulated data functions
export function calculateCommunityJackpot(): number {
  // Simulate community jackpot based on current time
  const baseAmount = 1000
  const timeBonus = Math.floor(Date.now() / 100000) % 500
  return baseAmount + timeBonus
}

export function formatJackpotAmount(amount: number): string {
  return amount.toLocaleString()
}

export function getWeeklyJackpotInfo() {
  const timeUntilDraw = calculateTimeUntilDraw()
  
  // Simulate weekly data
  const totalToppings = Math.floor(Math.random() * 1000) + 100
  const totalPlayers = Math.floor(Math.random() * 500) + 50
  
  return {
    totalToppings,
    totalPlayers,
    timeUntilDraw,
  }
}

export function getDailyPlayerCount(): number {
  return Math.floor(Math.random() * 100) + 10
}

export function getWeeklyPlayerCount(): number {
  return Math.floor(Math.random() * 500) + 50
}

export function getToppingsAvailableToClaim(): number {
  return Math.floor(Math.random() * 50) + 5
}

export function getTotalToppingsClaimed(): number {
  return Math.floor(Math.random() * 1000) + 100
}

export function selectWeeklyJackpotWinners(): string[] {
  const winners = []
  const winnerCount = Math.min(10, Math.floor(Math.random() * 15) + 5)
  
  for (let i = 0; i < winnerCount; i++) {
    winners.push(`0x${Math.random().toString(16).substring(2, 42)}`)
  }
  
  return winners
}

export function payWeeklyJackpotWinners(winners: string[], amount: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`💰 Paid ${amount} VMF to ${winners.length} weekly winners`)
      resolve()
    }, 1000)
  })
}

export function getUserClaimableToppings(address: string, isConnected: boolean): number {
  if (!isConnected || !address) return 0
  return Math.floor(Math.random() * 20) + 1
}

export function getTimeUntilClaimingWindow() {
  return getTimeUntilClaimingWindow()
}

export function isWeeklyJackpotTime(): boolean {
  return isWeeklyJackpotTime()
}

export function earnDailyPlayToppings(playerAddress: string): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const toppings = Math.floor(Math.random() * 5) + 1
      console.log(`🎁 Earned ${toppings} toppings for daily play`)
      resolve(toppings)
    }, 1000)
  })
}

export function earnVMFHoldingsToppings(playerAddress: string): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const toppings = Math.floor(Math.random() * 3) + 1
      console.log(`🎁 Earned ${toppings} toppings for VMF holdings`)
      resolve(toppings)
    }, 1000)
  })
}

export function selectDailyJackpotWinners(): string[] {
  const winners = []
  const winnerCount = Math.min(8, Math.floor(Math.random() * 10) + 3)
  
  for (let i = 0; i < winnerCount; i++) {
    winners.push(`0x${Math.random().toString(16).substring(2, 42)}`)
  }
  
  return winners
}

export function payDailyJackpotWinners(winners: string[], amount: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`💰 Paid ${amount} VMF to ${winners.length} daily winners`)
      resolve()
    }, 1000)
  })
}

export function isDailyJackpotTime(): boolean {
  return isDailyJackpotTime()
}

export function getDailyJackpotAmount(): number {
  return Math.floor(Math.random() * 100) + 50
}

export function getRealTimeDailyPlayerCount(): number {
  return Math.floor(Math.random() * 100) + 10
}

export function getRealTimeJackpotValue(): number {
  return Math.floor(Math.random() * 1000) + 100
}
