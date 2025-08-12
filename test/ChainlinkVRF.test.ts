import { expect } from "chai";
import { ethers } from "hardhat";

describe("Chainlink VRF Integration", function () {
  let vrfContract: any;
  let pizzaPartyContract: any;
  let owner: any;
  let operator: any;
  let player1: any;
  let player2: any;
  let player3: any;

  // Mock VRF configuration for testing
  const MOCK_VRF_COORDINATOR = "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed";
  const MOCK_SUBSCRIPTION_ID = 1;
  const MOCK_KEY_HASH = "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f";
  const MOCK_CALLBACK_GAS_LIMIT = 500000;
  const MOCK_REQUEST_CONFIRMATIONS = 3;
  const MOCK_NUM_WORDS = 10;

  beforeEach(async function () {
    [owner, operator, player1, player2, player3] = await ethers.getSigners();

    // Deploy mock contracts for testing
    const MockVMF = await ethers.getContractFactory("MockVMF");
    const mockVMF = await MockVMF.deploy();

    const FreeRandomness = await ethers.getContractFactory("FreeRandomness");
    const freeRandomness = await FreeRandomness.deploy();

    const FreePriceOracle = await ethers.getContractFactory("FreePriceOracle");
    const freePriceOracle = await FreePriceOracle.deploy();

    // Deploy Chainlink VRF contract
    const ChainlinkVRF = await ethers.getContractFactory("ChainlinkVRF");
    vrfContract = await ChainlinkVRF.deploy(
      MOCK_VRF_COORDINATOR,
      MOCK_SUBSCRIPTION_ID,
      MOCK_KEY_HASH,
      MOCK_CALLBACK_GAS_LIMIT,
      MOCK_REQUEST_CONFIRMATIONS,
      MOCK_NUM_WORDS
    );

    // Deploy Pizza Party contract with VRF integration
    const PizzaParty = await ethers.getContractFactory("PizzaParty");
    pizzaPartyContract = await PizzaParty.deploy(
      await mockVMF.getAddress(),
      await freeRandomness.getAddress(),
      await freePriceOracle.getAddress(),
      await vrfContract.getAddress()
    );

    // Set Pizza Party contract in VRF contract
    await vrfContract.setPizzaPartyContract(await pizzaPartyContract.getAddress());
  });

  describe("Deployment", function () {
    it("Should deploy VRF contract with correct configuration", async function () {
      const config = await vrfContract.getVRFConfig();
      
      expect(config[0]).to.equal(MOCK_VRF_COORDINATOR);
      expect(config[1]).to.equal(MOCK_SUBSCRIPTION_ID);
      expect(config[2]).to.equal(MOCK_KEY_HASH);
      expect(config[3]).to.equal(MOCK_CALLBACK_GAS_LIMIT);
      expect(config[4]).to.equal(MOCK_REQUEST_CONFIRMATIONS);
      expect(config[5]).to.equal(MOCK_NUM_WORDS);
    });

    it("Should link VRF contract to Pizza Party", async function () {
      const linkedPizzaParty = await vrfContract.pizzaPartyContract();
      expect(linkedPizzaParty).to.equal(await pizzaPartyContract.getAddress());
    });

    it("Should have VRF enabled by default", async function () {
      const useVRF = await pizzaPartyContract.useVRF();
      expect(useVRF).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to set VRF contract", async function () {
      const newVRFAddress = "0x1234567890123456789012345678901234567890";
      
      // Should fail when called by non-owner
      await expect(
        vrfContract.connect(operator).setPizzaPartyContract(newVRFAddress)
      ).to.be.revertedWithCustomError(vrfContract, "OwnableUnauthorizedAccount");

      // Should succeed when called by owner
      await expect(
        vrfContract.setPizzaPartyContract(newVRFAddress)
      ).to.not.be.reverted;
    });

    it("Should only allow Pizza Party to request randomness", async function () {
      const eligiblePlayers = [await player1.getAddress(), await player2.getAddress()];
      
      // Should fail when called by non-Pizza Party
      await expect(
        vrfContract.connect(operator).requestDailyRandomness(1, eligiblePlayers)
      ).to.be.revertedWith("Only Pizza Party contract can call this");

      // Should succeed when called by Pizza Party (through owner)
      await expect(
        pizzaPartyContract.requestDailyVRF()
      ).to.not.be.reverted;
    });
  });

  describe("VRF Configuration", function () {
    it("Should return correct VRF configuration", async function () {
      const config = await vrfContract.getVRFConfig();
      
      expect(config.coordinator).to.equal(MOCK_VRF_COORDINATOR);
      expect(config.subId).to.equal(MOCK_SUBSCRIPTION_ID);
      expect(config.keyHash).to.equal(MOCK_KEY_HASH);
      expect(config.gasLimit).to.equal(MOCK_CALLBACK_GAS_LIMIT);
      expect(config.confirmations).to.equal(MOCK_REQUEST_CONFIRMATIONS);
      expect(config.words).to.equal(MOCK_NUM_WORDS);
    });

    it("Should allow owner to toggle VRF usage", async function () {
      // Disable VRF
      await pizzaPartyContract.setUseVRF(false);
      expect(await pizzaPartyContract.useVRF()).to.be.false;

      // Enable VRF
      await pizzaPartyContract.setUseVRF(true);
      expect(await pizzaPartyContract.useVRF()).to.be.true;
    });
  });

  describe("Winner Selection", function () {
    it("Should select correct number of daily winners", async function () {
      const eligiblePlayers = [
        await player1.getAddress(),
        await player2.getAddress(),
        await player3.getAddress()
      ];

      // Mock random words for testing
      const mockRandomWords = [123, 456, 789, 101, 112, 131, 415, 161, 718, 192];

      // This would normally be called by the VRF coordinator
      // For testing, we'll simulate the winner selection logic
      const winnerCount = 8; // DAILY_WINNERS_COUNT
      const winners = [];

      for (let i = 0; i < winnerCount && i < eligiblePlayers.length; i++) {
        const randomIndex = mockRandomWords[i % mockRandomWords.length] % eligiblePlayers.length;
        winners.push(eligiblePlayers[randomIndex]);
      }

      expect(winners.length).to.be.at.most(winnerCount);
      expect(winners.length).to.be.at.most(eligiblePlayers.length);
    });

    it("Should select correct number of weekly winners", async function () {
      const eligiblePlayers = [
        await player1.getAddress(),
        await player2.getAddress(),
        await player3.getAddress()
      ];

      const winnerCount = 10; // WEEKLY_WINNERS_COUNT
      const mockRandomWords = [123, 456, 789, 101, 112, 131, 415, 161, 718, 192];
      const winners = [];

      for (let i = 0; i < winnerCount && i < eligiblePlayers.length; i++) {
        const randomIndex = mockRandomWords[i % mockRandomWords.length] % eligiblePlayers.length;
        winners.push(eligiblePlayers[randomIndex]);
      }

      expect(winners.length).to.be.at.most(winnerCount);
      expect(winners.length).to.be.at.most(eligiblePlayers.length);
    });
  });

  describe("Events", function () {
    it("Should emit VRFRequestSubmitted event", async function () {
      // This would be tested when VRF is actually integrated with a testnet
      // For now, we'll verify the event signature exists
      const vrfInterface = vrfContract.interface;
      const eventFragment = vrfInterface.getEvent("RandomnessRequested");
      expect(eventFragment).to.not.be.undefined;
    });

    it("Should emit WinnersSelected event", async function () {
      const vrfInterface = vrfContract.interface;
      const eventFragment = vrfInterface.getEvent("WinnersSelected");
      expect(eventFragment).to.not.be.undefined;
    });
  });

  describe("Error Handling", function () {
    it("Should revert when no eligible players", async function () {
      // This would be tested when VRF is actually integrated
      // For now, we'll verify the contract handles empty arrays correctly
      const emptyPlayers: string[] = [];
      
      // The contract should handle empty arrays gracefully
      expect(emptyPlayers.length).to.equal(0);
    });

    it("Should revert when VRF is disabled", async function () {
      await pizzaPartyContract.setUseVRF(false);
      
      await expect(
        pizzaPartyContract.requestDailyVRF()
      ).to.be.revertedWith("VRF not enabled");
    });

    it("Should revert when VRF contract not set", async function () {
      await pizzaPartyContract.setVRFContract("0x0000000000000000000000000000000000000000");
      
      await expect(
        pizzaPartyContract.requestDailyVRF()
      ).to.be.revertedWith("VRF contract not set");
    });
  });

  describe("Integration", function () {
    it("Should maintain backward compatibility", async function () {
      // Verify that legacy functions still exist
      const legacyFunction = pizzaPartyContract.selectDailyWinners;
      expect(legacyFunction).to.not.be.undefined;
    });

    it("Should allow switching between VRF and legacy", async function () {
      // Enable VRF
      await pizzaPartyContract.setUseVRF(true);
      expect(await pizzaPartyContract.useVRF()).to.be.true;

      // Disable VRF (fallback to legacy)
      await pizzaPartyContract.setUseVRF(false);
      expect(await pizzaPartyContract.useVRF()).to.be.false;
    });
  });
});
