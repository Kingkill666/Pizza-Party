import { ethers } from "hardhat";
import { config } from "dotenv";

config();

async function main() {
  console.log("🚀 Deploying Chainlink VRF Integration...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Chainlink VRF Configuration for Base Mainnet
  // Updated with your actual VRF subscription details
  const VRF_COORDINATOR = "0xd5d517abe5cf79b7e95ec98db0f0277788aff634"; // Your VRF Coordinator
  const SUBSCRIPTION_ID = 66063754969138181428436446139853957057923129391945579696602182296131592405980n; // Your Subscription ID
  const KEY_HASH = "0x08ba8f62ff6c40a58877a106147661db43bc58dab9e9e1daedc0b61041f4c803"; // Base Mainnet key hash
  const CALLBACK_GAS_LIMIT = 500000; // Gas limit for callback
  const REQUEST_CONFIRMATIONS = 3; // Number of confirmations
  const NUM_WORDS = 10; // Number of random words to request

  console.log("📋 VRF Configuration (Base Mainnet):");
  console.log("  Coordinator:", VRF_COORDINATOR);
  console.log("  Subscription ID:", SUBSCRIPTION_ID.toString());
  console.log("  Key Hash:", KEY_HASH);
  console.log("  Callback Gas Limit:", CALLBACK_GAS_LIMIT);
  console.log("  Request Confirmations:", REQUEST_CONFIRMATIONS);
  console.log("  Num Words:", NUM_WORDS);

  // Deploy Chainlink VRF contract
  console.log("\n🔧 Deploying ChainlinkVRF contract...");
  const ChainlinkVRF = await ethers.getContractFactory("ChainlinkVRF");
  const vrfContract = await ChainlinkVRF.deploy(
    VRF_COORDINATOR,
    SUBSCRIPTION_ID,
    KEY_HASH,
    CALLBACK_GAS_LIMIT,
    REQUEST_CONFIRMATIONS,
    NUM_WORDS
  );

  await vrfContract.waitForDeployment();
  const vrfAddress = await vrfContract.getAddress();
  console.log("✅ ChainlinkVRF deployed to:", vrfAddress);

  // Deploy Pizza Party contract with VRF integration
  console.log("\n🍕 Deploying PizzaParty contract with VRF integration...");
  
  // Get existing contract addresses (you'll need to update these)
  const VMF_TOKEN = "0x0000000000000000000000000000000000000000"; // Update with actual VMF token address
  const RANDOMNESS_CONTRACT = "0x0000000000000000000000000000000000000000"; // Update with existing randomness contract
  const PRICE_ORACLE = "0x0000000000000000000000000000000000000000"; // Update with existing price oracle

  const PizzaParty = await ethers.getContractFactory("PizzaParty");
  const pizzaParty = await PizzaParty.deploy(
    VMF_TOKEN,
    RANDOMNESS_CONTRACT,
    PRICE_ORACLE,
    vrfAddress // VRF contract address
  );

  await pizzaParty.waitForDeployment();
  const pizzaPartyAddress = await pizzaParty.getAddress();
  console.log("✅ PizzaParty deployed to:", pizzaPartyAddress);

  // Set Pizza Party contract address in VRF contract
  console.log("\n🔗 Linking VRF contract to Pizza Party...");
  const setPizzaPartyTx = await vrfContract.setPizzaPartyContract(pizzaPartyAddress);
  await setPizzaPartyTx.wait();
  console.log("✅ VRF contract linked to Pizza Party");

  // Verify the setup
  console.log("\n🔍 Verifying setup...");
  const linkedPizzaParty = await vrfContract.pizzaPartyContract();
  console.log("  VRF -> Pizza Party:", linkedPizzaParty);
  
  const vrfConfig = await vrfContract.getVRFConfig();
  console.log("  VRF Config:", {
    coordinator: vrfConfig[0],
    subscriptionId: vrfConfig[1],
    keyHash: vrfConfig[2],
    gasLimit: vrfConfig[3],
    confirmations: vrfConfig[4],
    words: vrfConfig[5]
  });

  console.log("\n🎉 Chainlink VRF Integration Deployment Complete!");
  console.log("\n📋 Deployment Summary:");
  console.log("  ChainlinkVRF:", vrfAddress);
  console.log("  PizzaParty:", pizzaPartyAddress);
  console.log("  VRF Coordinator:", VRF_COORDINATOR);
  console.log("  Subscription ID:", SUBSCRIPTION_ID);

  console.log("\n✅ VRF SUBSCRIPTION CONFIGURED!");
  console.log("  Your subscription is ready for deployment");
  console.log("  Make sure to fund your subscription with LINK tokens");
  console.log("  The VRF contract will be automatically added as a consumer");

  console.log("\n🔧 Usage:");
  console.log("  - Call requestDailyVRF() to request daily winner selection");
  console.log("  - Call requestWeeklyVRF() to request weekly winner selection");
  console.log("  - Winners will be automatically selected and prizes distributed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
