import { SplitMain } from 'typechain/SplitMain'
import { BigNumber } from 'ethers'

export type IRecipient = {
  address: string
  ownership?: number
  ens?: string
  resolvedAddress?: string
}

export type IRecipients = {
  recipients: IRecipient[]
}

export type ISplit = {
  created_by: string
  address: string
  current_funds: BigNumber
  total_funds: BigNumber
  recipients: IRecipient[]
}

export type ISplitsContext = {
  splits: ISplit[]
  splitMain: SplitMain
  hasSigner: boolean
  getSplitByAddress: (arg0: string) => ISplit | null
}
