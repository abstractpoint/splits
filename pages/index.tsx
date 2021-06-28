import * as React from 'react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Title from 'components/Title'
import Layout from 'components/Layout'
import Button from 'components/Button'
import {
  useEthers,
  getExplorerAddressLink,
  shortenAddress,
} from '@usedapp/core'

import { Copy, ExternalLink } from 'react-feather'

type IRecipient = {
  address: string
  ownership?: number
  ens?: string
  resolvedAddress?: string
}

type ISplit = {
  address: string
  name: string
  current_funds: number
  recipients: IRecipient[]
}

// Temporary/working split data
const splits = [
  {
    address: '0x1022a225cd49fa3c73c9094730a16e5f70ff015b',
    name: 'Gitcoin, ETHGlobal and Mint Fund Split',
    created_by: '0xeb78334dfde3afbc2b904f06153f59cc80ee07fa',
    current_funds: 0,
    total_funds: 1.28319,
    recipients: [
      {
        address: '0x1147086E32B5e372cB7Bce946e4De22171DEc49f',
        ownership: 50.0,
      },
      {
        address: '0xeb78334dfde3afbc2b904f06153f59cc80ee07fa',
        ownership: 50.0,
      },
    ],
  },
  {
    address: '0xeb78334dfde3afbc2b904f06153f59cc80ee07fa',
    name: 'My first split',
    created_by: '0xbffb152b9392e38cddc275d818a3db7fe364596b',
    current_funds: 3.77,
    total_funds: 6.238,
    recipients: [
      {
        address: '0xeb78334dfde3afbc2b904f06153f59cc80ee07fa',
        ownership: 50.0,
      },
      {
        address: '0x1147086E32B5e372cB7Bce946e4De22171DEc49f',
        ownership: 50.0,
      },
    ],
  },
  {
    address: '0x8klas74kas8923lkKlahd',
    name: 'My first split',
    created_by: '0xcc3645f3d4b06c68e6d65dc0dbe6ae7a5503f3ad',
    current_funds: 0.063,
    total_funds: 344.834,
    recipients: [
      {
        address: '0xcc3645f3d4b06c68e6d65dc0dbe6ae7a5503f3ad',
        ownership: 20.0,
      },
      {
        address: '0xf615c211ca2d7508b65cde193f682762d25ded2a',
        ownership: 70.0,
      },
      {
        address: '0x0f15eafb7c17ca82d5157f37d745a3c426c57fa1',
        ownership: 10.0,
      },
    ],
  },
  {
    address: '0xb1fc37d345ceba64746f2dd9ff983d663059c2a1',
    name: 'My first split',
    created_by: '0xcc3645f3d4b06c68e6d65dc0dbe6ae7a5503f3ad',
    current_funds: 0,
    total_funds: 4.248,
    recipients: [
      {
        address: '0xea63336ac871755e99c8a23c48ce256042d1d89c',
        ownership: 20.0,
      },
      {
        address: '0xc649fca6524014433aeeb926f26dddf984216322',
        ownership: 60.0,
      },
      {
        address: '0x1147086E32B5e372cB7Bce946e4De22171DEc49f',
        ownership: 20.0,
      },
    ],
  },
]

// Display the funds ready to claimed by user
function ClaimFunds({ amount }: { amount: number }) {
  const { account } = useEthers()
  // Calculate how much the account can claim
  const claimableFunds = 1
  if (account && claimableFunds > 0) {
    return (
      <div
        className={
          'p-4 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl shadow-lg space-y-4'
        }
      >
        <div
          className={
            'text-xl font-semibold text-white text-opacity-100 leading-tight'
          }
        >
          You have {amount.toFixed(4)} ETH ready to claim.
        </div>
        <div className={'flex justify-between'}>
          <div className={'-space-y-px'}>
            <div
              className={
                'font-medium text-white text-opacity-40 text-xs uppercase tracking-wider'
              }
            >
              Account
            </div>
            <div
              className={'font-semibold text-white text-opacity-100 text-lg'}
            >
              {account.substring(0, 6)}
            </div>
          </div>
          <button
            onClick={() => alert('Claim funds')}
            className={
              'rounded-2xl bg-white bg-opacity-90 shadow px-4 py-2.5 font-semibold text-purple-500 hover:bg-opacity-100 focus:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition'
            }
          >
            Claim Funds &rarr;
          </button>
        </div>
      </div>
    )
  } else return null
}

function DistributeFunds({ amount }: { amount: number }) {
  const { account } = useEthers()
  return (
    <div
      className={
        'p-4 bg-blue-50 text-blue-500 font-medium rounded-3xl space-y-4 md:space-y-0 md:flex md:items-center'
      }
    >
      <div className={'flex-grow'}>
        Earn ${(amount * 0.01).toFixed(4)} ETH by making these funds claimable.
      </div>
      {/* Display CTA to distribute funds only if wallet is connected */}
      {account ? (
        <div>
          <Button
            compact
            color={'blue'}
            onClick={() => alert('Distribute funds')}
          >
            Distribute
          </Button>
        </div>
      ) : (
        <ConnectButton />
      )}
    </div>
  )
}

