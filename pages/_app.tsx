import * as React from 'react'
import 'tailwindcss/tailwind.css'
import 'styles/styles.css'
import { DAppProvider, ChainId } from '@usedapp/core'

const config = {
  readOnlyChainId: ChainId.Mainnet,
  readOnlyUrls: {
    [ChainId.Mainnet]:
      'https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934',
  },
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
      <Component {...pageProps} />
    </DAppProvider>
  )
}

export default App
