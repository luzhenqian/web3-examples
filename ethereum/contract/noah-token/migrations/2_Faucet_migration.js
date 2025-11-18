const NoahToken = artifacts.require("NoahToken");
const Faucet = artifacts.require("Faucet");

module.exports = function (deployer) {
  deployer.deploy(NoahToken, 'noah', 'NOAH', 18, '1024000000000000000000').then(function () {
    return deployer.deploy(Faucet, NoahToken.address, 1);
  });
}