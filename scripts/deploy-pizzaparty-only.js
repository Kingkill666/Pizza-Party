const { ethers } = require("hardhat");

async function main() {
  console.log("🍕 Deploying PizzaParty contract to Base Sepolia testnet...");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying from address:", await deployer.getAddress());

  // Use the already deployed contract addresses
  const randomnessAddress = "0x3Cb2Bbd8E8bB540Af789E7aed7922f8340f640e5";
  const priceOracleAddress = "0x519f3E234F1E6728191eaBfF938C06b6BF980ccE";

  console.log("📄 Using FreeRandomness at:", randomnessAddress);
  console.log("📄 Using FreePriceOracle at:", priceOracleAddress);

  // Deploy PizzaParty contract with zero address for VMF token (Base Sepolia testing)
  console.log("🍕 Deploying PizzaParty contract...");
  const PizzaParty = await ethers.getContractFactory("PizzaParty");
  
  try {
    console.log("🔧 Constructor parameters:");
    console.log("  - VMF Token:", ethers.ZeroAddress);
    console.log("  - Randomness:", randomnessAddress);
    console.log("  - Price Oracle:", priceOracleAddress);
    
    const pizzaParty = await PizzaParty.deploy(
      ethers.ZeroAddress, // Zero address for VMF token in testnet
      randomnessAddress,
      priceOracleAddress,
      {
        gasLimit: 12000000, // Increased to 12 million
        gasPrice: ethers.parseUnits("1.0", "gwei") // Increased to 1 gwei
      }
    );

    console.log("📤 Transaction sent, waiting for deployment...");
    await pizzaParty.waitForDeployment();
    const contractAddress = await pizzaParty.getAddress();

    console.log("✅ PizzaParty deployed successfully!");
    console.log("📄 Contract Address:", contractAddress);
    console.log("🔗 Basescan URL:", `https://sepolia.basescan.org/address/${contractAddress}`);

    // Verify the contract
    console.log("🔍 Verifying PizzaParty contract...");
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [ethers.ZeroAddress, randomnessAddress, priceOracleAddress],
      });
      console.log("✅ PizzaParty verified on Basescan!");
    } catch (error) {
      console.log("⚠️ PizzaParty verification failed:", error);
    }

    console.log("\n🎉 Testnet Deployment Summary:");
    console.log("📄 FreeRandomness:", randomnessAddress);
    console.log("📄 FreePriceOracle:", priceOracleAddress);
    console.log("📄 PizzaParty:", contractAddress);
    console.log("🌐 Network: Base Sepolia Testnet");
    console.log("🔗 Explorer:", `https://sepolia.basescan.org/address/${contractAddress}`);
    console.log("🍕 Ready for Beta Testing!");
    
    console.log("\n📋 Next Steps:");
    console.log("1. Update .env with contract addresses");
    console.log("2. Test on Base Sepolia testnet");
    console.log("3. Get Base Sepolia ETH from faucets:");
    console.log("   - Chainlink: https://faucets.chain.link/base-sepolia");
    console.log("   - QuickNode: https://faucet.quicknode.com/base/sepolia");

  } catch (error) {
    console.error("❌ PizzaParty deployment failed:", error);
    console.log("📄 FreeRandomness:", randomnessAddress);
    console.log("📄 FreePriceOracle:", priceOracleAddress);
    console.log("🔍 Check the contract for issues or try with higher gas limit");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Testnet deployment failed:", error);
    process.exit(1);
  }); 