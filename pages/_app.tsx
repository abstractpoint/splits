import * as React from 'react'
import 'tailwindcss/tailwind.css'
import 'styles/styles.css'
import {
  ChainId,
  Config,
  DAppProvider,
  MULTICALL_ADDRESSES,
} from '@usedapp/core'
import SplitsProvider from 'context/splitsContext'

const config: Config = {
  /* readOnlyChainId: ChainId.Mainnet,
   * readOnlyUrls: {
   *   [ChainId.Mainnet]:
   *     'https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934',
   * }, */
  multicallAddresses: {
    ...MULTICALL_ADDRESSES,
    31337: '127.0.0.1',
  },
  supportedChains: [
    ChainId.Mainnet,
    ChainId.Goerli,
    ChainId.Kovan,
    ChainId.Rinkeby,
    ChainId.Ropsten,
    ChainId.xDai,
    ChainId.BSC,
    ChainId.Localhost,
    ChainId.Hardhat,
  ],
}

type IPageProps = Record<string, never>

function App({
  Component,
  pageProps,
}: {
  Component: React.ElementType
  pageProps: IPageProps
}): JSX.Element {
  return (
    <DAppProvider config={config}>
      <SplitsProvider>
        <Component {...pageProps} />
      </SplitsProvider>
    </DAppProvider>
  )
}

export default App
