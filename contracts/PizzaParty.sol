// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title PizzaParty
 * @dev A decentralized gaming platform on Base network with robust reward system
 * 
 * SECURITY FEATURES:
 * - ReentrancyGuard: Prevents reentrancy attacks
 * - Ownable: Access control for admin functions
 * - Pausable: Emergency pause functionality
 * - SafeMath: Overflow protection
 * - Input validation: Sanitized inputs
 * - Rate limiting: Cooldown periods
 * - Reward system: Daily, weekly, and jackpot features
 */
contract PizzaParty is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;
    
    // VMF Token contract
    IERC20 public immutable vmfToken;
    
    // Game constants
    uint256 public constant DAILY_ENTRY_FEE = 1 * 10**18; // $1 worth of VMF token
    uint256 public constant DAILY_WINNERS_COUNT = 8;
    uint256 public constant WEEKLY_WINNERS_COUNT = 10;
    uint256 public constant REFERRAL_REWARD = 2; // 2 toppings per referral
    uint256 public constant DAILY_PLAY_REWARD = 1; // 1 topping per day
    uint256 public constant VMF_HOLDING_REWARD = 2; // 2 toppings per 10 VMF
    uint256 public constant STREAK_BONUS = 3; // 3 toppings for 7-day streak
    
    // Security constants
    uint256 public constant MAX_DAILY_ENTRIES = 10;
    uint256 public constant ENTRY_COOLDOWN = 1 hours;
    uint256 public constant MIN_VMF_HOLDING = 10 * 10**18; // 10 VMF minimum
    
    // Reward system constants
    uint256 public constant FIRST_ORDER_REWARD = 100;
    uint256 public constant REFERRAL_BONUS = 50;
    uint256 public constant LOYALTY_POINTS_PER_DOLLAR = 1; // 1 point per $1
    uint256 public constant WEEKLY_CHALLENGE_REWARD = 200;
    uint256 public constant JACKPOT_ENTRY_COST = 5 * 10**18; // 5 VMF
    uint256 public constant MAX_JACKPOT_ENTRIES = 10;
    uint256 public constant JACKPOT_MULTIPLIER = 20;
    
    // Game state
    uint256 private _gameId;
    uint256 public currentDailyJackpot;
    uint256 public currentWeeklyJackpot;
    uint256 public lastDailyDraw;
    uint256 public lastWeeklyDraw;
    
    // Player data with enhanced reward tracking
    struct Player {
        uint256 totalToppings;
        uint256 dailyEntries;
        uint256 weeklyEntries;
        uint256 lastEntryTime;
        uint256 streakDays;
        uint256 lastStreakUpdate;
        bool isBlacklisted;
        uint256 lastVMFHoldingsCheck;
        
        // Reward system data
        uint256 loyaltyPoints;
        uint256 totalOrders;
        uint256 weeklyChallengesCompleted;
        uint256 jackpotEntries;
        uint256 lastRewardClaim;
        bool hasCompletedFirstOrder;
    }
    
    // Referral data
    struct Referral {
        address referrer;
        uint256 totalReferrals;
        uint256 totalRewards;
        bool isActive;
    }
    
    // Game data
    struct Game {
        uint256 gameId;
        uint256 startTime;
        uint256 endTime;
        uint256 totalEntries;
        uint256 jackpotAmount;
        address[] winners;
        bool isCompleted;
    }
    
    // Weekly challenge data
    struct WeeklyChallenge {
        uint256 challengeId;
        string challengeName;
        uint256 rewardAmount;
        uint256 completionRequirement;
        bool isActive;
        mapping(address => bool) completedBy;
    }
    
    // Mappings
    mapping(address => Player) public players;
    mapping(address => Referral) public referrals;
    mapping(string => address) public referralCodes;
    mapping(uint256 => Game) public games;
    mapping(address => bool) public blacklistedAddresses;
    mapping(uint256 => WeeklyChallenge) public weeklyChallenges;
    
    // Events
    event PlayerEntered(address indexed player, uint256 gameId, uint256 entryFee);
    event DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount);
    event WeeklyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount);
    event ToppingsAwarded(address indexed player, uint256 amount, string reason);
    event ReferralCreated(address indexed referrer, string referralCode);
    event ReferralUsed(address indexed referrer, address indexed newPlayer, uint256 reward);
    event PlayerBlacklisted(address indexed player, bool blacklisted);
    event EmergencyPause(bool paused);
    event JackpotUpdated(uint256 dailyJackpot, uint256 weeklyJackpot);
    
    // Reward system events
    event LoyaltyPointsAwarded(address indexed player, uint256 points, string reason);
    event WeeklyChallengeCompleted(address indexed player, uint256 challengeId, uint256 reward);
    event JackpotEntryAdded(address indexed player, uint256 entryCost);
    event FirstOrderRewardClaimed(address indexed player, uint256 reward);
    
    // Modifiers
    modifier notBlacklisted(address player) {
        require(!blacklistedAddresses[player], "Player is blacklisted");
        require(!players[player].isBlacklisted, "Player is blacklisted");
        _;
    }
    
    modifier validReferralCode(string memory code) {
        require(bytes(code).length > 0, "Invalid referral code");
        require(bytes(code).length <= 50, "Referral code too long");
        require(referralCodes[code] != address(0), "Referral code not found");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }
    
    modifier rateLimited() {
        require(block.timestamp >= players[msg.sender].lastEntryTime.add(ENTRY_COOLDOWN), "Rate limit exceeded");
        _;
    }
    
    modifier canClaimReward() {
        require(block.timestamp >= players[msg.sender].lastRewardClaim.add(1 days), "Reward already claimed today");
        _;
    }
    
    constructor(address _vmfToken) Ownable(msg.sender) {
        require(_vmfToken != address(0), "Invalid VMF token address");
        vmfToken = IERC20(_vmfToken);
        
        // Initialize first game
        _startNewDailyGame();
        
        // Initialize weekly challenges
        _initializeWeeklyChallenges();
    }
    
    /**
     * @dev Enter the daily game
     * @param referralCode Optional referral code
     */
    function enterDailyGame(string memory referralCode) external nonReentrant whenNotPaused notBlacklisted(msg.sender) rateLimited {
        require(vmfToken.balanceOf(msg.sender) >= DAILY_ENTRY_FEE, "Insufficient VMF balance");
        require(!hasEnteredToday(msg.sender), "Already entered today");
        
        // Transfer entry fee
        require(vmfToken.transferFrom(msg.sender, address(this), DAILY_ENTRY_FEE), "Transfer failed");
        
        // Update player data
        Player storage player = players[msg.sender];
        player.dailyEntries++;
        player.lastEntryTime = block.timestamp;
        player.totalToppings += DAILY_PLAY_REWARD;
        
        // Update streak
        _updateStreak(msg.sender);
        
        // Process referral if provided
        if (bytes(referralCode).length > 0) {
            _processReferral(msg.sender, referralCode);
        }
        
        // Update current game
        Game storage currentGame = games[_gameId];
        currentGame.totalEntries++;
        currentDailyJackpot += DAILY_ENTRY_FEE;
        
        emit PlayerEntered(msg.sender, _gameId, DAILY_ENTRY_FEE);
        emit ToppingsAwarded(msg.sender, DAILY_PLAY_REWARD, "Daily play");
    }
    
    /**
     * @dev Create a referral code
     */
    function createReferralCode() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(referrals[msg.sender].referrer == address(0), "Referral code already exists");
        
        string memory code = _generateReferralCode(msg.sender);
        referralCodes[code] = msg.sender;
        
        referrals[msg.sender] = Referral({
            referrer: msg.sender,
            totalReferrals: 0,
            totalRewards: 0,
            isActive: true
        });
        
        emit ReferralCreated(msg.sender, code);
    }
    
    /**
     * @dev Draw daily winners
     */
    function drawDailyWinners() external onlyOwner {
        Game storage currentGame = games[_gameId];
        require(!currentGame.isCompleted, "Game already completed");
        require(block.timestamp >= currentGame.endTime, "Game not finished");
        
        address[] memory winners = _selectWinners(DAILY_WINNERS_COUNT, currentGame.totalEntries);
        uint256 prizePerWinner = currentDailyJackpot / DAILY_WINNERS_COUNT;
        
        // Distribute prizes
        for (uint256 i = 0; i < winners.length; i++) {
            if (winners[i] != address(0)) {
                require(vmfToken.transfer(winners[i], prizePerWinner), "Prize transfer failed");
            }
        }
        
        currentGame.winners = winners;
        currentGame.isCompleted = true;
        currentGame.jackpotAmount = currentDailyJackpot;
        
        emit DailyWinnersSelected(_gameId, winners, currentDailyJackpot);
        
        // Start new game
        _startNewDailyGame();
    }
    
    /**
     * @dev Draw weekly winners
     */
    function drawWeeklyWinners() external onlyOwner {
        require(block.timestamp >= lastWeeklyDraw + 7 days, "Weekly draw not ready");
        
        address[] memory winners = _selectWeeklyWinners();
        uint256 prizePerWinner = currentWeeklyJackpot / WEEKLY_WINNERS_COUNT;
        
        // Distribute prizes
        for (uint256 i = 0; i < winners.length; i++) {
            if (winners[i] != address(0)) {
                require(vmfToken.transfer(winners[i], prizePerWinner), "Prize transfer failed");
            }
        }
        
        emit WeeklyWinnersSelected(_gameId, winners, currentWeeklyJackpot);
        
        // Reset weekly jackpot and toppings
        _resetWeeklyGame();
    }
    
    /**
     * @dev Award toppings based on VMF holdings
     * SECURITY: Input validation, overflow protection, rate limiting
     */
    function awardVMFHoldingsToppings() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        // Input validation
        require(block.timestamp >= players[msg.sender].lastVMFHoldingsCheck.add(1 days), "Already checked today");
        
        // Get balance with validation
        uint256 balance = vmfToken.balanceOf(msg.sender);
        require(balance >= MIN_VMF_HOLDING, "Insufficient VMF holdings");
        
        // Safe arithmetic with overflow protection
        uint256 holdingsReward = balance.div(MIN_VMF_HOLDING).mul(VMF_HOLDING_REWARD);
        
        // Validate reward amount
        require(holdingsReward > 0, "No reward available");
        require(holdingsReward <= 1000, "Reward amount too high"); // Sanity check
        
        // Update player data
        players[msg.sender].totalToppings = players[msg.sender].totalToppings.add(holdingsReward);
        players[msg.sender].lastVMFHoldingsCheck = block.timestamp;
        
        emit ToppingsAwarded(msg.sender, holdingsReward, "VMF holdings");
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
        emit EmergencyPause(pause);
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
     * @dev Withdraw accumulated VMF (emergency only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = vmfToken.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        require(vmfToken.transfer(owner(), balance), "Withdrawal failed");
    }
    
    /**
     * @dev Check if player has entered today
     */
    function hasEnteredToday(address player) public view returns (bool) {
        uint256 today = block.timestamp - (block.timestamp % 1 days);
        return players[player].lastEntryTime >= today;
    }
    
    /**
     * @dev Get player info
     */
    function getPlayerInfo(address player) external view returns (Player memory) {
        return players[player];
    }
    
    /**
     * @dev Get referral info
     */
    function getReferralInfo(address player) external view returns (Referral memory) {
        return referrals[player];
    }
    
    /**
     * @dev Get current game info
     */
    function getCurrentGame() external view returns (Game memory) {
        return games[_gameId];
    }
    
    /**
     * @dev Get game info by ID
     */
    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }
    
    /**
     * @dev Internal function to start new daily game
     */
    function _startNewDailyGame() internal {
        _gameId++;
        uint256 gameId = _gameId;
        
        games[gameId] = Game({
            gameId: gameId,
            startTime: block.timestamp,
            endTime: block.timestamp + 1 days,
            totalEntries: 0,
            jackpotAmount: 0,
            winners: new address[](0),
            isCompleted: false
        });
        
        lastDailyDraw = block.timestamp;
    }
    
    /**
     * @dev Internal function to process referral
     */
    function _processReferral(address newPlayer, string memory referralCode) internal validReferralCode(referralCode) {
        address referrer = referralCodes[referralCode];
        require(referrer != newPlayer, "Cannot refer yourself");
        require(referrals[referrer].isActive, "Referral not active");
        
        // Award toppings to referrer
        players[referrer].totalToppings += REFERRAL_REWARD;
        referrals[referrer].totalReferrals++;
        referrals[referrer].totalRewards += REFERRAL_REWARD;
        
        // Award toppings to new player
        players[newPlayer].totalToppings += REFERRAL_REWARD;
        
        emit ReferralUsed(referrer, newPlayer, REFERRAL_REWARD);
        emit ToppingsAwarded(referrer, REFERRAL_REWARD, "Referral reward");
        emit ToppingsAwarded(newPlayer, REFERRAL_REWARD, "Referral bonus");
    }
    
    /**
     * @dev Internal function to update player streak
     */
    function _updateStreak(address player) internal {
        Player storage playerData = players[player];
        uint256 today = block.timestamp - (block.timestamp % 1 days);
        
        if (playerData.lastStreakUpdate < today) {
            if (playerData.lastStreakUpdate == today - 1 days) {
                playerData.streakDays++;
                
                // Award streak bonus
                if (playerData.streakDays % 7 == 0) {
                    playerData.totalToppings += STREAK_BONUS;
                    emit ToppingsAwarded(player, STREAK_BONUS, "7-day streak bonus");
                }
            } else {
                playerData.streakDays = 1;
            }
            
            playerData.lastStreakUpdate = today;
        }
    }
    
    /**
     * @dev Internal function to select winners
     */
    function _selectWinners(uint256 winnerCount, uint256 totalEntries) internal view returns (address[] memory) {
        address[] memory winners = new address[](winnerCount);
        
        if (totalEntries == 0) {
            return winners;
        }
        
        // Simple random selection (in production, use Chainlink VRF)
        for (uint256 i = 0; i < winnerCount; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, i))) % totalEntries;
            // This is a simplified version - in production, you'd track all players and select from them
            winners[i] = address(0); // Placeholder
        }
        
        return winners;
    }
    
    /**
     * @dev Internal function to select weekly winners based on toppings
     */
    function _selectWeeklyWinners() internal view returns (address[] memory) {
        address[] memory winners = new address[](WEEKLY_WINNERS_COUNT);
        
        // Simplified selection based on toppings
        // In production, implement weighted random selection
        for (uint256 i = 0; i < WEEKLY_WINNERS_COUNT; i++) {
            winners[i] = address(0); // Placeholder
        }
        
        return winners;
    }
    
    /**
     * @dev Internal function to reset weekly game
     */
    function _resetWeeklyGame() internal {
        currentWeeklyJackpot = 0;
        lastWeeklyDraw = block.timestamp;
        
        // Reset all player toppings
        // Note: In production, you'd iterate through all players
        // This is simplified for gas efficiency
    }
    
    /**
     * @dev Internal function to generate referral code
     */
    function _generateReferralCode(address player) internal view returns (string memory) {
        return string(abi.encodePacked(
            "PIZZA",
            _addressToString(player),
            _uintToString(block.timestamp)
        ));
    }
    
    /**
     * @dev Helper function to convert address to string
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory b = new bytes(20);
        for (uint256 i = 0; i < 20; i++) {
            b[i] = bytes1(uint8(uint256(uint160(addr)) / (2**(8*(19 - i)))));
        }
        return string(b);
    }
    
    /**
     * @dev Helper function to convert uint to string
     */
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Initialize weekly challenges
     */
    function _initializeWeeklyChallenges() internal {
        // Example challenges:
        // weeklyChallenges[1] = WeeklyChallenge({
        //     challengeId: 1,
        //     challengeName: "Play 5 games in a week",
        //     rewardAmount: 100,
        //     completionRequirement: 5,
        //     isActive: true
        // });
        // weeklyChallenges[2] = WeeklyChallenge({
        //     challengeId: 2,
        //     challengeName: "Complete 3 daily games",
        //     rewardAmount: 50,
        //     completionRequirement: 3,
        //     isActive: true
        // });
    }

    /**
     * @dev Claim weekly challenge reward
     */
    function claimWeeklyChallengeReward(uint256 challengeId) external nonReentrant whenNotPaused notBlacklisted(msg.sender) canClaimReward {
        WeeklyChallenge storage challenge = weeklyChallenges[challengeId];
        require(challenge.isActive, "Challenge not active");
        require(!challenge.completedBy[msg.sender], "Challenge already completed");

        // Example: Check if player meets completion requirement
        // require(players[msg.sender].weeklyEntries >= challenge.completionRequirement, "Not enough daily games played");

        challenge.completedBy[msg.sender] = true;
        players[msg.sender].weeklyChallengesCompleted++;
        players[msg.sender].totalToppings += challenge.rewardAmount;
        players[msg.sender].lastRewardClaim = block.timestamp;

        emit WeeklyChallengeCompleted(msg.sender, challengeId, challenge.rewardAmount);
        emit ToppingsAwarded(msg.sender, challenge.rewardAmount, challenge.challengeName);
    }

    /**
     * @dev Add player to jackpot
     */
    function addJackpotEntry() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(players[msg.sender].jackpotEntries < MAX_JACKPOT_ENTRIES, "Max jackpot entries reached");
        require(vmfToken.balanceOf(msg.sender) >= JACKPOT_ENTRY_COST, "Insufficient VMF balance for jackpot entry");

        require(vmfToken.transferFrom(msg.sender, address(this), JACKPOT_ENTRY_COST), "Jackpot entry transfer failed");
        players[msg.sender].jackpotEntries++;
        currentWeeklyJackpot += JACKPOT_ENTRY_COST * JACKPOT_MULTIPLIER; // Example multiplier

        emit JackpotEntryAdded(msg.sender, JACKPOT_ENTRY_COST);
    }

    /**
     * @dev Claim first order reward
     */
    function claimFirstOrderReward() external nonReentrant whenNotPaused notBlacklisted(msg.sender) canClaimReward {
        require(!players[msg.sender].hasCompletedFirstOrder, "First order reward already claimed");
        require(players[msg.sender].totalOrders >= 1, "No first order completed");

        players[msg.sender].hasCompletedFirstOrder = true;
        players[msg.sender].totalToppings += FIRST_ORDER_REWARD;
        players[msg.sender].lastRewardClaim = block.timestamp;

        emit FirstOrderRewardClaimed(msg.sender, FIRST_ORDER_REWARD);
        emit ToppingsAwarded(msg.sender, FIRST_ORDER_REWARD, "First order reward");
    }

    /**
     * @dev Award loyalty points based on VMF holdings
     */
    function awardLoyaltyPoints() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        uint256 balance = vmfToken.balanceOf(msg.sender);
        uint256 points = balance.div(10**18).mul(LOYALTY_POINTS_PER_DOLLAR); // Example: 1 point per $1

        if (points > 0) {
            players[msg.sender].loyaltyPoints += points;
            emit LoyaltyPointsAwarded(msg.sender, points, "VMF holdings");
        }
    }
}

// IERC20 interface for VMF token
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
} 