import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Title from 'components/Title'
import Layout from 'components/Layout'
import Button from 'components/Button'
import {
  useEthers,
  shortenAddress,
  getExplorerAddressLink,
} from '@usedapp/core'

export default function Account(): JSX.Element {
  const router = useRouter()
  const { account, chainId, deactivate } = useEthers()

  const [isCopied, setIsCopied] = useState<boolean>(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account || '')
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 800)
  }

  const disconnectWallet = async () => {
    deactivate()
    router.push('/')
  }

  useEffect(() => {
    if (!account) {
      router.push('/')
    }
  })

  if (account && chainId) {
    return (
      <Layout>
        <Title value="Account | Splits" />
        <div className={'flex items-center justify-between'}>
          <div className={'text-2xl md:text-4xl font-semibold text-gray-900'}>
            Account
          </div>
          <div className={'py-4 flex items-center space-x-4 text-xl'}>
            <Button compact onClick={() => router.push('/')}>
              Close
            </Button>
          </div>
        </div>
        <div
          className={
            'w-full py-4 flex flex-col items-center justify-center space-y-4'
          }
        >
          <img src={makeBlockie(account)} className={'w-20 h-20 rounded-3xl'} />
          <div className={'text-2xl font-semibold text-gray-900'}>
            {account && shortenAddress(account)}
          </div>
          <div className={'w-full grid grid-cols-1 md:grid-cols-3 gap-4'}>
            <Button
              compact
              onClick={() =>
                router.push(getExplorerAddressLink(account, chainId) as 'url')
              }
            >
              Etherscan
            </Button>
            <Button compact onClick={() => copyToClipboard()}>
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
            <Button compact onClick={() => disconnectWallet()}>
              Disconnect
            </Button>
          </div>
        </div>
        <div className={'pt-8 text-2xl font-medium'}>Created Splits</div>
      </Layout>
    )
  } else
    return (
      <Layout>
        <Title value="Account | Splits" />
        <div
          className={
            'w-full pt-24 flex flex-col items-center justify-center space-y-4'
          }
        >
          <div className={'w-20 h-20 rounded-3xl bg-gray-200 animate-pulse'} />
          <div className={'bg-gray-200 rounded-2xl h-12 w-48 animate-pulse'} />
        </div>
      </Layout>
    )
}
