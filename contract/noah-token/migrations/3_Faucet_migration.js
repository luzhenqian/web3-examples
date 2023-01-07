const NoahToken = artifacts.require("NoahToken");
const Faucet = artifacts.require("Faucet");

module.exports = function (deployer) {
  deployer.deploy(Faucet, process.env.NOAH_TOKEN_CONTRACT_ADDRESS, 1);
}
