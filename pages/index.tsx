import * as React from 'react'
import Link from 'next/link'
import { useState, useRef } from 'react'
import Title from 'components/Title'
import Layout from 'components/Layout'
import Menu from 'components/Menu'
import { useDetectOutsideClick } from 'components/useDetectOutsideClick'
import { useEthers } from '@usedapp/core'
import { filter, find, sumBy } from 'lodash'
import Identicon from 'react-identicons'
import { HelpCircle } from 'react-feather'

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

function SplitSummaryRecipient({ split }: { split: ISplit }) {
  const { account } = useEthers()
  const onlyMe = find(split.recipients, { address: account }) || 0
  return (
    <Link href={`/splits/[split]`} as={`/splits/${split.address}`}>
      <div
        className={
          'p-4 rounded-3xl border-2 border-gray-100 hover:border-gray-300 cursor-pointer hover:opacity-80 transition space-y-4'
        }
      >
        <div className={'flex items-center justify-between'}>
          <Identicon string={split.address} size={32} />
          <div className={`-space-y-1 text-right`}>
            <div className={'text-2xl font-semibold text-gray-900'}>
              {onlyMe.ownership.toFixed(1)}%
            </div>
            <div className={'font-medium text-gray-300 text-sm uppercase'}>
              Your Share
            </div>
          </div>
        </div>
        <div className={'grid grid-cols-2 gap-2'}>
          <div className={'-space-y-1'}>
            <div className={'font-medium'}>Earnings</div>
            <div className={'text-gray-400 font-semibold'}>
              {split.total_funds.toFixed(2)} ETH
            </div>
          </div>
          <div className={'-space-y-1'}>
            <div className={'font-medium'}>Balance</div>
            <div className={'text-gray-400 font-semibold'}>
              {split.current_funds.toFixed(2)} ETH
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SplitSummaryCreator({ split }: { split: ISplit }) {
  return (
    <Link href={`/splits/[split]`} as={`/splits/${split.address}`}>
      <div
        className={
          'p-4 rounded-3xl border-2 border-gray-100 hover:border-gray-300 cursor-pointer hover:opacity-80 transition space-y-4'
        }
      >
        <div className={'flex items-center justify-between'}>
          <Identicon string={split.address} size={32} />
        </div>
        <div className={'grid grid-cols-2 gap-2'}>
          <div className={'-space-y-1'}>
            <div className={'font-medium'}>Earnings</div>
            <div className={'text-gray-400 font-semibold'}>
              {split.total_funds.toFixed(2)} ETH
            </div>
          </div>
          <div className={'-space-y-1'}>
            <div className={'font-medium'}>Balance</div>
            <div className={'text-gray-400 font-semibold'}>
              {split.current_funds.toFixed(2)} ETH
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home(): JSX.Element {
  const { account } = useEthers()

  const [selectedMenuItem, setSelectedMenuItem] = useState<number>(0)

  const dropdownRef = useRef(null)
  const [isEarnedTooltipOpen, setIsEarnedTooltipOpen] = useDetectOutsideClick(
    dropdownRef,
    false,
  )
  const [isBalanceTooltipOpen, setIsBalanceTooltipOpen] = useDetectOutsideClick(
    dropdownRef,
    false,
  )

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
        <div className={'py-4 space-y-4'}>
          <div className={'md:my-8 grid grid-cols-2 md:grid-cols-3 gap-2'}>
            <button
              onClick={() => setIsEarnedTooltipOpen(!isEarnedTooltipOpen)}
              className={`-space-y-1 p-4 rounded-3xl text-left focus:outline-none relative group`}
            >
              <div
                className={
                  'text-sm sm:text-lg font-medium text-gray-400 flex items-center'
                }
              >
                Your Earnings{' '}
                <HelpCircle
                  size={18}
                  className={
                    'ml-2 text-gray-200 group-hover:text-gray-300 transition'
                  }
                />
              </div>
              <div
                className={'text-lg sm:text-2xl font-semibold text-gray-900'}
              >
                35.00 ETH
              </div>
              <nav
                ref={dropdownRef}
                className={`bg-black opacity-80 p-4 rounded-lg absolute top-20 font-medium text-white w-64 overflow-hidden blurred ${
                  isEarnedTooltipOpen ? `block z-50` : `hidden`
                }`}
              >
                This is how much you&apos;ve received across all the splits
                you&apos;re a recipient of.
              </nav>
            </button>
            <button
              onClick={() => setIsBalanceTooltipOpen(!isBalanceTooltipOpen)}
              className={`-space-y-1 p-4 rounded-3xl text-left focus:outline-none relative group`}
            >
              <div
                className={
                  'text-sm sm:text-lg font-medium text-gray-400 flex items-center'
                }
              >
                Your Balance{' '}
                <HelpCircle
                  size={18}
                  className={
                    'ml-2 text-gray-200 group-hover:text-gray-300 transition'
                  }
                />
              </div>
              <div
                className={'text-lg sm:text-2xl font-semibold text-gray-900'}
              >
                35.00 ETH
              </div>
              <nav
                ref={dropdownRef}
                className={`bg-black opacity-80 p-4 rounded-lg absolute top-20 font-medium text-white w-64 overflow-hidden blurred ${
                  isBalanceTooltipOpen ? `block z-50` : `hidden`
                }`}
              >
                This is how much has been allocated to you, but isn&apos;t yet
                ready to be claimed.
              </nav>
            </button>
            <button
              onClick={() => alert('Claim funds')}
              className={
                'col-span-2 sm:col-span-1 p-4 space-y-2 rounded-3xl text-left group bg-gradient-to-tr from-blue-500 to-purple-600 hover:opacity-90 transition focus:outline-none'
              }
            >
              <div className={'-space-y-1'}>
                <div
                  className={'text-lg font-medium text-white text-opacity-60'}
                >
                  Claimable Funds
                </div>
                <div className={'text-2xl font-semibold text-white'}>
                  {myClaimableFunds.toFixed(2)} ETH
                </div>
              </div>
            </button>
          </div>

          <div className={'flex items-center space-x-4 text-xl md:text-2xl'}>
            <button
              onClick={() => setSelectedMenuItem(0)}
              className={`p-2 font-semibold transition ${
                selectedMenuItem === 0
                  ? `text-gray-900`
                  : `text-gray-400 hover:text-gray-500`
              } focus:outline-none`}
            >
              Earning
            </button>
            <button
              onClick={() => setSelectedMenuItem(1)}
              className={`p-2 font-semibold transition ${
                selectedMenuItem === 1
                  ? `text-gray-900`
                  : `text-gray-400 hover:text-gray-500`
              } focus:outline-none`}
            >
              Created
            </button>
          </div>

          <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
            {selectedMenuItem === 0 &&
              splitsReceivingFrom.map((split) => {
                return (
                  <SplitSummaryRecipient key={split.address} split={split} />
                )
              })}
            {selectedMenuItem === 1 &&
              splitsCreated.map((split) => {
                return <SplitSummaryCreator key={split.address} split={split} />
              })}
          </div>
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
