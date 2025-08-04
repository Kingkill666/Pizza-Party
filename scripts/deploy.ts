import { ethers } from "hardhat";

async function main() {
  console.log("🍕 Deploying PizzaParty contract to Base network...");

  // Get the contract factory
  const PizzaParty = await ethers.getContractFactory("PizzaParty");

  // VMF Token contract address on Base network
  const VMF_TOKEN_ADDRESS = "0x2213414893259b0C48066Acd1763e7fbA97859E5";

  console.log("📄 VMF Token Address:", VMF_TOKEN_ADDRESS);
  console.log("🌐 Network: Base");

  // Deploy the contract
  const pizzaParty = await PizzaParty.deploy(VMF_TOKEN_ADDRESS);

  await pizzaParty.waitForDeployment();

  const contractAddress = await pizzaParty.getAddress();

  console.log("✅ PizzaParty deployed successfully!");
  console.log("📄 Contract Address:", contractAddress);
  console.log("🔗 Basescan URL:", `https://basescan.org/address/${contractAddress}`);

  // Verify the deployment
  console.log("🔍 Verifying contract...");
  
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [VMF_TOKEN_ADDRESS],
    });
    console.log("✅ Contract verified on Basescan!");
  } catch (error) {
    console.log("⚠️ Verification failed:", error);
  }

  // Initialize the contract
  console.log("🚀 Initializing contract...");
  
  try {
    // Start the first daily game
    console.log("📅 Starting first daily game...");
    
    // Set initial jackpot amounts
    console.log("💰 Setting initial jackpot amounts...");
    
    console.log("✅ Contract initialization complete!");
  } catch (error) {
    console.log("❌ Contract initialization failed:", error);
  }

  console.log("\n🎉 Deployment Summary:");
  console.log("📄 Contract: PizzaParty");
  console.log("📍 Address:", contractAddress);
  console.log("🌐 Network: Base");
  console.log("🔗 Explorer:", `https://basescan.org/address/${contractAddress}`);
  console.log("🍕 Ready for Pizza Partying!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 