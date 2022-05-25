
const hre = require("hardhat");
const fs = require('fs');
async function main() {

  // We get the contract to deploy
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const campaignFactory = await CampaignFactory.deploy();

  await campaignFactory.deployed();

  console.log("CampaignFactory deployed to:", campaignFactory.address);
      fs.writeFileSync('./config.js', `
      export const contractAddress = "${campaignFactory.address}"
      export const ownerAddress = "${campaignFactory.signer.address}"
  `)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