function ErrorWrapper({ error }: { error: string }) {
  return (
    <div
      className={`fixed top-0 inset-x-0 bg-red-100 text-red-500 text-center p-1`}
    >
      {error}
    </div>
  )
}

function ConnectButton() {
  const { activateBrowserWallet } = useEthers()
  const [activateError, setActivateError] = useState<string>('')
  const { error } = useEthers()
  useEffect(() => {
    if (error) {
      setActivateError(error.message)
      setTimeout(() => {
        setActivateError('')
      }, 3000)
    }
  }, [error])

  const activate = async () => {
    setActivateError('')
    activateBrowserWallet()
  }
  return (
    <>
      {activateError != '' && <ErrorWrapper error={activateError} />}
      <Button color={'blue'} compact onClick={() => activate()}>
        Connect
      </Button>
    </>
  )
}

function Menu() {
  const router = useRouter()
  const { account } = useEthers()

  return (
    <div className={'py-4 flex items-center space-x-2'}>
      {account ? (
        <>
          <Button
            color={'blue'}
            compact
            onClick={() => router.push('/account')}
          >
            Account
          </Button>
          <Button color={'purple'} compact onClick={() => router.push('/new')}>
            New Split
          </Button>
        </>
      ) : (
        <ConnectButton />
      )}
    </div>
  )
}

// Display different address UI if recipient is verified (ENS etc)
function VerifiedRecipient({
  address,
  resolveName,
}: {
  address: string
  resolveName: string
}) {
  return (
    <div className={'flex items-center space-x-2 font-medium'}>
      <div className={''}>{resolveName}</div>
      <div
        className={
          'text-xs tracking-wide font-semibold px-2 py-1 rounded-full bg-gray-500 bg-opacity-5'
        }
      >
        {address.slice(0, 6)}
      </div>
    </div>
  )
}

// Display each receipient as a line item with avatar, address, ownership
function Recipient({ recipient }: { recipient: IRecipient }) {
  const { account, chainId } = useEthers()
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg odd:bg-gray-50 font-medium ${
        account === recipient.address ? `text-green-500` : `text-gray-900`
      }`}
    >
      <a
        href={chainId && getExplorerAddressLink(recipient.address, chainId)}
        className={'flex items-center space-x-2 hover:opacity-80'}
      >
        <img
          src={makeBlockie(recipient.address)}
          className={'w-6 h-6 rounded-full'}
        />
        <div>
          {account === recipient.address ? (
            <VerifiedRecipient
              address={recipient.address}
              resolveName={'You'}
            />
          ) : (
            shortenAddress(recipient.address)
          )}
        </div>
      </a>
      <div className={''}>{recipient.ownership?.toFixed(1)}%</div>
    </div>
  )
}

function Split({ split }: { split: ISplit }) {
  const { chainId } = useEthers()
  const [isCopied, setIsCopied] = useState<boolean>(false)

  function copyToClipboard() {
    navigator.clipboard.writeText(split.address || '')
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 800)
  }

  return (
    <div className={'p-4 shadow border border-gray-100 rounded-3xl space-y-6'}>
      <div className={'space-y-2'}>
        <div className={'text-2xl font-semibold text-gray-900'}>
          {split.name}
        </div>
        <div className={`flex items-center space-x-4`}>
          <a
            href={chainId && getExplorerAddressLink(split.address, chainId)}
            className={
              'px-2 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 font-medium flex items-center space-x-1 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none transition'
            }
          >
            <ExternalLink size={16} strokeWidth={2.5} />
            <div>{split.address.substring(0, 6)}</div>
          </a>
          <button
            onClick={() => copyToClipboard()}
            className={`px-2 py-1 rounded-xl font-medium flex items-center space-x-1 cursor-pointer ${
              isCopied
                ? `text-green-400 bg-green-50`
                : `bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600`
            } focus:outline-none transition`}
          >
            {!isCopied && <Copy size={16} strokeWidth={2.5} />}
            <div>{isCopied ? 'Copied!' : 'Copy'}</div>
          </button>
        </div>
      </div>
      {split.current_funds > 0 && (
        <DistributeFunds amount={split.current_funds} />
      )}
      <div className={'space-y-2'}>
        <div className={'text-xl font-medium'}>
          {split.recipients.length} Recipients
        </div>
        <div className={'space-y-1'}>
          {split.recipients.map((i) => {
            return <Recipient key={i.address} recipient={i} />
          })}
        </div>
      </div>
    </div>
  )
}

export default function Home(): JSX.Element {
  // Calculate how much the authenticated wallet can claim
  let claimableFunds = 0
  splits.forEach((split) => {
    claimableFunds += split.current_funds
  })

  return (
    <Layout>
      <Title value="Splits" />
      <div className={'flex items-center justify-between'}>
        <img src={'/splits_logo.png'} className={'w-12 h-12'} />
        <Menu />
      </div>
      <div className={'py-4 space-y-8'}>
        {claimableFunds > 0 && <ClaimFunds amount={claimableFunds} />}

        {splits.map((split) => {
          return <Split key={split.address} split={split} />
        })}
      </div>
    </Layout>
  )
}
