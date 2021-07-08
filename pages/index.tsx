import * as React from 'react'
import Link from 'next/link'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Title from 'components/Title'
import Layout from 'components/Layout'
import Menu from 'components/Menu'
import { useDetectOutsideClick } from 'components/useDetectOutsideClick'
import { useEthers } from '@usedapp/core'
import { useSplits, PERCENTAGE_SCALE } from 'context/splitsContext'
import { filter, find } from 'lodash'
// TODO: https://www.typescriptlang.org/dt/search?search=identicon
import Identicon from 'react-identicons'
import { HelpCircle } from 'react-feather'

import { BigNumber, utils } from 'ethers'

import { IRecipient, ISplit } from 'types'

// TODO: figure out right data/display model for eth value (e.g. store as BigNumber, display as string vs number?)
// TODO: combine with below
function SplitSummaryRecipient({ split }: { split: ISplit }) {
  const { account } = useEthers()
  const onlyMe = find(split.recipients, { address: account }) as IRecipient
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
              {(
                ((onlyMe.ownership || 0) * 100) /
                PERCENTAGE_SCALE.toNumber()
              ).toFixed(1)}
              %
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
              {utils.formatEther(split.total_funds)} ETH
            </div>
          </div>
          <div className={'-space-y-1'}>
            <div className={'font-medium'}>Balance</div>
            <div className={'text-gray-400 font-semibold'}>
              {utils.formatEther(split.current_funds)} ETH
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// TODO: combine with above
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
              {utils.formatEther(split.total_funds)} ETH
            </div>
          </div>
          <div className={'-space-y-1'}>
            <div className={'font-medium'}>Balance</div>
            <div className={'text-gray-400 font-semibold'}>
              {utils.formatEther(split.current_funds)} ETH
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home(): JSX.Element {
  const { library, account } = useEthers()
  /* const { splits, splitMain, hasSigner } = useSplits() */
  const { splits, splitMain } = useSplits()

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
  const splitsReceivingFrom = useMemo(
    () =>
      filter(splits, {
        recipients: [{ address: account }],
      }) as ISplit[],
    [splits, account],
  )

  // Return only the Splits that account is the creator of
  const splitsCreated = useMemo(
    () => filter(splits, { created_by: account }) as ISplit[],
    [splits, account],
  )

  const [claimableFunds, setClaimableFunds] = useState<BigNumber>(
    BigNumber.from(0),
  )
  useEffect(() => {
    ;(async () => {
      if (library && account && splitMain) {
        setClaimableFunds(await splitMain.balances(account))
      }
    })()
  }, [library, account])

  const [earnings, setEarnings] = useState<BigNumber>(BigNumber.from(0))
  useEffect(() => {
    ;(async () => {
      if (library && account) {
        const transferETHEvents = await splitMain.queryFilter(
          splitMain.filters.TransferETH(account),
        )
        setEarnings(
          transferETHEvents.reduce(
            (acc, transfer) => acc.add(transfer.args.amount),
            BigNumber.from(0),
          ),
        )
      }
    })()
  }, [library, account])

  const myUnclaimableBalance = useMemo(
    () =>
      splitsReceivingFrom.reduce((acc, split) => {
        const onlyMe = find(split.recipients, {
          address: account,
        }) as IRecipient
        return onlyMe.ownership
          ? acc.add(
              split.current_funds.mul(onlyMe.ownership).div(PERCENTAGE_SCALE),
            )
          : acc
      }, BigNumber.from(0)),
    [splitsReceivingFrom, account],
  )

  const claimFunds = useCallback(() => {
    if (library && account)
      (async () => {
        const claimBalanceTx = await splitMain.claimBalance(account)
        // TODO: add try/catch
        const claimBalanceReceipt = await claimBalanceTx.wait()
        // TODO (ad): add success / error ui notifications
        if (claimBalanceReceipt.status == 1) {
          console.log('SUCCESS', claimBalanceReceipt)
        } else {
          console.error(claimBalanceReceipt)
        }
      })()
    /* }, [library, account, hasSigner]) */
  }, [library, account])

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
                {utils.formatEther(earnings)} ETH
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
                {utils.formatEther(myUnclaimableBalance)} ETH
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
              onClick={claimFunds}
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
                  {utils.formatEther(claimableFunds)} ETH
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
            Divvy up funds before receiving them.
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
