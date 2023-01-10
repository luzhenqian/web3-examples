const NoahNFT = artifacts.require("NoahNFT");
const { copyAbiFile, updateEnvFile } = require("../../utils/deploy");

module.exports = function (deployer) {
  deployer.deploy(NoahNFT, 'Noah', 'NOAH').then(() => {
    const { address } = NoahNFT;
    copyAbiFile('noah-nft');
    updateEnvFile('NFT_CONTRACT_ADDRESS', address);
  });
};
