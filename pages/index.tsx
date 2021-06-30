import * as React from 'react'
import Link from 'next/link'
import { useState } from 'react'
import Title from 'components/Title'
import Layout from 'components/Layout'
import Menu from 'components/Menu'
import Button from 'components/Button'
import { useEthers, shortenAddress } from '@usedapp/core'
import { filter, find, sumBy } from 'lodash'

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
  total_funds: number
  recipients: IRecipient[]
}

// Temporary/working split data
const splits = [
  {
    address: '0x1022a225cd49fa3c73c9094730a16e5f70ff015b',
    name: 'This is a split!',
    created_by: '0xc649fca6524014433aeeb926f26dddf984216322',
    current_funds: 20,
    total_funds: 30,
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
    current_funds: 0,
    total_funds: 60,
    recipients: [
      {
        address: '0xeb78334dfde3afbc2b904f06153f59cc80ee07fa',
        ownership: 90.0,
      },
      {
        address: '0x1147086E32B5e372cB7Bce946e4De22171DEc49f',
        ownership: 10.0,
      },
    ],
  },
  {
    address: '0x8klas74kas8923lkKlahd',
    name: 'My first split',
    created_by: '0xcc3645f3d4b06c68e6d65dc0dbe6ae7a5503f3ad',
    current_funds: 0,
    total_funds: 300,
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
    created_by: '0x1147086E32B5e372cB7Bce946e4De22171DEc49f',
    current_funds: 100,
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
  if (account) {
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
          You have {amount.toFixed(2)} ETH ready to claim.
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
              'rounded-2xl bg-white bg-opacity-90 shadow px-4 py-2.5 font-semibold text-indigo-500 hover:bg-opacity-100 focus:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition'
            }
          >
            Claim Funds
          </button>
        </div>
      </div>
    )
  } else return null
}

function SplitSummaryRecipient({ split }: { split: ISplit }) {
  return (
    <div className={'p-4 shadow border border-gray-100 rounded-3xl space-y-4'}>
      <div className={'flex items-center justify-between'}>
        <div className={'text-lg font-medium text-gray-400'}>
          {shortenAddress(split.address)}
        </div>
      </div>
      <div className={'text-xl font-semibold'}>
        You receive 50% of this split.
      </div>
      <div className={'grid grid-cols-2 gap-4'}>
        <div className={'-space-y-1'}>
          <div className={'text-2xl text-gray-900 font-semibold'}>
            {split.current_funds.toFixed(2)} ETH
          </div>
          <div className={'uppercase text-sm text-gray-400 font-semibold'}>
            Waiting to be distributed
          </div>
        </div>
        <div className={'-space-y-1'}>
          <div className={'text-2xl text-gray-900 font-semibold'}>
            {split.total_funds.toFixed(2)} ETH
          </div>
          <div className={'uppercase text-sm text-gray-400 font-semibold'}>
            Your lifetime earnings
          </div>
        </div>
      </div>
      <Link href={`/splits/[split]`} as={`/splits/${split.address}`}>
        {/* This is not a good way to do this */}
        <Button compact onClick={() => undefined} color={'blue'}>
          View Split Details
        </Button>
      </Link>
    </div>
  )
}

function SplitSummaryCreator({ split }: { split: ISplit }) {
  return (
    <div className={'p-4 shadow border border-gray-100 rounded-3xl space-y-6'}>
      <Link
        href={`/splits/[split]`}
        as={`/splits/${split.address}`}
        key={split.address}
      >
        <a
          className={
            'text-xl font-semibold text-gray-900 hover:text-blue-500 cursor-pointer transition'
          }
        >
          Split {shortenAddress(split.address)}
        </a>
      </Link>
      <div>{split.address}</div>
    </div>
  )
}

export default function Home(): JSX.Element {
  const { account } = useEthers()

  const [selectedMenuItem, setSelectedMenuItem] = useState<number>(0)

  // Return only the Splits that account is a recipient of
  const splitsReceivingFrom = filter(splits, {
    recipients: [{ address: account }],
  })

  // Return only the Splits that account is the creator of
  const splitsCreated = filter(splits, { created_by: account })

  const myClaimableFunds = sumBy(splitsReceivingFrom, (split) => {
    const onlyMe = find(split.recipients, { address: account }) || 0
    return (split.current_funds * onlyMe.ownership) / 100
  })

  return (
    <Layout>
      <Title value="Splits" />
      <Menu />
      {account && (
        <div className={'py-4 space-y-8'}>
          {myClaimableFunds > 0 && <ClaimFunds amount={myClaimableFunds} />}

          <div
            className={
              'grid grid-cols-1 md:grid-cols-2 md:gap-2 text-lg md:text-xl'
            }
          >
            <button
              onClick={() => setSelectedMenuItem(0)}
              className={`p-2 font-semibold rounded-2xl transition ${
                selectedMenuItem === 0
                  ? `text-white bg-gray-900`
                  : `text-gray-400 hover:text-gray-500`
              } focus:outline-none`}
            >
              Splits You&apos;re Part Of
            </button>
            <button
              onClick={() => setSelectedMenuItem(1)}
              className={`p-2 font-semibold rounded-2xl transition ${
                selectedMenuItem === 1
                  ? `text-white bg-gray-900`
                  : `text-gray-400 hover:text-gray-500`
              } focus:outline-none`}
            >
              Splits You&apos;ve Created
            </button>
          </div>
          {selectedMenuItem === 0 &&
            splitsReceivingFrom.map((split) => {
              return <SplitSummaryRecipient key={split.address} split={split} />
            })}
          {selectedMenuItem === 1 &&
            splitsCreated.map((split) => {
              return <SplitSummaryCreator key={split.address} split={split} />
            })}
        </div>
      )}
      {!account && (
        <div className={'pt-8 pb-4 space-y-8'}>
          <div className={'text-5xl font-bold text-gray-900'}>
            Divy up funds before receiving them.
          </div>
          <div className={'text-2xl text-gray-400'}>
            Splits allows you to automatically route funds to a set of Ethereum
            addresses, according to pre-defined ownership allocations. Whenever
            funds are received by a Split, they&apos;re automatically divvied up
            and routed to the recipients.
          </div>
        </div>
      )}
    </Layout>
  )
}
