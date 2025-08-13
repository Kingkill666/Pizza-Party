# Chainlink VRF Integration for Pizza Party

## Overview

This document describes the integration of Chainlink VRF (Verifiable Random Function) v2.5 into the Pizza Party game for truly random winner selection. The integration uses the **subscription method** as recommended by Chainlink for cost-effective and reliable randomness.

## 🔗 What is Chainlink VRF?

Chainlink VRF is a provably fair and verifiable random number generator that enables smart contracts to access random values without compromising security or usability. For each request, Chainlink VRF generates one or more random values and cryptographic proof of how those values were determined.

### Key Benefits:
- **Provably Fair**: Cryptographic proof of randomness
- **Tamper-Proof**: Cannot be manipulated by miners, users, or developers
- **On-Chain Verification**: Proof is published and verified on-chain
- **Cost-Effective**: Subscription method reduces gas costs
- **Reliable**: Backed by Chainlink's decentralized oracle network

## 🏗️ Architecture

### Contracts

1. **PizzaPartyCore.sol** - Main game contract with VRF integration
2. **ChainlinkVRF.sol** - VRF coordinator and winner selection
3. **IPizzaParty.sol** - Interface for contract integration

### Flow Diagram

```
PizzaPartyCore Contract
        ↓
   Request VRF
        ↓
ChainlinkVRF Contract
        ↓
   VRF Coordinator
        ↓
   Random Words
        ↓
   Winner Selection
        ↓
   Prize Distribution
```

## 📋 Implementation Details

### Winner Selection Process

1. **Daily Winners (8 winners)**:
   - System automatically detects daily game end (12pm PST)
   - VRF contract requests randomness from Chainlink
   - Random words are generated and verified
   - Winners are selected using random words
   - Prizes are automatically distributed

2. **Weekly Winners (10 winners)**:
   - System automatically detects weekly game end (Monday 12pm PST)
   - Same process as daily winners
   - Larger jackpot distribution based on toppings

### Key Functions

#### PizzaPartyCore Contract
- `enterDailyGame(address referrer)` - Enter daily game with optional referral
- `processDailyWinners(uint256[] memory randomWords)` - Process VRF-selected daily winners
- `processWeeklyWinners(uint256[] memory randomWords)` - Process VRF-selected weekly winners
- `getWeeklyJackpot()` - Get weekly jackpot amount (toppings × 1 VMF)

#### ChainlinkVRF Contract
- `requestDailyRandomness()` - Request randomness for daily draw
- `requestWeeklyRandomness()` - Request randomness for weekly draw
- `fulfillRandomWords()` - Callback function for VRF results
- `_selectWinners()` - Select winners using random words

## 🚀 Deployment Guide

### Prerequisites

