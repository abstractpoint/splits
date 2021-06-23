import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Title from '../components/Title'
import Layout from '../components/Layout'
import Button from '../components/Button'

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

  if (account && chainId) {
    return (
      <Layout>
        <Title value="Account | Splits" />
        <div className={'flex items-center justify-between'}>
          <div className={'text-2xl md:text-4xl font-semibold text-gray-900'}>
            Account
          </div>
          <div className={'py-4 flex items-center space-x-4 text-xl'}>
            <Link href={'/'}>
              <a
                className={
                  'flex px-4 py-2.5 rounded-xl text-base font-semibold bg-gray-50 text-gray-500 hover:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-gray-200'
                }
              >
                Close
              </a>
            </Link>
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
            <a
              href={getExplorerAddressLink(account!, chainId!)}
              target="_blank"
              rel="noopener noreferrer"
              className={
                'w-full text-center px-4 py-2.5 rounded-xl text-base font-semibold bg-gray-50 text-gray-500 hover:text-gray-400 transition'
              }
            >
              Etherscan
            </a>
            <Button compact color={`gray`} onClick={() => copyToClipboard()}>
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
            <Button compact color={'gray'} onClick={() => disconnectWallet()}>
              Disconnect
            </Button>
          </div>
        </div>
        <div className={'pt-8 text-2xl font-medium'}>Created Splits</div>
      </Layout>
    )
  } else return <div />
}
