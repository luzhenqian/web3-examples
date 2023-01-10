const NoahNFT = artifacts.require("NoahNFT");

module.exports = function (deployer) {
  deployer.deploy(NoahNFT, 'Noah', 'NOAH');
};
