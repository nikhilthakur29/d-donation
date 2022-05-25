const { expect } = require('chai');
const { ethers } = require('hardhat');
const moment = require('moment');
describe('CampaignFactory', function () {
  it('Should create a new campaign', async function () {
    const CampaignFactory = await ethers.getContractFactory('CampaignFactory');
    const campaignFactory = await CampaignFactory.deploy();
    await campaignFactory.deployed();

    await campaignFactory.createCampaign(1, 1, 'Nitin', 'Desc', 'image', 10, "Nitin");

    const campaigns = await campaignFactory.getDeployedCampaigns();
    expect(campaigns.length).to.greaterThanOrEqual(1);
  });
});
describe('Campaign', function () {
  let owner;
  let CampaignFactory;
  let campaignFactory;
  let Campaign;
  const target = ethers.utils.parseUnits('10', 'ether');
  const minimum = ethers.utils.parseEther('1', 'ether');
  let campaigns;
  beforeEach(async () => {
    [owner] = await hre.ethers.getSigners();
    CampaignFactory = await ethers.getContractFactory('CampaignFactory');
    campaignFactory = await CampaignFactory.deploy();
    await campaignFactory.deployed();

    await campaignFactory.createCampaign(
      minimum,
      'School Fee',
      'Desc',
      'image',
      target,
      "Nitin"
    );

    campaigns = await campaignFactory.getDeployedCampaigns();
    expect(campaigns.length).to.greaterThanOrEqual(1);
    const newCamapinAddress = campaigns[0];
    Campaign = await hre.ethers.getContractAt('Campaign', newCamapinAddress);
  });
  it('Should be deployed', async function () {
    expect(owner.address).to.equal(await Campaign.manager());
    
    expect(await Campaign.minimumContribution()).to.equal(minimum);
    expect(await Campaign.target()).to.equal(target);
  });
  it('should call contribute with minimum amount', async () => {
    const prevBalance = await Campaign.getContractBalance();
    await Campaign.contribute({ value: minimum + 100 });
    expect(
      parseFloat(ethers.utils.formatEther(await Campaign.getContractBalance()))
    ).to.greaterThan(parseFloat(ethers.utils.formatEther(prevBalance)));
  });
  it('should not call contribute with less than minimum amount', async () => {
    const prevBalance = await Campaign.getContractBalance();
    try {
      await Campaign.contribute({ value: 100 });
    } catch (err) {
      expect(
        parseFloat(
          ethers.utils.formatEther(await Campaign.getContractBalance())
        )
      ).to.equal(parseFloat(ethers.utils.formatEther(prevBalance)));
    }
  });
});
