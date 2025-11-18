const NoahToken = artifacts.require("NoahToken");

module.exports = function (deployer) {
  deployer.deploy(NoahToken, 'noah', 'NOAH', 18, '1024000000000000000000');
}