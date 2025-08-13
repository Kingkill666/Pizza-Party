# 🔍 Contract Verification Commands

## 🚀 Quick Verification (All Contracts)
```bash
npx hardhat run scripts/verify-all-contracts.js --network base
```

## 📋 Individual Contract Verification Commands

### 🍕 Core Contracts

#### PizzaPartyCore
```bash
npx hardhat verify --network base 0xCD8a3a397CdE223c47602d2C37a3b8a5B99a6460 "0x2213414893259b0C48066Acd1763e7fbA97859E5"
```

### 🔗 Advanced Modular Contracts

#### PizzaPartyReferral
```bash
npx hardhat verify --network base 0xb976e0400e88f78AA85029D138fFD11A65de9CE8 "0x2213414893259b0C48066Acd1763e7fbA97859E5"
```

#### PizzaPartyDynamicPricing
```bash
npx hardhat verify --network base 0x0F5a91907039eecebEA78ad2d327C7521d4F7892 "0x2213414893259b0C48066Acd1763e7fbA97859E5" "0xAA43fE819C0103fE820c04259929b3f344AfBfa3"
```

#### PizzaPartyLoyalty
```bash
npx hardhat verify --network base 0xC8a44e0587f7BeDa623b75DF5415E85Bf1163ac7 "0x2213414893259b0C48066Acd1763e7fbA97859E5"
```

#### PizzaPartyAdvancedRandomness
```bash
npx hardhat verify --network base 0xCcF33C77A65849e19Df6e66A9daEBC112D5BDBCE
```

#### PizzaPartyAnalytics
```bash
npx hardhat verify --network base 0xf32156203A70Bbf1e3db6C664F3F7eA8310a8841 "0x2213414893259b0C48066Acd1763e7fbA97859E5"
```

#### PizzaPartyWeeklyChallenges
```bash
npx hardhat verify --network base 0x87fee21FB855Ae44600B79b38709E4587f5b60CF "0x2213414893259b0C48066Acd1763e7fbA97859E5"
```

### 🔧 Legacy/Support Contracts

#### FreeRandomness
```bash
npx hardhat verify --network base 0xF64dF5C5c399c051210f02309A6cB12cB7797e88
```

#### FreePriceOracle
```bash
npx hardhat verify --network base 0xAA43fE819C0103fE820c04259929b3f344AfBfa3
```

#### UniswapPriceOracle
```bash
npx hardhat verify --network base 0xA5deaebA77225546dE3C363F695319356E33B7D6
```

#### SecureReferralSystem
```bash
npx hardhat verify --network base 0xDfFa13C23786ecf2Fc681e74e351b05c9C33f367 "0xF64dF5C5c399c051210f02309A6cB12cB7797e88"
```

#### ChainlinkVRF
```bash
npx hardhat verify --network base 0xefAe49039ADB963b1183869D1632D4CbC8F0603b "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed" "1" "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f" "2500000" "3" "1"
```

#### MockVMF
```bash
npx hardhat verify --network base 0x8349a17aa324628C5018fDF8aE24399Bb5EA7D8C
```

## 🔗 BaseScan Links After Verification

### 🍕 Core Contracts
- **PizzaPartyCore**: https://basescan.org/address/0xCD8a3a397CdE223c47602d2C37a3b8a5B99a6460#code

### 🔗 Advanced Modular Contracts
- **PizzaPartyReferral**: https://basescan.org/address/0xb976e0400e88f78AA85029D138fFD11A65de9CE8#code
- **PizzaPartyDynamicPricing**: https://basescan.org/address/0x0F5a91907039eecebEA78ad2d327C7521d4F7892#code
- **PizzaPartyLoyalty**: https://basescan.org/address/0xC8a44e0587f7BeDa623b75DF5415E85Bf1163ac7#code
- **PizzaPartyAdvancedRandomness**: https://basescan.org/address/0xCcF33C77A65849e19Df6e66A9daEBC112D5BDBCE#code
- **PizzaPartyAnalytics**: https://basescan.org/address/0xf32156203A70Bbf1e3db6C664F3F7eA8310a8841#code
- **PizzaPartyWeeklyChallenges**: https://basescan.org/address/0x87fee21FB855Ae44600B79b38709E4587f5b60CF#code

### 🔧 Legacy/Support Contracts
- **FreeRandomness**: https://basescan.org/address/0xF64dF5C5c399c051210f02309A6cB12cB7797e88#code
- **FreePriceOracle**: https://basescan.org/address/0xAA43fE819C0103fE820c04259929b3f344AfBfa3#code
- **UniswapPriceOracle**: https://basescan.org/address/0xA5deaebA77225546dE3C363F695319356E33B7D6#code
- **SecureReferralSystem**: https://basescan.org/address/0xDfFa13C23786ecf2Fc681e74e351b05c9C33f367#code
- **ChainlinkVRF**: https://basescan.org/address/0xefAe49039ADB963b1183869D1632D4CbC8F0603b#code
- **MockVMF**: https://basescan.org/address/0x8349a17aa324628C5018fDF8aE24399Bb5EA7D8C#code

## ⚠️ Important Notes

1. **Environment Variables**: Make sure you have `BASESCAN_API_KEY` set in your `.env` file
2. **Rate Limiting**: The script includes 2-second delays between verifications to avoid rate limiting
3. **Constructor Arguments**: All constructor arguments are properly formatted for verification
4. **Network**: All commands use the `base` network (Base mainnet)

## 🎯 Expected Results

After successful verification, all contracts will be publicly readable on BaseScan with:
- ✅ Source code visible
- ✅ Contract interactions available
- ✅ Transaction history accessible
- ✅ ABI available for integration
