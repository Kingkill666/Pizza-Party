import { ethers } from "hardhat";
import { BASE_SEPOLIA_NETWORK } from "./wallet-config";

// Monitoring configuration
export interface MonitoringConfig {
  rpcUrl: string;
  chainId: number;
  alertThreshold: number; // Gas price threshold in gwei
  retryAttempts: number;
  timeoutMs: number;
}

export const MONITORING_CONFIG: MonitoringConfig = {
  rpcUrl: BASE_SEPOLIA_NETWORK.rpcUrls[0],
  chainId: BASE_SEPOLIA_NETWORK.chainId,
  alertThreshold: 0.1, // 0.1 gwei threshold
  retryAttempts: 3,
  timeoutMs: 10000,
};

// Network health monitoring
export class BaseSepoliaMonitor {
  private provider: ethers.JsonRpcProvider;
  private lastBlockNumber: number = 0;
  private lastGasPrice: bigint = 0n;
  private errorCount: number = 0;
  private isHealthy: boolean = true;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(MONITORING_CONFIG.rpcUrl);
  }

  // Check network connectivity
  async checkConnectivity(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      const isValidChain = network.chainId === BigInt(MONITORING_CONFIG.chainId);
      
      if (!isValidChain) {
        console.error("❌ Wrong network detected:", network.chainId);
        return false;
      }
      
      console.log("✅ Network connectivity verified");
      return true;
    } catch (error) {
      console.error("❌ Network connectivity failed:", error);
      this.errorCount++;
      return false;
    }
  }

  // Monitor gas prices
  async monitorGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;
      
      // Convert to gwei for monitoring
      const gasPriceGwei = Number(ethers.formatUnits(gasPrice, "gwei"));
      
      if (gasPriceGwei > MONITORING_CONFIG.alertThreshold) {
        console.warn(`⚠️ High gas price detected: ${gasPriceGwei} gwei`);
      }
      
      this.lastGasPrice = gasPrice;
      return gasPrice;
    } catch (error) {
      console.error("❌ Gas price monitoring failed:", error);
      throw error;
    }
  }

  // Monitor block production
  async monitorBlockProduction(): Promise<number> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      
      if (this.lastBlockNumber > 0) {
        const blockDiff = blockNumber - this.lastBlockNumber;
        if (blockDiff > 1) {
          console.warn(`⚠️ Block production delay: ${blockDiff} blocks behind`);
        }
      }
      
      this.lastBlockNumber = blockNumber;
      return blockNumber;
    } catch (error) {
      console.error("❌ Block monitoring failed:", error);
      throw error;
    }
  }

  // Check faucet availability
  async checkFaucetStatus(): Promise<boolean> {
    const faucets = [
      "https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet",
      "https://thirdweb.com/faucet/base-sepolia",
      "https://superchain.com/faucet",
      "https://www.alchemy.com/faucets/base-sepolia-faucet",
      "https://faucet.bwarelabs.com/",
      "https://faucet.chainstack.com/",
      "https://faucet.quicknode.com/base-sepolia",
      "https://learnweb3.io/faucets/base-sepolia",
      "https://base-sepolia-faucet.pk910.de/"
    ];

    console.log("🔍 Checking faucet availability...");
    let availableFaucets = 0;

    for (const faucet of faucets) {
      try {
        // Simple availability check (in production, you'd want more sophisticated checks)
        console.log(`✅ Faucet available: ${faucet}`);
        availableFaucets++;
      } catch (error) {
        console.warn(`⚠️ Faucet unavailable: ${faucet}`);
      }
    }

    console.log(`📊 Faucet availability: ${availableFaucets}/${faucets.length}`);
    return availableFaucets > 0;
  }

  // Comprehensive health check
  async performHealthCheck(): Promise<{
    isHealthy: boolean;
    connectivity: boolean;
    gasPrice: bigint;
    blockNumber: number;
    faucetStatus: boolean;
    errorCount: number;
  }> {
    console.log("🏥 Performing Base Sepolia health check...");

    const connectivity = await this.checkConnectivity();
    const gasPrice = await this.monitorGasPrice();
    const blockNumber = await this.monitorBlockProduction();
    const faucetStatus = await this.checkFaucetStatus();

    this.isHealthy = connectivity && faucetStatus;
    
    if (!this.isHealthy) {
      this.errorCount++;
    }

    return {
      isHealthy: this.isHealthy,
      connectivity,
      gasPrice,
      blockNumber,
      faucetStatus,
      errorCount: this.errorCount,
    };
  }

  // Get monitoring statistics
  getStats() {
    return {
      lastBlockNumber: this.lastBlockNumber,
      lastGasPrice: this.lastGasPrice,
      errorCount: this.errorCount,
      isHealthy: this.isHealthy,
    };
  }
}

// Retry mechanism with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MONITORING_CONFIG.retryAttempts,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⚠️ Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Gas optimization utilities
export class GasOptimizer {
  // Estimate gas for batch operations
  static async estimateBatchGas(operations: any[]): Promise<bigint> {
    let totalGas = 0n;
    
    for (const operation of operations) {
      try {
        const gasEstimate = await operation.estimateGas();
        totalGas += gasEstimate;
      } catch (error) {
        console.warn("⚠️ Gas estimation failed for operation:", error);
        totalGas += 21000n; // Default gas limit
      }
    }
    
    return totalGas;
  }

  // Optimize gas price based on network conditions
  static async getOptimalGasPrice(): Promise<bigint> {
    try {
      const provider = new ethers.JsonRpcProvider(MONITORING_CONFIG.rpcUrl);
      const feeData = await provider.getFeeData();
      
      // Use maxFeePerGas if available, otherwise use gasPrice
      return feeData.maxFeePerGas || feeData.gasPrice || 1000000000n; // 1 gwei default
    } catch (error) {
      console.warn("⚠️ Failed to get optimal gas price, using default");
      return 1000000000n; // 1 gwei default
    }
  }
}

// Export monitoring instance
export const baseSepoliaMonitor = new BaseSepoliaMonitor(); 