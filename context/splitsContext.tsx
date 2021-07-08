import React, { createContext, useContext, useState, useEffect } from 'react'
import { BigNumber, utils } from 'ethers'
import { useEthers } from '@usedapp/core'
import { Contract } from '@ethersproject/contracts'
import { zipWith, keyBy } from 'lodash'

import Layout from 'components/Layout'
import Menu from 'components/Menu'

import { ISplitsContext, ISplit, IRecipient } from 'types'
import { SplitMain } from 'typechain/SplitMain'
import SPLIT_MAIN_ARTIFACT from 'artifacts/contracts/SplitMain.sol/SplitMain.json'
import Title from 'components/Title'

// TODO: use .env
const SPLIT_MAIN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const SPLIT_MAIN_ABI = SPLIT_MAIN_ARTIFACT.abi
const SPLIT_MAIN_INTERFACE = new utils.Interface(SPLIT_MAIN_ABI)

export const SplitsContext = createContext<ISplitsContext | undefined>(
  undefined,
)

export default function SplitsContextComp({
  children,
}: {
  children: JSX.Element
}): JSX.Element {
  const [splits, setSplits] = useState<{ [key: string]: ISplit }>({})
  const { library } = useEthers()

  const signer = library?.getSigner()
  const splitMain = new Contract(
    SPLIT_MAIN_ADDRESS,
    SPLIT_MAIN_INTERFACE,
    signer || library,
  ) as SplitMain

  useEffect(() => {
    ;(async () => {
      if (library) {
        const createdSplitEvents = await splitMain.queryFilter(
          splitMain.filters.CreateSplit(),
        )
        const createdSplits = await Promise.all(
          createdSplitEvents.map(async (se) => {
            const currentFunds = await splitMain.balances(se.args.splitAddress)
            const pastDistributions = (
              await splitMain.queryFilter(
                splitMain.filters.DistributeSplit(se.args.splitAddress),
              )
            ).reduce((acc, dse) => acc.add(dse.args.amount), BigNumber.from(0))
            return {
              created_by: (await se.getTransactionReceipt()).from,
              address: se.args.splitAddress,
              recipients: zipWith(
                se.args.accounts,
                se.args.percentAllocations,
                (a, o) =>
                  ({
                    address: a,
                    ownership: o,
                  } as IRecipient),
              ),
              total_funds: currentFunds.add(pastDistributions),
              current_funds: currentFunds,
            } as ISplit
          }),
        )
        setSplits(keyBy(createdSplits, 'address'))
      }
    })()
  }, [library])

  if (!library)
    return (
      <Layout>
        <Title value={'Splits'} />
        <div className={'flex items-center justify-between pb-4'}>
          <img src={'/splits_logo.svg'} className={'w-12 h-12'} />
        </div>
        <div className={'py-4'}>
          <div
            className={'rounded-3xl bg-gray-100 animate-pulse w-full h-32'}
          />
        </div>
      </Layout>
    )

  return (
    <SplitsContext.Provider
      value={{
        splits: Object.values(splits),
        splitMain,
        hasSigner: !!signer,
        getSplitByAddress: (address) => splits[address],
      }}
    >
      {children}
    </SplitsContext.Provider>
  )
}

// Custom hook that shorthands the context!
export const useSplits: () => ISplitsContext = () => {
  const context = useContext(SplitsContext)
  if (!context) throw new Error('useSplits must be within SplitsProvider')

  return context
}

export const PERCENTAGE_SCALE = BigNumber.from(10e5)
