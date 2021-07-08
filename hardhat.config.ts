import { HardhatUserConfig } from 'hardhat/types'
import { task } from 'hardhat/config'
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

// TODO: use import & a tasks directory a la https://github.com/nomiclabs/hardhat-hackathon-boilerplate/blob/master/hardhat.config.js
task('faucet', 'Sends ETH and tokens to an address')
  .addParam('receiver', 'The address that will receive them')
  .setAction(async ({ receiver }: { receiver: string }, hre) => {
    if (hre.network.name === 'hardhat') {
      // eslint-disable-next-line no-console
      console.warn(
        'You are running the faucet task with Hardhat network, which' +
          'gets automatically created and destroyed every time. Use the Hardhat' +
          " option '--network localhost'",
      )
    }

    const [sender] = await hre.ethers.getSigners()

    // const tx = await hre.network.provider.send('hardhat_setBalance', [
    // await hre.network.provider.send('hardhat_setBalance', [
    //   receiver,
    //   hre.ethers.utils.parseEther('.01')._hex,
    // ])

    const tx = await sender.sendTransaction({
      to: receiver,
      value: hre.ethers.constants.WeiPerEther,
    })
    await tx.wait()

    // eslint-disable-next-line no-console
    console.log(`Transferred 1 ETH to ${receiver}`)
  })

task('reset', 'Reset the network').setAction(async (args, hre) => {
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [],
  })
  // eslint-disable-next-line no-console
  console.log('Network reset')
})

export default config
