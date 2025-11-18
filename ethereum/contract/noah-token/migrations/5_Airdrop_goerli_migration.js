const NoahToken = artifacts.require("NoahToken");
const Airdrop = artifacts.require("Airdrop");

module.exports = function (deployer) {
  deployer.deploy(Airdrop, process.env.NOAH_TOKEN_CONTRACT_ADDRESS);
}
