// Contract service for smart contract interactions
import { PizzaPartyContract, createPizzaPartyContract } from '@/lib/contract-interactions'
import { InputValidator } from '@/lib/input-validator'
import { ErrorHandler } from '@/lib/error-handler'

export interface ContractCallParams {
  method: string
  params: any[]
  options?: any
}

export interface ContractCallResult {
  success: boolean
  data?: any
  transactionHash?: string
  error?: string
}

export interface IContractService {
  enterDailyGame(referralCode: string): Promise<any>
  getDailyPlayerCount(): Promise<number>
  getWeeklyPlayerCount(): Promise<number>
  claimToppings(amount: number): Promise<any>
  getPlayerInfo(address: string): Promise<any>
  getJackpotAmount(): Promise<string>
}

export class ContractService implements IContractService {
  private getContract(): PizzaPartyContract {
    if (typeof window !== 'undefined' && window.ethereum) {
      return createPizzaPartyContract(window.ethereum)
    }
    throw new Error('No Web3 provider available')
  }

  async enterDailyGame(referralCode: string): Promise<any> {
    try {
      // Input validation
      if (referralCode) {
        const referralValidation = InputValidator.validateReferralCode(referralCode)
        if (!referralValidation.valid) {
          throw new Error(referralValidation.error || 'Invalid referral code')
        }
      }

      const contract = this.getContract()
      const result = await contract.enterDailyGame(referralCode || "")
      
      return result
    } catch (error: any) {
      console.error('Contract call error:', error)
      throw error
    }
  }

  async getDailyPlayerCount(): Promise<number> {
    try {
      // Mock implementation since the contract doesn't have this method
      // In a real implementation, this would call the contract
      return parseInt(localStorage.getItem('daily_player_count') || '0')
    } catch (error: any) {
      console.error('Error getting daily player count:', error)
      return 0
    }
  }

  async getWeeklyPlayerCount(): Promise<number> {
    try {
      // Mock implementation since the contract doesn't have this method
      // In a real implementation, this would call the contract
      return parseInt(localStorage.getItem('weekly_player_count') || '0')
    } catch (error: any) {
      console.error('Error getting weekly player count:', error)
      return 0
    }
  }

  async claimToppings(amount: number): Promise<any> {
    try {
      // Input validation
      const amountValidation = InputValidator.validateAmount(amount)
      if (!amountValidation.valid) {
        throw new Error(amountValidation.error || 'Invalid amount')
      }

      // Mock implementation since the contract doesn't have this method
      // In a real implementation, this would call the contract
      const mockResult = {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
      }
      
      return mockResult
    } catch (error: any) {
      console.error('Claim toppings error:', error)
      throw error
    }
  }

  async getPlayerInfo(address: string): Promise<any> {
    try {
      // Input validation
      const addressValidation = InputValidator.validateWalletAddress(address)
      if (!addressValidation.valid) {
        throw new Error(addressValidation.error || 'Invalid wallet address')
      }

      const contract = this.getContract()
      const playerInfo = await contract.getPlayerData(address)
      
      return playerInfo
    } catch (error: any) {
      console.error('Error getting player info:', error)
      throw error
    }
  }

  async getJackpotAmount(): Promise<string> {
    try {
      const contract = this.getContract()
      const jackpots = await contract.getJackpots()
      return (jackpots.daily / 1e18).toString()
    } catch (error: any) {
      console.error('Error getting jackpot amount:', error)
      return '0.000'
    }
  }

  // Generic contract call method
  async callContract(params: ContractCallParams): Promise<ContractCallResult> {
    try {
      const contract = this.getContract()
      
      // This would be a generic method to call any contract function
      // For now, we'll return a mock result
      const mockResult = {
        success: true,
        data: 'mock_data',
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
      }
      
      return mockResult
    } catch (error: any) {
      console.error('Generic contract call error:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }
} 