import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contract-config';

export interface GameMetrics {
  currentPlayers: number;
  dailyJackpot: string;
  weeklyJackpot: string;
  totalToppings: number;
  recentWinners: Winner[];
  liveTransactions: Transaction[];
  gasSponsored: number;
  dailyEntries: number;
}

export interface Winner {
  address: string;
  name: string;
  avatar: string;
  amount: string;
  timestamp: number;
  type: 'daily' | 'weekly';
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'entry' | 'winner' | 'referral';
}

export class RealTimeMetricsService {
  private ws: WebSocket | null = null;
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private metrics: GameMetrics;
  private listeners: ((metrics: GameMetrics) => void)[] = [];

  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.PIZZA_PARTY_CORE,
      ['function getCurrentGameId() view returns (uint256)'],
      this.provider
    );
    
    this.metrics = {
      currentPlayers: 0,
      dailyJackpot: '0',
      weeklyJackpot: '0',
      totalToppings: 0,
      recentWinners: [],
      liveTransactions: [],
      gasSponsored: 0,
      dailyEntries: 0
    };
  }

  /**
   * Start real-time metrics monitoring
   */
  async startMonitoring() {
    // Initialize WebSocket connection
    this.connectWebSocket();
    
    // Start polling for contract updates
    this.startPolling();
    
    // Listen for new blocks
    this.listenForBlocks();
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  private connectWebSocket() {
    try {
      this.ws = new WebSocket('wss://base-mainnet.publicnode.com');
      
      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected for real-time metrics');
        this.subscribeToGameEvents();
      };
      
      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.reconnectWebSocket();
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(() => this.connectWebSocket(), 5000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  /**
   * Subscribe to game contract events
   */
  private subscribeToGameEvents() {
    if (!this.ws) return;
    
    const subscription = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_subscribe',
      params: [
        'logs',
        {
          address: CONTRACT_ADDRESSES.PIZZA_PARTY_CORE,
          topics: [
            // Game entry events
            '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Transfer
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'  // GameEntry
          ]
        }
      ]
    };
    
    this.ws.send(JSON.stringify(subscription));
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(data: string) {
    try {
      const message = JSON.parse(data);
      
      if (message.method === 'eth_subscription' && message.params?.subscription) {
        this.processGameEvent(message.params.result);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Process game events from WebSocket
   */
  private async processGameEvent(event: any) {
    // Update metrics based on event type
    await this.updateMetricsFromEvent(event);
    
    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Start polling for contract updates
   */
  private startPolling() {
    setInterval(async () => {
      await this.updateMetrics();
    }, 10000); // Update every 10 seconds
  }

  /**
   * Listen for new blocks
   */
  private listenForBlocks() {
    this.provider.on('block', async (blockNumber) => {
      await this.updateMetrics();
    });
  }

  /**
   * Update metrics from contract
   */
  private async updateMetrics() {
    try {
      const [
        currentGameId,
        dailyJackpot,
        weeklyJackpot,
        totalToppings,
        dailyPlayers
      ] = await Promise.all([
        this.contract.getCurrentGameId(),
        this.contract.getDailyJackpot(),
        this.contract.getWeeklyJackpot(),
        this.contract.getTotalToppingsClaimed(),
        this.contract.getDailyPlayers()
      ]);

      this.metrics = {
        ...this.metrics,
        currentPlayers: dailyPlayers.length,
        dailyJackpot: ethers.formatEther(dailyJackpot),
        weeklyJackpot: ethers.formatEther(weeklyJackpot),
        totalToppings: Number(totalToppings),
        dailyEntries: this.metrics.dailyEntries
      };

      this.notifyListeners();
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  /**
   * Update metrics from event
   */
  private async updateMetricsFromEvent(event: any) {
    // Parse event data and update metrics
    if (event.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
      // Game entry event
      this.metrics.dailyEntries++;
      this.metrics.currentPlayers++;
      
      // Add to live transactions
      this.metrics.liveTransactions.unshift({
        hash: event.transactionHash,
        from: event.address,
        to: CONTRACT_ADDRESSES.PIZZA_PARTY_CORE,
        value: '1 VMF',
        timestamp: Date.now(),
        type: 'entry'
      });
      
      // Keep only last 10 transactions
      if (this.metrics.liveTransactions.length > 10) {
        this.metrics.liveTransactions = this.metrics.liveTransactions.slice(0, 10);
      }
    }
  }

  /**
   * Add metrics listener
   */
  addListener(callback: (metrics: GameMetrics) => void) {
    this.listeners.push(callback);
  }

  /**
   * Remove metrics listener
   */
  removeListener(callback: (metrics: GameMetrics) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.metrics);
      } catch (error) {
        console.error('Error in metrics listener:', error);
      }
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): GameMetrics {
    return { ...this.metrics };
  }

  /**
   * Reconnect WebSocket
   */
  private reconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
    }
    setTimeout(() => this.connectWebSocket(), 5000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.provider.removeAllListeners();
  }
}

// Export singleton instance
export const realTimeMetrics = new RealTimeMetricsService();
