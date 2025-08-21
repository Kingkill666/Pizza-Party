// Jackpot data and timer logic for Pizza Party game

// Get next Monday at 12pm PST
function getNextMondayAt12PM(): Date {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysUntilMonday = currentDay === 1 ? 7 : (8 - currentDay) % 7 // If today is Monday, get next Monday
  
  const nextMonday = new Date(now)
  nextMonday.setDate(now.getDate() + daysUntilMonday)
  nextMonday.setHours(12, 0, 0, 0) // 12pm PST
  
  // If it's already past 12pm on Monday, get next Monday
  if (currentDay === 1 && now.getHours() >= 12) {
    nextMonday.setDate(nextMonday.getDate() + 7)
  }
  
  return nextMonday
}

// Calculate time until next draw
function calculateTimeUntilDraw(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const nextDraw = getNextMondayAt12PM()
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

// Check if it's time for weekly jackpot draw (Monday 12pm PST)
function checkWeeklyJackpotTime(): boolean {
  const now = new Date()
  const nextDraw = getNextMondayAt12PM()
  const timeDiff = nextDraw.getTime() - now.getTime()
  
  // Consider it time if within 1 minute of draw time
  return timeDiff <= 60000 && timeDiff > 0
}

// Check if it's time for daily jackpot draw
function checkDailyJackpotTime(): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Daily draw happens at 12pm PST every day
  return currentHour === 12 && currentMinute === 0
}

// Get time until claiming window (Monday 12pm PST to Tuesday 12pm PST)
function calculateTimeUntilClaimingWindow(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const currentDay = now.getDay()
  const currentHour = now.getHours()
  
  let nextClaimingStart: Date
  
  if (currentDay === 1 && currentHour >= 12) {
    // It's Monday after 12pm, next claiming is next Monday
    nextClaimingStart = new Date(now)
    nextClaimingStart.setDate(now.getDate() + 7)
    nextClaimingStart.setHours(12, 0, 0, 0)
  } else if (currentDay === 2 && currentHour < 12) {
    // It's Tuesday before 12pm, claiming is still open
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  } else {
    // Get next Monday at 12pm
    nextClaimingStart = getNextMondayAt12PM()
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

// Check if toppings can be claimed (Monday 12pm PST to Tuesday 12pm PST)
function checkCanClaimToppings(): boolean {
  const now = new Date()
  const currentDay = now.getDay()
  const currentHour = now.getHours()
  
  // Claiming window: Monday 12pm PST to Tuesday 12pm PST
  return (currentDay === 1 && currentHour >= 12) || (currentDay === 2 && currentHour < 12)
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
  return calculateTimeUntilClaimingWindow()
}

export function isWeeklyJackpotTime(): boolean {
  return checkWeeklyJackpotTime()
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
  return checkDailyJackpotTime()
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

export function canClaimToppings(): boolean {
  return checkCanClaimToppings()
}
