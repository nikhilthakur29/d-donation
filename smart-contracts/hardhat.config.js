require('@nomiclabs/hardhat-waffle');

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.4',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/500553bcf26f4de1880333dfcce56107`,
      accounts: ['60418df4866c8ba3ff0fd8e8e37b5687acf399f7b650ed65c0ab51813cf840ea'],
    },
    // polygon: {
    //   url: 'https://polygon-rpc.com/',
    //   accounts: [process.env.pk],
    // },
  },
};
