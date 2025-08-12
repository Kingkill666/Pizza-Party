require('dotenv').config();
const { ethers } = require("ethers");

class ScheduledWinnerSelection {
  constructor() {
    this.vrfContract = null;
    this.provider = null;
    this.signer = null;
    this.VRF_ADDRESS = "0xCCa74Fb01e4aec664b8F57Db1Ce6b702AF8f5a59";
    this.isRunning = false;
    this.pendingRequests = new Map();
    this.lastDailyDraw = null;
    this.lastWeeklyDraw = null;
  }

  async initialize() {
    console.log("🕛 Initializing Scheduled Winner Selection System...");
    console.log("📅 Daily winners: 12pm PST every day");
    console.log("📅 Weekly winners: 12pm PST every Monday");
    
    // Check for required environment variables
    if (!process.env.BASE_RPC_URL) {
      throw new Error("BASE_RPC_URL environment variable is required");
    }
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY environment variable is required");
    }
    
    this.provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // VRF Contract ABI (minimal for our needs)
    const vrfABI = [
      "function requestDailyRandomness(uint256 gameId, address[] calldata eligiblePlayers) external returns (uint256 requestId)",
      "function requestWeeklyRandomness(uint256 gameId, address[] calldata eligiblePlayers) external returns (uint256 requestId)",
      "function getRequest(uint256 requestId) external view returns (tuple(uint256 gameId, string gameType, bool fulfilled, uint256[] randomWords, address[] eligiblePlayers))",
      "function isRequestFulfilled(uint256 requestId) external view returns (bool)",
      "function getVRFConfig() external view returns (address, uint64, bytes32, uint32, uint16, uint32)",
      "event WinnersSelected(uint256 indexed gameId, string gameType, address[] winners, uint256[] randomWords)",
      "event RandomnessRequested(uint256 indexed requestId, uint256 indexed gameId, string gameType)"
    ];
    
    this.vrfContract = new ethers.Contract(this.VRF_ADDRESS, vrfABI, this.signer);

    console.log("✅ VRF Contract connected:", this.VRF_ADDRESS);
    console.log("✅ Provider connected to Base network");
    console.log("✅ Signer address:", this.signer.address);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    console.log("👂 Setting up event listeners...");
    
    // Listen for new randomness requests
    this.vrfContract.on("RandomnessRequested", (requestId, gameId, gameType) => {
      console.log(`🎲 New VRF request: ID ${requestId}, Game ${gameId}, Type: ${gameType}`);
      this.pendingRequests.set(requestId.toString(), {
        gameId: gameId.toString(),
        gameType: gameType,
        timestamp: Date.now(),
        status: 'pending'
      });
    });

    // Listen for winner selection
    this.vrfContract.on("WinnersSelected", (gameId, gameType, winners, randomWords) => {
      console.log(`🏆 Winners selected for ${gameType} game ${gameId}:`, winners);
      this.processWinners(gameId, gameType, winners, randomWords);
    });

