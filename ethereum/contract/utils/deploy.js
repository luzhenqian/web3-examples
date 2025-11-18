const fs = require("fs-extra");
const path = require("path");

function copyAbiFile(projectName) {
  const srcPath = path.resolve(__dirname, `../${projectName}/build/contracts/`)
  const destPath = path.resolve(__dirname, `../../frontend/abi/`)
  const res = fs.copySync(srcPath, destPath, {
    overwrite: true,
  })
}

function updateEnvFile(key, value) {
  const envPath = path.resolve(__dirname, '../../frontend/.env.local')
  const envFile = fs.readFileSync(envPath, 'utf-8')
  let env = envFile.toString()
  env = env.replace(new RegExp(`NEXT_PUBLIC_${key}=.*\n`, 'g'),
    `NEXT_PUBLIC_${key}=${value}\n`)
  fs.writeFileSync(envPath, env);
}

module.exports = {
  copyAbiFile,
  updateEnvFile,
}