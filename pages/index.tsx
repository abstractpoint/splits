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
import { Identicon } from '@lidofinance/identicon'
import makeBlockie from 'ethereum-blockies-base64'
import { HelpCircle } from 'react-feather'

import { BigNumber, utils } from 'ethers'

import { IRecipient, ISplit } from 'types'

// TODO: figure out right data/display model for eth value (e.g. store as BigNumber, display as string vs number?)
function SplitSummaryRecipient({ split }: { split: ISplit }) {
  const { account } = useEthers()
  const onlyMe = find(split.recipients, { address: account }) as IRecipient
  return (
    <Link href={`/splits/[split]`} as={`/splits/${split.address}`}>
      <div
        className={
          'p-4 rounded-3xl border-2 border-gray-100 hover:border-gray-300 cursor-pointer transition flex flex-col space-y-4'
        }
      >
        <div className={'flex items-center justify-between'}>
          <Identicon address={split.address} diameter={40} />
          {onlyMe && account && (
            <div
              className={`bg-gray-100 rounded-full px-3 py-1 text-right flex items-center space-x-2`}
            >
              <img
                src={makeBlockie(account)}
                className={'w-5 h-5 rounded-full'}
              />

              <div className={'text-lg font-medium text-gray-900'}>
                {(
                  ((onlyMe.ownership || 0) * 100) /
                  PERCENTAGE_SCALE.toNumber()
                ).toFixed(1)}
                %
              </div>
            </div>
          )}
        </div>
        <div className={'grid grid-cols-2 gap-2 flex-grow items-end'}>
          <div className={'-space-y-1'}>
            <div className={'font-medium'}>Earnings</div>
            <div className={'opacity-50 font-semibold'}>
              {utils.formatEther(split.total_funds)} ETH
            </div>
          </div>
          <div
            className={`-space-y-1 ${
              !split.current_funds.eq(0) && `text-blue-500`
            }`}
          >
            <div className={'font-medium flex'}>Distributable</div>
            <div className={'opacity-50 font-semibold'}>
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
  const [isClaimableTooltipOpen, setIsClaimableTooltipOpen] =
    useDetectOutsideClick(dropdownRef, false)

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
          setEarnings((e) => e.add(claimableFunds))
          setClaimableFunds(BigNumber.from(0))
        } else {
          console.error(claimBalanceReceipt)
        }
      })()
    /* }, [library, account, hasSigner]) */
  }, [library, account, setEarnings, setClaimableFunds, claimableFunds])

  function Summary() {
    return (
      <div
        className={
          'mb-8 rounded-3xl p-4 space-y-4 border border-gray-100 shadow'
        }
      >
        <div className={'flex items-center justify-between'}>
          <div className={'text-2xl font-medium'}>Your Account</div>
          {!claimableFunds.eq(0) && (
            <button
              onClick={claimFunds}
              className={
                'px-4 py-2 bg-gradient-to-tr from-blue-500 to-purple-500 text-white font-semibold text-lg rounded-xl focus:outline-none hover:opacity-90 transition'
              }
            >
              Claim Funds
            </button>
          )}
        </div>
        <div className={'grid grid-cols-2 md:grid-cols-3 gap-2'}>
          <div className={`rounded-3xl text-left relative`}>
            <div className={'-space-y-1'}>
              <div
                className={
                  'text-sm sm:text-lg font-medium text-gray-400 flex items-center'
                }
              >
                Distributable
                <HelpCircle
                  size={18}
                  onClick={() => setIsBalanceTooltipOpen(!isBalanceTooltipOpen)}
                  className={
                    'ml-1 text-gray-200 hover:text-gray-300 transition cursor-pointer'
                  }
                />
              </div>
              <div
                className={'text-lg sm:text-2xl font-semibold text-gray-900'}
              >
                {utils.formatEther(myUnclaimableBalance)} ETH
              </div>
              <div
                ref={dropdownRef}
                className={`bg-white border border-gray-200 shadow-lg p-3 text-sm rounded-xl absolute font-medium text-gray-700 w-64 overflow-hidden ${
                  isBalanceTooltipOpen ? `block z-50` : `hidden`
                }`}
              >
                This is how much is waiting to be distributed before it can be
                claimed by you.{' '}
                <a href={'#'} className={'text-blue-500 font-semibold'}>
                  Learn more
                </a>
              </div>
            </div>
          </div>
          <div className={`rounded-3xl text-left relative space-y-2`}>
            <div className={'-space-y-1'}>
              <div
                className={
                  'text-sm sm:text-lg font-medium text-gray-400 flex items-center'
                }
              >
                Claimable
                <HelpCircle
                  size={18}
                  onClick={() =>
                    setIsClaimableTooltipOpen(!isClaimableTooltipOpen)
                  }
                  className={
                    'ml-1 text-gray-200 hover:text-gray-300 transition cursor-pointer'
                  }
                />
              </div>
              <div
                className={'text-lg sm:text-2xl font-semibold text-gray-900'}
              >
                {utils.formatEther(claimableFunds)} ETH
              </div>
              <div
                ref={dropdownRef}
                className={`bg-white border border-gray-200 shadow-lg p-3 text-sm rounded-xl absolute font-medium text-gray-700 w-64 overflow-hidden ${
                  isClaimableTooltipOpen ? `block z-50` : `hidden`
                }`}
              >
                This is how much you&apos;re currently able to claim across all
                of your splits.{' '}
                <a href={'#'} className={'text-blue-500 font-semibold'}>
                  Learn more
                </a>
              </div>
            </div>
          </div>
          <div className={`rounded-3xl relative`}>
            <div className={'-space-y-1 '}>
              <div
                className={
                  'text-sm sm:text-lg font-medium text-gray-400 flex items-center'
                }
              >
                Claimed{' '}
                <HelpCircle
                  size={18}
                  onClick={() => setIsEarnedTooltipOpen(!isEarnedTooltipOpen)}
                  className={
                    'ml-1 text-gray-200 hover:text-gray-300 transition cursor-pointer'
                  }
                />
              </div>
              <div
                className={'text-lg sm:text-2xl font-semibold text-gray-900'}
              >
                {utils.formatEther(earnings)} ETH
              </div>
              <div
                ref={dropdownRef}
                className={`bg-white border border-gray-200 shadow-lg p-3 text-sm rounded-xl absolute font-medium text-gray-700 w-64 overflow-hidden ${
                  isEarnedTooltipOpen ? `block z-50` : `hidden`
                }`}
              >
                This is how much you&apos;ve claimed from all your splits.{' '}
                <a href={'#'} className={'text-blue-500 font-semibold'}>
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Title value="Splits" />
      <Menu />
      {account && (
        <div className={'py-4 space-y-4'}>
          <Summary />
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
                return (
                  <SplitSummaryRecipient key={split.address} split={split} />
                )
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
