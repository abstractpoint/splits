/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from 'ethers'
import { BytesLike } from '@ethersproject/bytes'
import { Listener, Provider } from '@ethersproject/providers'
import { FunctionFragment, EventFragment, Result } from '@ethersproject/abi'
import { TypedEventFilter, TypedEvent, TypedListener } from './commons'

interface SplitMainInterface extends ethers.utils.Interface {
  functions: {
    'PERCENTAGE_SCALE()': FunctionFragment
    'balances(address)': FunctionFragment
    'claimBalance(address)': FunctionFragment
    'createSplit(address[],uint32[])': FunctionFragment
    'distributeSplitBalance(address,address[],uint32[])': FunctionFragment
    'receiveSplitFunds(address)': FunctionFragment
    'scaleAmountByPercentage(uint256,uint256)': FunctionFragment
    'splitHashes(address)': FunctionFragment
  }

  encodeFunctionData(
    functionFragment: 'PERCENTAGE_SCALE',
    values?: undefined,
  ): string
  encodeFunctionData(functionFragment: 'balances', values: [string]): string
  encodeFunctionData(functionFragment: 'claimBalance', values: [string]): string
  encodeFunctionData(
    functionFragment: 'createSplit',
    values: [string[], BigNumberish[]],
  ): string
  encodeFunctionData(
    functionFragment: 'distributeSplitBalance',
    values: [string, string[], BigNumberish[]],
  ): string
  encodeFunctionData(
    functionFragment: 'receiveSplitFunds',
    values: [string],
  ): string
  encodeFunctionData(
    functionFragment: 'scaleAmountByPercentage',
    values: [BigNumberish, BigNumberish],
  ): string
  encodeFunctionData(functionFragment: 'splitHashes', values: [string]): string

  decodeFunctionResult(
    functionFragment: 'PERCENTAGE_SCALE',
    data: BytesLike,
  ): Result
  decodeFunctionResult(functionFragment: 'balances', data: BytesLike): Result
  decodeFunctionResult(
    functionFragment: 'claimBalance',
    data: BytesLike,
  ): Result
  decodeFunctionResult(functionFragment: 'createSplit', data: BytesLike): Result
  decodeFunctionResult(
    functionFragment: 'distributeSplitBalance',
    data: BytesLike,
  ): Result
  decodeFunctionResult(
    functionFragment: 'receiveSplitFunds',
    data: BytesLike,
  ): Result
  decodeFunctionResult(
    functionFragment: 'scaleAmountByPercentage',
    data: BytesLike,
  ): Result
  decodeFunctionResult(functionFragment: 'splitHashes', data: BytesLike): Result

  events: {
    'CreateSplit(address,bytes32,address[],uint32[])': EventFragment
    'DistributeSplit(address,uint256)': EventFragment
    'TransferETH(address,uint256,bool)': EventFragment
  }

  getEvent(nameOrSignatureOrTopic: 'CreateSplit'): EventFragment
  getEvent(nameOrSignatureOrTopic: 'DistributeSplit'): EventFragment
  getEvent(nameOrSignatureOrTopic: 'TransferETH'): EventFragment
}

export class SplitMain extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this
  attach(addressOrName: string): this
  deployed(): Promise<this>

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>,
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
  ): this

  listeners(eventName?: string): Array<Listener>
  off(eventName: string, listener: Listener): this
  on(eventName: string, listener: Listener): this
  once(eventName: string, listener: Listener): this
  removeListener(eventName: string, listener: Listener): this
  removeAllListeners(eventName?: string): this

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>

  interface: SplitMainInterface

  functions: {
    PERCENTAGE_SCALE(overrides?: CallOverrides): Promise<[BigNumber]>

    balances(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>

    claimBalance(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>

    createSplit(
      accounts: string[],
      percentAllocations: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>

    distributeSplitBalance(
      split: string,
      accounts: string[],
      percentAllocations: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>

    receiveSplitFunds(
      split: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>

    scaleAmountByPercentage(
      amount: BigNumberish,
      scaledPercent: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<[BigNumber] & { scaledAmount: BigNumber }>

    splitHashes(arg0: string, overrides?: CallOverrides): Promise<[string]>
  }

  PERCENTAGE_SCALE(overrides?: CallOverrides): Promise<BigNumber>

  balances(arg0: string, overrides?: CallOverrides): Promise<BigNumber>

  claimBalance(
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>

  createSplit(
    accounts: string[],
    percentAllocations: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>

  distributeSplitBalance(
    split: string,
    accounts: string[],
    percentAllocations: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>

  receiveSplitFunds(
    split: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>

  scaleAmountByPercentage(
    amount: BigNumberish,
    scaledPercent: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<BigNumber>

  splitHashes(arg0: string, overrides?: CallOverrides): Promise<string>

  callStatic: {
    PERCENTAGE_SCALE(overrides?: CallOverrides): Promise<BigNumber>

    balances(arg0: string, overrides?: CallOverrides): Promise<BigNumber>

    claimBalance(account: string, overrides?: CallOverrides): Promise<void>

    createSplit(
      accounts: string[],
      percentAllocations: BigNumberish[],
      overrides?: CallOverrides,
    ): Promise<void>

    distributeSplitBalance(
      split: string,
      accounts: string[],
      percentAllocations: BigNumberish[],
      overrides?: CallOverrides,
    ): Promise<void>

    receiveSplitFunds(split: string, overrides?: CallOverrides): Promise<void>

    scaleAmountByPercentage(
      amount: BigNumberish,
      scaledPercent: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>

    splitHashes(arg0: string, overrides?: CallOverrides): Promise<string>
  }

  filters: {
    CreateSplit(
      splitAddress?: string | null,
      splitHash?: BytesLike | null,
      accounts?: null,
      percentAllocations?: null,
    ): TypedEventFilter<
      [string, string, string[], number[]],
      {
        splitAddress: string
        splitHash: string
        accounts: string[]
        percentAllocations: number[]
      }
    >

    DistributeSplit(
      splitAddress?: string | null,
      amount?: null,
    ): TypedEventFilter<
      [string, BigNumber],
      { splitAddress: string; amount: BigNumber }
    >

    TransferETH(
      account?: null,
      amount?: null,
      success?: null,
    ): TypedEventFilter<
      [string, BigNumber, boolean],
      { account: string; amount: BigNumber; success: boolean }
    >
  }

  estimateGas: {
    PERCENTAGE_SCALE(overrides?: CallOverrides): Promise<BigNumber>

    balances(arg0: string, overrides?: CallOverrides): Promise<BigNumber>

    claimBalance(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>

    createSplit(
      accounts: string[],
      percentAllocations: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>

    distributeSplitBalance(
      split: string,
      accounts: string[],
      percentAllocations: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>

    receiveSplitFunds(
      split: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>

    scaleAmountByPercentage(
      amount: BigNumberish,
      scaledPercent: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>

    splitHashes(arg0: string, overrides?: CallOverrides): Promise<BigNumber>
  }

  populateTransaction: {
    PERCENTAGE_SCALE(overrides?: CallOverrides): Promise<PopulatedTransaction>

    balances(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>

    claimBalance(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>

    createSplit(
      accounts: string[],
      percentAllocations: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>

    distributeSplitBalance(
      split: string,
      accounts: string[],
      percentAllocations: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>

    receiveSplitFunds(
      split: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>

    scaleAmountByPercentage(
      amount: BigNumberish,
      scaledPercent: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>

    splitHashes(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>
  }
}
