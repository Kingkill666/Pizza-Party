const { ethers } = require("hardhat");

async function main() {
  console.log("🍕 Deploying PizzaParty contracts to Base Sepolia testnet...");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying from address:", await deployer.getAddress());

  // Deploy FreeRandomness contract first
  console.log("🎲 Deploying FreeRandomness contract...");
  const FreeRandomness = await ethers.getContractFactory("FreeRandomness");
  const freeRandomness = await FreeRandomness.deploy({
    gasLimit: 3000000,
    gasPrice: ethers.parseUnits("0.5", "gwei")
  });
  await freeRandomness.waitForDeployment();
  const randomnessAddress = await freeRandomness.getAddress();
  console.log("✅ FreeRandomness deployed at:", randomnessAddress);

  // Deploy FreePriceOracle contract
  console.log("💰 Deploying FreePriceOracle contract...");
  const FreePriceOracle = await ethers.getContractFactory("FreePriceOracle");
  const freePriceOracle = await FreePriceOracle.deploy({
    gasLimit: 3000000,
    gasPrice: ethers.parseUnits("0.5", "gwei")
  });
  await freePriceOracle.waitForDeployment();
  const priceOracleAddress = await freePriceOracle.getAddress();
  console.log("✅ FreePriceOracle deployed at:", priceOracleAddress);

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
        gasLimit: 10000000, // Increased to 10 million
        gasPrice: ethers.parseUnits("0.5", "gwei")
      }
    );

    console.log("📤 Transaction sent, waiting for deployment...");
    await pizzaParty.waitForDeployment();
    const contractAddress = await pizzaParty.getAddress();

    console.log("✅ PizzaParty deployed successfully!");
    console.log("📄 Contract Address:", contractAddress);
    console.log("🔗 Basescan URL:", `https://sepolia.basescan.org/address/${contractAddress}`);

    // Verify the contracts
    console.log("🔍 Verifying contracts...");
    
    try {
      // Verify FreeRandomness
      await hre.run("verify:verify", {
        address: randomnessAddress,
        constructorArguments: [],
      });
      console.log("✅ FreeRandomness verified on Basescan!");
    } catch (error) {
      console.log("⚠️ FreeRandomness verification failed:", error);
    }

    try {
      // Verify FreePriceOracle
      await hre.run("verify:verify", {
        address: priceOracleAddress,
        constructorArguments: [],
      });
      console.log("✅ FreePriceOracle verified on Basescan!");
    } catch (error) {
      console.log("⚠️ FreePriceOracle verification failed:", error);
    }

    try {
      // Verify PizzaParty
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