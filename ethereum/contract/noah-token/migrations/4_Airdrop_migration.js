const NoahToken = artifacts.require("NoahToken");
const Faucet = artifacts.require("Faucet");
const Airdrop = artifacts.require("Airdrop");
const fs = require("fs-extra");
const path = require("path");

module.exports = function (deployer) {
  deployer.deploy(NoahToken, 'noah', 'NOAH', 18, '1024000000000000000000').then(() => {
    return deployer.deploy(Faucet, NoahToken.address, 1);
  }).then(() => {
    return deployer.deploy(Airdrop, NoahToken.address);
  }).then(() => {
    updateEnvFile(
      NoahToken.address,
      Faucet.address,
      Airdrop.address
    );
    copyAbiFile();
  });
}

function copyAbiFile() {
  const srcPath = path.resolve(__dirname, `../build/contracts/`)
  const destPath = path.resolve(__dirname, `../../../frontend/abi/`)
  const res = fs.copySync(srcPath, destPath, {
    overwrite: true,
  })
}

function updateEnvFile(tokenAddress, faucetAddress, airdropAddress) {
  const envPath = path.resolve(__dirname, '../../../frontend/.env.local')
  const envFile = fs.readFileSync(envPath, 'utf-8')
  let env = envFile.toString()
  env = env.replace(/NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=.*\n/g,
    `NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${tokenAddress}\n`)
  env = env.replace(/NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS=.*\n/g,
    `NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS=${faucetAddress}\n`)
  env = env.replace(/NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS=.*\n/g,
    `NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS=${airdropAddress}\n`)
  fs.writeFileSync(envPath, env);
}