1. **Chainlink VRF Subscription**:
   - Visit [VRF.Chain.link](https://vrf.chain.link/)
   - Create a new subscription
   - Fund it with LINK tokens
   - Note your subscription ID

2. **Network Configuration**:
   - Base Sepolia (Testnet)
   - Base Mainnet (Production)

### Deployment Steps

1. **Install Dependencies**:
   ```bash
   npm install @chainlink/contracts
   ```

2. **Update Configuration**:
   ```typescript
   // scripts/deploy.ts
   const VRF_COORDINATOR = "0x41034678D6C633D8a95c75e1138A360a28bBc9dB"; // Base Mainnet
   const SUBSCRIPTION_ID = YOUR_SUBSCRIPTION_ID;
   const KEY_HASH = "0x08ba8f62ff6c40a58877a106147661db43bc58dab9e9e1daedc0b61041f4c803";
   ```

3. **Deploy Contracts**:
   ```bash
   npx hardhat run scripts/deploy.ts --network base
   ```

4. **Link Contracts**:
   - VRF contract automatically links to PizzaPartyCore
   - Verify the connection

### Configuration Values

#### Base Sepolia (Testnet)
- **VRF Coordinator**: `0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed`
- **Key Hash**: `0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f`
- **Gas Limit**: `500000`
- **Confirmations**: `3`

#### Base Mainnet (Production)
- **VRF Coordinator**: `0x41034678D6C633D8a95c75e1138A360a28bBc9dB`
- **Key Hash**: `0x08ba8f62ff6c40a58877a106147661db43bc58dab9e9e1daedc0b61041f4c803`
- **Gas Limit**: `500000`
- **Confirmations**: `3`

## 💰 Cost Analysis

### Subscription Method Benefits
- **Reduced Gas Costs**: No upfront payment per request
- **Batch Processing**: Multiple requests from one subscription
- **Predictable Costs**: Fixed monthly subscription fee
- **No Refunds**: No overpayment issues

### Estimated Costs (Base Mainnet)
- **Subscription Fee**: ~$10-20/month
- **Per Request**: ~0.1 LINK
- **Daily Draws**: ~$3/month
- **Weekly Draws**: ~$1/month
- **Total**: ~$15-25/month

## 🔧 Usage Examples

### Enter Daily Game
```solidity
// Players enter the daily game
function enterDailyGame(address referrer) external payable whenNotPaused {
    require(msg.value >= getCurrentEntryFee(), "Insufficient entry fee");
    require(!hasEnteredToday(msg.sender), "Already entered today");
    
    // Process referral if provided
    if (referrer != address(0) && referrer != msg.sender) {
        _processReferral(msg.sender, referrer);
    }
    
    // Award toppings for daily play
    _awardToppings(msg.sender, 1, "Daily play");
    
    // Add to daily jackpot
    currentDailyJackpot += msg.value;
    
    emit PlayerEntered(msg.sender, msg.value, referrer);
}
```

### Process Winners (Automatic)
```solidity
// Called by VRF contract after randomness is generated
function processDailyWinners(uint256[] memory randomWords) external {
    require(msg.sender == address(vrfContract), "Only VRF contract can call this");
    
    address[] memory winners = _selectWinners(DAILY_WINNERS_COUNT, randomWords);
    uint256 prizePerWinner = currentDailyJackpot / DAILY_WINNERS_COUNT;
    
    for (uint256 i = 0; i < winners.length; i++) {
        if (winners[i] != address(0)) {
            vmfToken.transfer(winners[i], prizePerWinner);
            // Award bonus toppings to winners
            _awardToppings(winners[i], 5, "Daily winner bonus");
        }
    }
    
    emit DailyWinnersSelected(winners, currentDailyJackpot);
    _startNewDailyGame();
}
```

### Weekly Jackpot Calculation
```solidity
/**
 * @dev Get weekly jackpot amount - calculated from toppings
 * Weekly Jackpot = Total Toppings × 1 VMF per topping
 */
function getWeeklyJackpot() public view returns (uint256) {
    return weeklyToppingsPool * VMF_PER_TOPPING;
}
```

## 🛡️ Security Features

### Access Control
- **VRF Contract**: Only VRF contract can process winners
- **Owner Controls**: Owner can update VRF configuration
- **Pausable**: Emergency pause functionality

### Verification
- **On-Chain Proof**: Randomness is verified on-chain
- **Tamper-Proof**: Cannot be manipulated by any single entity
- **Transparent**: All randomness requests are public

### Fallback
- **Emergency Pause**: Can pause VRF requests if issues arise
- **Manual Override**: Owner can manually process winners if needed

## 📊 Monitoring & Analytics

### Events to Track
- `PlayerEntered` - When players enter the game
- `DailyWinnersSelected` - Daily winner distribution
- `WeeklyWinnersSelected` - Weekly winner distribution
- `JackpotUpdated` - When jackpot amounts change
- `ToppingsAwarded` - When players earn toppings
- `ReferralRegistered` - When referrals are processed

### Key Metrics
- **Request Success Rate**: Percentage of successful VRF requests
- **Response Time**: Time from request to fulfillment
- **Gas Costs**: Average gas cost per request
- **Winner Distribution**: Fairness verification
- **Toppings Earned**: Total toppings claimed by players

## 🔄 Topping System Integration

### Topping Earning Mechanisms
1. **Daily Play**: 1 topping per game entry
2. **Referrals**: 2 toppings per successful referral (max 3 referrals)
3. **VMF Holdings**: 3 toppings per 10 VMF held (checked daily)
4. **Winner Bonuses**: 5 bonus toppings for daily winners

### Weekly Jackpot Calculation
- **Formula**: Total toppings claimed × 1 VMF per topping
- **Distribution**: 10 random weekly winners
- **Automation**: Fully automated selection and payout

## 🚨 Troubleshooting

### Common Issues

1. **Subscription Not Funded**:
   - Error: "Insufficient subscription balance"
   - Solution: Fund subscription with LINK tokens

2. **Invalid Subscription ID**:
   - Error: "Invalid subscription"
   - Solution: Verify subscription ID in deployment

3. **Gas Limit Too Low**:
   - Error: "Callback gas limit exceeded"
   - Solution: Increase callback gas limit

4. **No Eligible Players**:
   - Error: "No eligible players for draw"
   - Solution: Ensure players have entered the game

### Emergency Procedures

1. **Pause Game**:
   ```solidity
   function pause() external onlyOwner {
       _pause();
   }
   ```

2. **Emergency Withdraw**:
   ```solidity
   function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
       IERC20(token).transfer(owner(), amount);
   }
   ```

## 📚 Additional Resources

- [Chainlink VRF Documentation](https://docs.chain.link/vrf)
- [VRF Subscription Guide](https://docs.chain.link/vrf/v2-5/subscription)
- [Base Network Documentation](https://docs.base.org/)
- [Chainlink VRF Calculator](https://vrf.chain.link/)

## 🤝 Support

For technical support or questions about the VRF integration:
- Check the troubleshooting section above
- Review Chainlink VRF documentation
- Contact the development team

---

**Note**: This integration ensures truly random and provably fair winner selection for the Pizza Party game, enhancing trust and transparency for all players.