    console.log("✅ Event listeners active");
  }

  // Convert PST to UTC for scheduling
  getPSTTime() {
    const now = new Date();
    const pstOffset = -8; // PST is UTC-8
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const pstTime = new Date(utcTime + (pstOffset * 3600000));
    return pstTime;
  }

  // Check if it's 12pm PST
  is12pmPST() {
    const pstTime = this.getPSTTime();
    return pstTime.getHours() === 12 && pstTime.getMinutes() === 0;
  }

  // Check if it's Monday 12pm PST
  isMonday12pmPST() {
    const pstTime = this.getPSTTime();
    return pstTime.getDay() === 1 && pstTime.getHours() === 12 && pstTime.getMinutes() === 0;
  }

  // Check if daily draw is ready (12pm PST every day)
  async isDailyDrawReady() {
    const pstTime = this.getPSTTime();
    const today = pstTime.toDateString();
    
    // Check if we already did today's draw
    if (this.lastDailyDraw === today) {
      return false;
    }
    
    // Check if it's 12pm PST
    if (pstTime.getHours() === 12 && pstTime.getMinutes() === 0) {
      console.log("📅 Daily draw time reached: 12pm PST");
      return true;
    }
    
    return false;
  }

  // Check if weekly draw is ready (12pm PST every Monday)
  async isWeeklyDrawReady() {
    const pstTime = this.getPSTTime();
    const today = pstTime.toDateString();
    
    // Check if we already did this week's draw
    if (this.lastWeeklyDraw === today) {
      return false;
    }
    
    // Check if it's Monday 12pm PST
    if (pstTime.getDay() === 1 && pstTime.getHours() === 12 && pstTime.getMinutes() === 0) {
      console.log("📅 Weekly draw time reached: Monday 12pm PST");
      return true;
    }
    
    return false;
  }

  async requestDailyWinners(gameId, eligiblePlayers) {
    console.log(`🎲 Requesting daily winners for game ${gameId} at 12pm PST...`);
    console.log(`📋 Eligible players: ${eligiblePlayers.length}`);
    
    try {
      const requestId = await this.vrfContract.requestDailyRandomness(gameId, eligiblePlayers);
      console.log(`✅ Daily VRF request submitted: ${requestId}`);
      
      // Start monitoring this request
      this.monitorRequest(requestId, 'daily', gameId);
      
      // Mark today's draw as completed
      this.lastDailyDraw = this.getPSTTime().toDateString();
      
      return requestId;
    } catch (error) {
      console.error("❌ Daily VRF request failed:", error.message);
      throw error;
    }
  }

  async requestWeeklyWinners(gameId, eligiblePlayers) {
    console.log(`🎲 Requesting weekly winners for game ${gameId} at Monday 12pm PST...`);
    console.log(`📋 Eligible players: ${eligiblePlayers.length}`);
    
    try {
      const requestId = await this.vrfContract.requestWeeklyRandomness(gameId, eligiblePlayers);
      console.log(`✅ Weekly VRF request submitted: ${requestId}`);
      
      // Start monitoring this request
      this.monitorRequest(requestId, 'weekly', gameId);
      
      // Mark this week's draw as completed
      this.lastWeeklyDraw = this.getPSTTime().toDateString();
      
      return requestId;
    } catch (error) {
      console.error("❌ Weekly VRF request failed:", error.message);
      throw error;
    }
  }

  async monitorRequest(requestId, gameType, gameId) {
    console.log(`⏳ Monitoring VRF request ${requestId} for ${gameType} game ${gameId}...`);
    
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
    const checkInterval = 10 * 1000; // 10 seconds
    const startTime = Date.now();
    
    const checkFulfillment = async () => {
      try {
        const isFulfilled = await this.vrfContract.isRequestFulfilled(requestId);
        
        if (isFulfilled) {
          console.log(`✅ VRF request ${requestId} fulfilled!`);
          await this.handleFulfilledRequest(requestId, gameType, gameId);
          return;
        }
        
        // Check if we've exceeded max wait time
        if (Date.now() - startTime > maxWaitTime) {
          console.log(`⏰ VRF request ${requestId} timed out after 5 minutes`);
          this.pendingRequests.delete(requestId.toString());
          return;
        }
        
        // Continue monitoring
        setTimeout(checkFulfillment, checkInterval);
        
      } catch (error) {
        console.error(`❌ Error monitoring request ${requestId}:`, error.message);
      }
    };
    
    // Start monitoring
    setTimeout(checkFulfillment, checkInterval);
  }

  async handleFulfilledRequest(requestId, gameType, gameId) {
    try {
      console.log(`📋 Getting winners for request ${requestId}...`);
      
      const request = await this.vrfContract.getRequest(requestId);
      
      if (request.fulfilled && request.winners.length > 0) {
        console.log(`🏆 Winners for ${gameType} game ${gameId}:`, request.winners);
        console.log(`🎲 Random words used:`, request.randomWords);
        
        // Process prizes for winners
        await this.processWinners(gameId, gameType, request.winners, request.randomWords);
        
        // Remove from pending requests
        this.pendingRequests.delete(requestId.toString());
        
      } else {
        console.log(`⚠️ Request ${requestId} fulfilled but no winners found`);
      }
      
    } catch (error) {
      console.error(`❌ Error handling fulfilled request ${requestId}:`, error.message);
    }
  }

  async processWinners(gameId, gameType, winners, randomWords) {
    console.log(`💰 Processing jackpot payments for ${gameType} winners...`);
    
    try {
      // Calculate jackpot amounts
      const jackpotPerWinner = await this.calculateJackpotAmount(gameId, gameType, winners.length);
      
      console.log(`💸 Jackpot per winner: ${ethers.formatEther(jackpotPerWinner)} ETH`);
      
      // Process each winner
      for (let i = 0; i < winners.length; i++) {
        const winner = winners[i];
        if (winner !== ethers.ZeroAddress) {
          console.log(`🏆 Winner ${i + 1}: ${winner}`);
          
          // Send jackpot payment to winner's wallet
          await this.sendJackpotPayment(winner, jackpotPerWinner, gameType, gameId);
        }
      }
      
      // Log the complete winner selection
      await this.logWinnerSelection(gameId, gameType, winners, randomWords, jackpotPerWinner);
      
      console.log(`✅ Jackpot payments complete for ${gameType} game ${gameId}`);
      
    } catch (error) {
      console.error(`❌ Error processing winners:`, error.message);
    }
  }

  async calculateJackpotAmount(gameId, gameType, winnerCount) {
    // This would integrate with your actual jackpot system
    // For now, using example jackpot amounts
    
    if (gameType === 'daily') {
      const dailyJackpot = ethers.parseEther("1.0"); // 1 ETH daily jackpot
      return dailyJackpot / BigInt(winnerCount);
    } else {
      const weeklyJackpot = ethers.parseEther("5.0"); // 5 ETH weekly jackpot
      return weeklyJackpot / BigInt(winnerCount);
    }
  }

  async sendJackpotPayment(winner, amount, gameType, gameId) {
    try {
      console.log(`💸 Sending ${ethers.formatEther(amount)} ETH jackpot to ${winner}`);
      
      // Send ETH payment to winner's wallet
      const tx = await this.signer.sendTransaction({
        to: winner,
        value: amount,
        gasLimit: 21000
      });
      
      console.log(`✅ Jackpot payment sent! Transaction: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Payment confirmed in block ${receipt.blockNumber}`);
      
      // Log the payment
      await this.logPayment(winner, amount, gameType, gameId, tx.hash);
      
    } catch (error) {
      console.error(`❌ Error sending jackpot payment to ${winner}:`, error.message);
      throw error;
    }
  }

  async logPayment(winner, amount, gameType, gameId, txHash) {
    const paymentLog = {
      timestamp: new Date().toISOString(),
      winner: winner,
      amount: ethers.formatEther(amount),
      gameType: gameType,
      gameId: gameId.toString(),
      transactionHash: txHash,
      status: 'completed'
    };
    
    // Save to file
    const fs = require('fs');
    const logFile = 'jackpot-payments.json';
    
    let payments = [];
    if (fs.existsSync(logFile)) {
      payments = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }
    
    payments.push(paymentLog);
    fs.writeFileSync(logFile, JSON.stringify(payments, null, 2));
    
    console.log(`📝 Jackpot payment logged to ${logFile}`);
  }

  async logWinnerSelection(gameId, gameType, winners, randomWords, jackpotPerWinner) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      gameId: gameId.toString(),
      gameType: gameType,
      winners: winners,
      randomWords: randomWords.map(w => w.toString()),
      jackpotPerWinner: ethers.formatEther(jackpotPerWinner),
      totalWinners: winners.length,
      drawTime: "12pm PST",
      drawDay: gameType === 'weekly' ? 'Monday' : 'Daily'
    };
    
    // Save to file
    const fs = require('fs');
    const logFile = 'scheduled-winner-selections.json';
    
    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }
    
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    
    console.log(`📝 Winner selection logged to ${logFile}`);
  }

  async getEligiblePlayers(gameId, gameType) {
    // This would integrate with your game logic to get actual eligible players
    console.log(`🔍 Getting eligible players for ${gameType} game ${gameId}...`);
    
    // Replace this with your actual logic to get eligible players
    const examplePlayers = [
      "0x1234567890123456789012345678901234567890",
      "0x2345678901234567890123456789012345678901",
      "0x3456789012345678901234567890123456789012",
      "0x4567890123456789012345678901234567890123",
      "0x5678901234567890123456789012345678901234"
    ];
    
    console.log(`📋 Found ${examplePlayers.length} eligible players`);
    return examplePlayers;
  }

  async startScheduledSelection() {
    if (this.isRunning) {
      console.log("⚠️ Scheduled selection already running");
      return;
    }
    
    this.isRunning = true;
    console.log("🕛 Starting scheduled winner selection system...");
    console.log("📅 Daily winners: 12pm PST every day");
    console.log("📅 Weekly winners: 12pm PST every Monday");
    
    // Run the scheduled process
    this.runScheduledProcess();
  }

  async runScheduledProcess() {
    while (this.isRunning) {
      try {
        const pstTime = this.getPSTTime();
        console.log(`\n🕛 Current PST time: ${pstTime.toLocaleString()}`);
        
        // Check if daily draw is ready (12pm PST every day)
        if (await this.isDailyDrawReady()) {
          console.log("📅 Daily draw time reached! Selecting winners...");
          const gameId = await this.getCurrentGameId();
          const eligiblePlayers = await this.getEligiblePlayers(gameId, 'daily');
          
          if (eligiblePlayers.length > 0) {
            await this.requestDailyWinners(gameId, eligiblePlayers);
          } else {
            console.log("⚠️ No eligible players for daily draw");
          }
        }
        
        // Check if weekly draw is ready (12pm PST every Monday)
        if (await this.isWeeklyDrawReady()) {
          console.log("📅 Weekly draw time reached! Selecting winners...");
          const gameId = await this.getCurrentGameId();
          const eligiblePlayers = await this.getEligiblePlayers(gameId, 'weekly');
          
          if (eligiblePlayers.length > 0) {
            await this.requestWeeklyWinners(gameId, eligiblePlayers);
          } else {
            console.log("⚠️ No eligible players for weekly draw");
          }
        }
        
        // Wait 1 minute before next check
        console.log("⏳ Waiting 1 minute before next check...");
        await new Promise(resolve => setTimeout(resolve, 60 * 1000));
        
      } catch (error) {
        console.error("❌ Error in scheduled process:", error.message);
        // Wait 5 minutes before retrying
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
      }
    }
  }

  async getCurrentGameId() {
    // This would integrate with your game logic
    return 1;
  }

  stop() {
    console.log("🛑 Stopping scheduled winner selection system...");
    this.isRunning = false;
  }

  getStatus() {
    const pstTime = this.getPSTTime();
    return {
      isRunning: this.isRunning,
      currentPSTTime: pstTime.toLocaleString(),
      lastDailyDraw: this.lastDailyDraw,
      lastWeeklyDraw: this.lastWeeklyDraw,
      pendingRequests: this.pendingRequests.size,
      vrfContract: this.VRF_ADDRESS,
      nextDailyDraw: "12pm PST tomorrow",
      nextWeeklyDraw: "12pm PST next Monday"
    };
  }
}

// Main execution
async function main() {
  console.log("🕛 Starting Scheduled VRF Winner Selection System...");
  console.log("📅 Daily winners: 12pm PST every day");
  console.log("📅 Weekly winners: 12pm PST every Monday");
  
  const scheduledSystem = new ScheduledWinnerSelection();
  
  try {
    await scheduledSystem.initialize();
    
    // Start the scheduled system
    await scheduledSystem.startScheduledSelection();
    
  } catch (error) {
    console.error("❌ Scheduled system failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = ScheduledWinnerSelection;
