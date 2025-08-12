import { CONTRACT_ADDRESSES, PIZZA_PARTY_ABI, FREE_PRICE_ORACLE_ABI, FREE_RANDOMNESS_ABI, VMF_TOKEN_ABI } from './contract-config'
import { GaslessGameService } from './services/gasless-game-service';

// Web3 provider interface
export interface Web3Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (params: any) => void) => void
  removeListener: (event: string, callback: (params: any) => void) => void
}

// Pizza Party Contract class for interacting with deployed contracts
export class PizzaPartyContract {
  private provider: any
  private pizzaPartyAddress: string
  private priceOracleAddress: string
  private randomnessAddress: string
  private gaslessService?: GaslessGameService;

  constructor(provider: any) {
    this.provider = provider
    this.pizzaPartyAddress = CONTRACT_ADDRESSES.PIZZA_PARTY
    this.priceOracleAddress = CONTRACT_ADDRESSES.FREE_PRICE_ORACLE
    this.randomnessAddress = CONTRACT_ADDRESSES.FREE_RANDOMNESS
    
    // Initialize gasless service
    this.gaslessService = new GaslessGameService(
      provider,
      // We'll initialize the signer later when needed
      undefined as any, 
      this.pizzaPartyAddress,
      PIZZA_PARTY_ABI
    );
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

  /**
   * Enter daily game with gasless transaction support
   */
  async enterDailyGame(referralCode: string = '', useGasless: boolean = false): Promise<string> {
    try {
      if (useGasless && this.gaslessService) {
        // Check if gasless is supported
        const gaslessCheck = await this.gaslessService.canPerformGasless();
        if (gaslessCheck.supported) {
          console.log('🚀 Using gasless transaction for daily game entry');
          return await this.gaslessService.enterDailyGameGasless(referralCode);
        } else {
          console.log('⚠️ Gasless not available, falling back to regular transaction:', gaslessCheck.reason);
        }
      }

      // Fallback to regular transaction
      console.log('💰 Using regular transaction for daily game entry');
      return await this.enterDailyGameRegular(referralCode);
    } catch (error) {
      console.error('❌ Daily game entry failed:', error);
      throw error;
    }
  }

  /**
   * Regular transaction for daily game entry
   */
  private async enterDailyGameRegular(referralCode: string = ''): Promise<string> {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      // First, approve VMF token transfer to the contract
      const vmfContractAddress = "0x2213414893259b0c48066acd1763e7fba97859e5" // VMF token address on Base
      const vmfAmount = '0xDE0B6B3A7640000' // 1 VMF in wei (18 decimals)
      
      // Approve VMF transfer using VMF token ABI
      const approveData = this.encodeFunctionCallWithABI('approve', [this.pizzaPartyAddress, vmfAmount], VMF_TOKEN_ABI)
      const approveGasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: vmfContractAddress,
          data: approveData
        }]
      })

      const approveTxHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: vmfContractAddress,
          data: approveData,
          gas: approveGasEstimate
        }]
      })

      // Wait for approval transaction to be mined
      await this.waitForTransaction(approveTxHash)
      
      // Now enter the game (contract will transfer VMF tokens)
      const data = this.encodeFunctionCall('enterDailyGame', [referralCode])
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
      console.error('Error entering daily game:', error)
      throw error
    }
  }

  /**
   * Claim toppings with gasless transaction support
   */
  async claimToppings(useGasless: boolean = false): Promise<string> {
    try {
      if (useGasless && this.gaslessService) {
        // Check if gasless is supported
        const gaslessCheck = await this.gaslessService.canPerformGasless();
        if (gaslessCheck.supported) {
          console.log('🚀 Using gasless transaction for topping claim');
          return await this.gaslessService.claimToppingsGasless();
        } else {
          console.log('⚠️ Gasless not available, falling back to regular transaction:', gaslessCheck.reason);
        }
      }

      // Fallback to regular transaction
      console.log('💰 Using regular transaction for topping claim');
      return await this.claimToppingsRegular();
    } catch (error) {
      console.error('❌ Topping claim failed:', error);
      throw error;
    }
  }

  /**
   * Regular transaction for claiming toppings
   */
  private async claimToppingsRegular(): Promise<string> {
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

  /**
   * Add jackpot entry with gasless transaction support
   */
  async addJackpotEntry(useGasless: boolean = false): Promise<string> {
    try {
      if (useGasless && this.gaslessService) {
        // Check if gasless is supported
        const gaslessCheck = await this.gaslessService.canPerformGasless();
        if (gaslessCheck.supported) {
          console.log('🚀 Using gasless transaction for jackpot entry');
          return await this.gaslessService.addJackpotEntryGasless();
        } else {
          console.log('⚠️ Gasless not available, falling back to regular transaction:', gaslessCheck.reason);
        }
      }

      // Fallback to regular transaction
      console.log('💰 Using regular transaction for jackpot entry');
      return await this.addJackpotEntryRegular();
    } catch (error) {
      console.error('❌ Jackpot entry failed:', error);
      throw error;
    }
  }

  /**
   * Regular transaction for adding jackpot entry
   */
  private async addJackpotEntryRegular(): Promise<string> {
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

  // Wait for transaction to be mined
  private async waitForTransaction(txHash: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkTransaction = async () => {
        try {
          const receipt = await this.provider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash]
          })
          
          if (receipt && receipt.blockNumber) {
            resolve()
          } else {
            setTimeout(checkTransaction, 2000) // Check again in 2 seconds
          }
        } catch (error) {
          reject(error)
        }
      }
      
      checkTransaction()
    })
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
          data: this.encodeFunctionCall('dailyPlayerCount', ['0x0000000000000000000000000000000000000000000000000000000000000001'])
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
          data: this.encodeFunctionCall('weeklyPlayerCount', ['0x0000000000000000000000000000000000000000000000000000000000000001'])
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
    // Function selectors for common functions
    const functionSelectors: { [key: string]: string } = {
      'dailyPlayerCount': '0x8b5b9ccc', // keccak256('dailyPlayerCount(uint256)')
      'weeklyPlayerCount': '0x9b2c0a37', // keccak256('weeklyPlayerCount(uint256)')
      'getDailyJackpot': '0x12345678', // placeholder
      'getWeeklyJackpot': '0x87654321', // placeholder
      'getCurrentEntryFee': '0xabcdef12', // placeholder
      'getVMFPrice': '0xfedcba98', // placeholder
      'enterDailyGame': '0x11223344', // placeholder
      'createReferralCode': '0x55667788', // placeholder
      'awardStreakBonus': '0x99aabbcc', // placeholder
    }
    
    const selector = functionSelectors[functionName]
    if (!selector) {
      console.error(`Unknown function: ${functionName}`)
      return '0x'
    }
    
    // For functions with parameters, append the encoded parameters
    if (params.length > 0) {
      return selector + params.join('')
    }
    
    return selector
  }

  // Encode function call with specific ABI
  private encodeFunctionCallWithABI(functionName: string, params: any[], abi: any[]): string {
    const functionAbi = abi.find(item => item.name === functionName && item.type === 'function')
    if (!functionAbi) {
      throw new Error(`Function ${functionName} not found in ABI`)
    }
    
    const functionSignature = `${functionName}(${functionAbi.inputs.map((input: any) => input.type).join(',')})`
    const functionSelector = this.keccak256(functionSignature).slice(0, 10)
    
    const encodedParams = params.map((param, index) => {
      const inputType = functionAbi.inputs[index].type
      if (inputType === 'address') {
        return param.slice(2).padStart(64, '0')
      } else if (inputType === 'uint256') {
        if (typeof param === 'string' && param.startsWith('0x')) {
          return param.slice(2).padStart(64, '0')
        }
        return BigInt(param).toString(16).padStart(64, '0')
      }
      return param.toString(16).padStart(64, '0')
    }).join('')
    
    return `0x${functionSelector}${encodedParams}`
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

  /**
   * Get regular gas estimates for all game actions
   */
  private async getRegularGasEstimates(): Promise<{
    enterDailyGame: string;
    claimToppings: string;
    addJackpotEntry: string;
  }> {
    try {
      // Default gas estimates for regular transactions
      return {
        enterDailyGame: '100000', // 100k gas
        claimToppings: '80000',   // 80k gas
        addJackpotEntry: '120000', // 120k gas
      };
    } catch (error) {
      console.error('❌ Failed to get regular gas estimates:', error);
      return {
        enterDailyGame: '100000',
        claimToppings: '80000',
        addJackpotEntry: '120000',
      };
    }
  }

  /**
   * Get gas estimates for all game actions
   */
  async getGasEstimates(): Promise<{
    regular: {
      enterDailyGame: string;
      claimToppings: string;
      addJackpotEntry: string;
    };
    gasless: {
      enterDailyGame: string;
      claimToppings: string;
      addJackpotEntry: string;
    };
  }> {
    try {
      // Get regular gas estimates
      const regularEstimates = await this.getRegularGasEstimates();

      // Get gasless gas estimates
      let gaslessEstimates = {
        enterDailyGame: '0',
        claimToppings: '0',
        addJackpotEntry: '0',
      };

      if (this.gaslessService) {
        try {
          gaslessEstimates = await this.gaslessService.getGasEstimates();
        } catch (error) {
          console.log('⚠️ Could not get gasless estimates:', error);
        }
      }

      return {
        regular: regularEstimates,
        gasless: gaslessEstimates,
      };
    } catch (error) {
      console.error('❌ Failed to get gas estimates:', error);
      throw error;
    }
  }

  /**
   * Check if gasless transactions are available
   */
  async isGaslessAvailable(): Promise<{
    available: boolean;
    reason?: string;
  }> {
    if (!this.gaslessService) {
      return {
        available: false,
        reason: 'Gasless service not initialized',
      };
    }

    const gaslessCheck = await this.gaslessService.canPerformGasless();
    return {
      available: gaslessCheck.supported,
      reason: gaslessCheck.reason,
    };
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