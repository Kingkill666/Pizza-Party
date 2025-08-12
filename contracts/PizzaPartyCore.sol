// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./IPizzaParty.sol";

/**
 * @title PizzaPartyCore
 * @dev Core Pizza Party game contract with essential functionality only
 * This is a simplified version to stay under the 24,576 byte limit
 */
contract PizzaPartyCore is ReentrancyGuard, Ownable, Pausable, IPizzaParty {
    
    // VMF Token contract
    IERC20 public immutable vmfToken;
    
    // Game constants
    uint256 public constant DAILY_WINNERS_COUNT = 8;
    uint256 public constant WEEKLY_WINNERS_COUNT = 10;
    uint256 public constant DAILY_PLAY_REWARD = 1; // 1 topping per day
    uint256 public constant MAX_DAILY_ENTRIES = 10;
    uint256 public constant ENTRY_COOLDOWN = 1 hours;
    uint256 public constant MIN_VMF_REQUIRED = 100 * 10**18; // 100 VMF minimum
    
    // Game state
    uint256 private _gameId;
    uint256 public currentDailyJackpot;
    uint256 public currentWeeklyJackpot;
    uint256 public lastDailyDraw;
    uint256 public lastWeeklyDraw;
    
    // Player tracking
    mapping(uint256 => address[]) public dailyPlayers;
    mapping(uint256 => uint256) public dailyPlayerCount;
    mapping(uint256 => address[]) public weeklyPlayers;
    mapping(uint256 => uint256) public weeklyPlayerCount;
    
    // Player data
    struct Player {
        uint256 totalToppings;
        uint256 dailyEntries;
        uint256 weeklyEntries;
        uint256 lastEntryTime;
        uint256 vmfBalance;
        bool isBlacklisted;
    }
    
    // Mappings
    mapping(address => Player) public players;
    mapping(address => bool) public blacklistedAddresses;
    
    // Events
    event PlayerEntered(address indexed player, uint256 indexed gameId, uint256 amount);
    event JackpotUpdated(uint256 dailyJackpot, uint256 weeklyJackpot);
    event ToppingsAwarded(address indexed player, uint256 amount, string reason);
    event DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpot);
    event WeeklyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpot);
    event PlayerBlacklisted(address indexed player, bool blacklisted);
    
    // Modifiers
    modifier notBlacklisted(address player) {
        require(!blacklistedAddresses[player], "Player is blacklisted");
        require(!players[player].isBlacklisted, "Player is blacklisted");
        _;
    }
    
    modifier rateLimited() {
        require(block.timestamp >= players[msg.sender].lastEntryTime + ENTRY_COOLDOWN, "Rate limit exceeded");
        _;
    }
    
    constructor(address _vmfToken) Ownable(msg.sender) {
        require(_vmfToken != address(0), "Invalid VMF token address");
        vmfToken = IERC20(_vmfToken);
        
        // Initialize game state
        _gameId = 1;
        _startNewDailyGame();
    }
    
    /**
     * @dev Enter daily game
     */
    function enterDailyGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) rateLimited {
        // Check VMF balance
        uint256 vmfBalance = vmfToken.balanceOf(msg.sender);
        require(vmfBalance >= MIN_VMF_REQUIRED, "Insufficient VMF balance");
        
        // Check daily entry limit
        require(players[msg.sender].dailyEntries < MAX_DAILY_ENTRIES, "Max daily entries reached");
        
        // Update player data
        players[msg.sender].dailyEntries = players[msg.sender].dailyEntries + 1;
        players[msg.sender].lastEntryTime = block.timestamp;
        players[msg.sender].totalToppings = players[msg.sender].totalToppings + DAILY_PLAY_REWARD;
        players[msg.sender].vmfBalance = vmfBalance;
        
        // Add player to current game
        dailyPlayers[_gameId].push(msg.sender);
        dailyPlayerCount[_gameId] = dailyPlayerCount[_gameId] + 1;
        
        // Award toppings
        emit ToppingsAwarded(msg.sender, DAILY_PLAY_REWARD, "Daily play reward");
        
        // Emit events
        emit PlayerEntered(msg.sender, _gameId, 0);
        emit JackpotUpdated(currentDailyJackpot, currentWeeklyJackpot);
    }
    
    /**
     * @dev Process daily winners selected by VRF
     */
    function processDailyWinners(uint256 gameId, address[] calldata winners) external override {
        require(msg.sender == owner(), "Only owner can call this");
        require(winners.length > 0, "No winners provided");
        
        // Distribute jackpot to winners
        uint256 prizePerWinner = currentDailyJackpot / winners.length;
        
        for (uint256 i = 0; i < winners.length; i++) {
            if (winners[i] != address(0)) {
                // Transfer VMF tokens to winner
                require(vmfToken.transfer(winners[i], prizePerWinner), "Transfer failed");
                
                // Award toppings to winner
                players[winners[i]].totalToppings += 10; // Bonus toppings for winning
                emit ToppingsAwarded(winners[i], 10, "Daily winner bonus");
            }
        }
        
        emit DailyWinnersSelected(gameId, winners, currentDailyJackpot);
        
        // Reset for next game
        _startNewDailyGame();
    }
    
    /**
     * @dev Process weekly winners selected by VRF
     */
    function processWeeklyWinners(uint256 gameId, address[] calldata winners) external override {
        require(msg.sender == owner(), "Only owner can call this");
        require(winners.length > 0, "No winners provided");
        
        // Distribute jackpot to winners
        uint256 prizePerWinner = currentWeeklyJackpot / winners.length;
        
        for (uint256 i = 0; i < winners.length; i++) {
            if (winners[i] != address(0)) {
                // Transfer VMF tokens to winner
                require(vmfToken.transfer(winners[i], prizePerWinner), "VMF prize transfer failed");
            }
        }
        
        emit WeeklyWinnersSelected(gameId, winners, currentWeeklyJackpot);
        
        // Reset weekly jackpot and toppings
        _resetWeeklyGame();
    }
    
    /**
     * @dev Get eligible players for daily draw
     */
    function getEligibleDailyPlayers(uint256 gameId) external view override returns (address[] memory eligiblePlayers) {
        uint256 playerCount = dailyPlayerCount[gameId];
        eligiblePlayers = new address[](playerCount);
        
        for (uint256 i = 0; i < playerCount; i++) {
            eligiblePlayers[i] = dailyPlayers[gameId][i];
        }
        
        return eligiblePlayers;
    }
    
    /**
     * @dev Get eligible players for weekly draw
     */
    function getEligibleWeeklyPlayers(uint256 gameId) external view override returns (address[] memory eligiblePlayers) {
        uint256 playerCount = weeklyPlayerCount[gameId];
        eligiblePlayers = new address[](playerCount);
        
        for (uint256 i = 0; i < playerCount; i++) {
            eligiblePlayers[i] = weeklyPlayers[gameId][i];
        }
        
        return eligiblePlayers;
    }
    
    /**
     * @dev Get current game ID
     */
    function getCurrentGameId() external view override returns (uint256 gameId) {
        return _gameId;
    }
    
    /**
     * @dev Check if daily draw is ready
     */
    function isDailyDrawReady() external view override returns (bool ready) {
        return block.timestamp >= lastDailyDraw + 1 days;
    }
    
    /**
     * @dev Check if weekly draw is ready
     */
    function isWeeklyDrawReady() external view override returns (bool ready) {
        return block.timestamp >= lastWeeklyDraw + 7 days;
    }
    
    /**
     * @dev Get daily jackpot amount
     */
    function getDailyJackpot() external view returns (uint256) {
        return currentDailyJackpot;
    }
    
    /**
     * @dev Get weekly jackpot amount
     */
    function getWeeklyJackpot() external view returns (uint256) {
        return currentWeeklyJackpot;
    }
    
    /**
     * @dev Get player toppings
     */
    function getPlayerToppings(address player) external view returns (uint256) {
        return players[player].totalToppings;
    }
    
    /**
     * @dev Get total toppings claimed
     */
    function getTotalToppingsClaimed() external view returns (uint256) {
        // This would need to track total toppings across all players
        // For now, return a placeholder
        return 0;
    }
    
    /**
     * @dev Get player VMF balance
     */
    function getPlayerVMFBalance(address player) external view returns (uint256) {
        return players[player].vmfBalance;
    }
    
    /**
     * @dev Get minimum VMF required
     */
    function getMinimumVMFRequired() external view returns (uint256) {
        return MIN_VMF_REQUIRED;
    }
    
    /**
     * @dev Add to daily jackpot (for testing)
     */
    function addToDailyJackpot(uint256 amount) external onlyOwner {
        currentDailyJackpot += amount;
        emit JackpotUpdated(currentDailyJackpot, currentWeeklyJackpot);
    }
    
    /**
     * @dev Add to weekly jackpot (for testing)
     */
    function addToWeeklyJackpot(uint256 amount) external onlyOwner {
        currentWeeklyJackpot += amount;
        emit JackpotUpdated(currentDailyJackpot, currentWeeklyJackpot);
    }
    
    /**
     * @dev Blacklist/unblacklist player
     */
    function setPlayerBlacklist(address player, bool blacklisted) external onlyOwner {
        blacklistedAddresses[player] = blacklisted;
        players[player].isBlacklisted = blacklisted;
        emit PlayerBlacklisted(player, blacklisted);
    }
    
    /**
     * @dev Emergency pause/unpause
     */
    function emergencyPause(bool pause) external onlyOwner {
        if (pause) {
            _pause();
        } else {
            _unpause();
        }
    }
    
    /**
     * @dev Withdraw accumulated VMF (emergency only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = vmfToken.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        require(vmfToken.transfer(owner(), balance), "Withdrawal failed");
    }
    
    /**
     * @dev Get player info
     */
    function getPlayerInfo(address player) external view returns (Player memory) {
        return players[player];
    }
    
    /**
     * @dev Internal function to start new daily game
     */
    function _startNewDailyGame() internal {
        _gameId++;
        lastDailyDraw = block.timestamp;
    }
    
    /**
     * @dev Internal function to reset weekly game
     */
    function _resetWeeklyGame() internal {
        currentWeeklyJackpot = 0;
        lastWeeklyDraw = block.timestamp;
    }
}
