import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { waffle } from 'hardhat'
import fs from 'fs'

const config: { [key: string]: { [key: string]: string } } = {
  mainnet: {
    WETH_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  rinkeby: {
    WETH_ADDRESS: '0xc778417e063141139fce010982780140aa0cd5ab',
  },
  hardhat: {
    // Note: This won't integrate, but will allow us to test deploys.
    WETH_ADDRESS: '0xc778417e063141139fce010982780140aa0cd5ab',
  },
}

const NETWORK_MAP: { [key: string]: string } = {
  '1': 'mainnet',
  '4': 'rinkeby',
  '1337': 'hardhat',
  '31337': 'hardhat',
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const chainId = (await waffle.provider.getNetwork()).chainId

  console.log({ chainId }) // eslint-disable-line no-console
  const networkName = NETWORK_MAP[chainId]
  console.log(`Deploying to ${networkName}`) // eslint-disable-line no-console

  const { WETH_ADDRESS } = config[networkName]

  const splitMain = await deploy('SplitMain', {
    from: deployer,
    args: [WETH_ADDRESS],
    log: true,
  })
  // await splitMain.deployed()

  const info = {
    Contracts: {
      SplitMain: splitMain.address,
    },
  }

  console.log(info) // eslint-disable-line no-console

  fs.writeFileSync(
    `${__dirname}/../networks/${networkName}.json`,
    JSON.stringify(info, null, 2),
  )
}

export default func
func.tags = ['SplitMain']
