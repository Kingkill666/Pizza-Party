import { CONTRACT_ADDRESSES, PIZZA_PARTY_ABI, FREE_PRICE_ORACLE_ABI, FREE_RANDOMNESS_ABI } from './contract-config'

// Web3 provider interface
export interface Web3Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (params: any) => void) => void
  removeListener: (event: string, callback: (params: any) => void) => void
}

// Pizza Party Contract class for interacting with deployed contracts
export class PizzaPartyContract {
  private provider: Web3Provider
  private pizzaPartyAddress: string
  private priceOracleAddress: string
  private randomnessAddress: string

  constructor(provider: Web3Provider) {
    this.provider = provider
    this.pizzaPartyAddress = CONTRACT_ADDRESSES.PIZZA_PARTY
    this.priceOracleAddress = CONTRACT_ADDRESSES.FREE_PRICE_ORACLE
    this.randomnessAddress = CONTRACT_ADDRESSES.FREE_RANDOMNESS
  }

  // Get player data from contract
  async getPlayerData(playerAddress: string) {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.pizzaPartyAddress,
          data: this.encodeFunctionCall('getPlayerData', [playerAddress])
        }, 'latest']
      })
      return this.decodePlayerData(data)
    } catch (error) {
      console.error('Error getting player data:', error)
      return null
    }
  }

  // Get current jackpots
  async getJackpots() {
    try {
      const [dailyJackpot, weeklyJackpot] = await Promise.all([
        this.provider.request({
          method: 'eth_call',
          params: [{
            to: this.pizzaPartyAddress,
            data: this.encodeFunctionCall('getDailyJackpot', [])
          }, 'latest']
        }),
        this.provider.request({
          method: 'eth_call',
          params: [{
            to: this.pizzaPartyAddress,
            data: this.encodeFunctionCall('getWeeklyJackpot', [])
          }, 'latest']
        })
      ])

      return {
        daily: this.decodeUint256(dailyJackpot),
        weekly: this.decodeUint256(weeklyJackpot)
      }
    } catch (error) {
      console.error('Error getting jackpots:', error)
      return { daily: 0, weekly: 0 }
    }
  }

  // Get current entry fee
  async getCurrentEntryFee() {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.pizzaPartyAddress,
          data: this.encodeFunctionCall('getCurrentEntryFee', [])
        }, 'latest']
      })
      return this.decodeUint256(data)
    } catch (error) {
      console.error('Error getting entry fee:', error)
      return 0
    }
  }

  // Get current VMF price
  async getCurrentVMFPrice() {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.priceOracleAddress,
          data: this.encodeFunctionCall('getVMFPrice', [])
        }, 'latest']
      })
      return this.decodeUint256(data)
    } catch (error) {
      console.error('Error getting VMF price:', error)
      return 0
    }
  }

  // Enter daily game
  async enterDailyGame(referralCode: string = '') {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      const data = this.encodeFunctionCall('enterDailyGame', [referralCode])
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          value: '0x3B9ACA00' // 0.001 ETH in wei
        }]
      })

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          value: '0x3B9ACA00', // 0.001 ETH in wei
          gas: gasEstimate
        }]
      })

      return txHash
    } catch (error) {
      console.error('Error entering daily game:', error)
      throw error
    }
  }

  // Create referral code
  async createReferralCode() {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      const data = this.encodeFunctionCall('createReferralCode', [])
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data
        }]
      })

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          gas: gasEstimate
        }]
      })

      return txHash
    } catch (error) {
      console.error('Error creating referral code:', error)
      throw error
    }
  }

  // Award VMF holdings toppings
  async awardVMFHoldingsToppings() {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      const data = this.encodeFunctionCall('awardVMFHoldingsToppings', [])
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data
        }]
      })

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          gas: gasEstimate
        }]
      })

      return txHash
    } catch (error) {
      console.error('Error awarding VMF holdings toppings:', error)
      throw error
    }
  }

  // Get daily player count
  async getDailyPlayerCount(): Promise<number> {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.pizzaPartyAddress,
          data: this.encodeFunctionCall('dailyPlayerCount', ['1'])
        }, 'latest']
      })
      return this.decodeUint256(data)
    } catch (error) {
      console.error('Error getting daily player count:', error)
      return 0
    }
  }

  // Get weekly player count
  async getWeeklyPlayerCount(): Promise<number> {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.pizzaPartyAddress,
          data: this.encodeFunctionCall('weeklyPlayerCount', ['1'])
        }, 'latest']
      })
      return this.decodeUint256(data)
    } catch (error) {
      console.error('Error getting weekly player count:', error)
      return 0
    }
  }

  // Award streak bonus
  async awardStreakBonus() {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      const data = this.encodeFunctionCall('awardStreakBonus', [])
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data
        }]
      })

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          gas: gasEstimate
        }]
      })

      return txHash
    } catch (error) {
      console.error('Error awarding streak bonus:', error)
      throw error
    }
  }

  // Helper methods
  private encodeFunctionCall(functionName: string, params: any[]): string {
    // Simple function signature encoding
    const signature = `${functionName}(${params.map(() => 'string').join(',')})`
    const functionSelector = this.keccak256(signature).slice(0, 10)
    
    // For simplicity, we'll just return the function selector
    // In a real implementation, you'd encode the parameters properly
    return functionSelector
  }

  private decodePlayerData(data: string) {
    // Simple decoding - in real implementation, you'd decode the tuple properly
    return {
      hasEnteredToday: false,
      lastEntryTime: 0,
      totalEntries: 0,
      toppings: 0,
      referralCode: '',
      referredBy: ''
    }
  }

  private decodeUint256(data: string): number {
    return parseInt(data, 16)
  }

  private keccak256(data: string): string {
    // Simple hash function - in real implementation, use proper crypto library
    return '0x' + data.split('').map(char => char.charCodeAt(0).toString(16)).join('')
  }
}

// Factory function to create PizzaPartyContract instance
export const createPizzaPartyContract = (provider: Web3Provider): PizzaPartyContract => {
  return new PizzaPartyContract(provider)
}

// Utility functions
export const formatVMFAmount = (amount: number): string => {
  return (amount / 1e18).toFixed(6)
}

export const parseVMFAmount = (amount: string): number => {
  return parseFloat(amount) * 1e18
}

// Check transaction status
export const checkTransactionStatus = async (provider: Web3Provider, txHash: string): Promise<boolean> => {
  try {
    const receipt = await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    })
    return receipt && receipt.status === '0x1'
  } catch (error) {
    console.error('Error checking transaction status:', error)
    return false
  }
} 