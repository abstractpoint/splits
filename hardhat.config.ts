import { HardhatUserConfig } from 'hardhat/types'
import '@typechain/hardhat'
import '@typechain/ethers-v5'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-solhint'
import 'hardhat-deploy'
// import 'hardhat-deploy-ethers'

import 'tsconfig-paths/register'
// import 'dotenv/config'

// const { alchemyAPIKey, deployerPrivateKey } = require('./env.json')
// const alchemyAPIKey = process.env.ALCHEMY_API_KEY
// const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY

const config: HardhatUserConfig = {
  solidity: '0.8.4',
  // typechain: {
  //   outDir: 'src/types',
  //   target: 'ethers-v5',
  // },
  namedAccounts: {
    deployer: 0,
    tokenOwner: 1,
  },
  // networks: {
  //   rinkeby: {
  //     url: `http://eth-rinkeby.alchemyapi.io/v2/${alchemyAPIKey}`,
  //     accounts: [deployerPrivateKey],
  //   },
  //   mainnet: {
  //     url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyAPIKey}`,
  //     accounts: [deployerPrivateKey],
  //   },
  // },
}

export default config
