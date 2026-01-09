// scripts/deploy-and-save.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MNEE Commerce contracts...");
  
  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deployer address: ${deployer.address}`);
  
  // Deploy MockMNEE
  console.log("📦 Deploying MockMNEE...");
  const MockMNEE = await hre.ethers.getContractFactory("MockMNEE");
  const mnee = await MockMNEE.deploy(hre.ethers.parseEther("1000000"));
  await mnee.waitForDeployment();
  const mneeAddress = await mnee.getAddress();
  console.log(`✅ MockMNEE deployed to: ${mneeAddress}`);
  
  // Deploy MNEECommerce
  console.log("🛒 Deploying MNEECommerce...");
  const MNEECommerce = await hre.ethers.getContractFactory("MNEECommerce");
  const commerce = await MNEECommerce.deploy(mneeAddress);
  await commerce.waitForDeployment();
  const commerceAddress = await commerce.getAddress();
  console.log(`✅ MNEECommerce deployed to: ${commerceAddress}`);
  
  // Save addresses to a JSON file in root directory
  const addresses = {
    MNEE: mneeAddress,
    Commerce: commerceAddress,
    chainId: 31337,
    timestamp: new Date().toISOString(),
    deployer: deployer.address
  };
  
  const addressesPath = path.join(__dirname, '..', 'contract-addresses.json');
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  
  console.log("\n📝 Addresses saved to: contract-addresses.json");
  console.log("================================================");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("================================================");
  console.log(`📊 MNEE Token: ${mneeAddress}`);
  console.log(`🛒 Commerce Contract: ${commerceAddress}`);
  console.log("================================================");
  
  return addresses;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});