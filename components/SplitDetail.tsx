import * as React from 'react'
import { useState, useCallback, useRef } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Identicon from 'react-identicons'
import Button from 'components/Button'
import { useDetectOutsideClick } from './useDetectOutsideClick'
import { useForm, SubmitHandler } from 'react-hook-form'
import { utils } from 'ethers'
import {
  useEthers,
  useEtherBalance,
  getExplorerAddressLink,
  shortenAddress,
} from '@usedapp/core'
import { useSplits, PERCENTAGE_SCALE } from 'context/splitsContext'
import { formatEther } from '@ethersproject/units'
import { CreditCard, Link, Divide } from 'react-feather'
import Modal from './Modal'

import { IRecipient, ISplit } from 'types'

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
function Recipient({
  split,
  recipient,
}: {
  split: ISplit
  recipient: IRecipient
}) {
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
      <div className={'flex items-center space-x-4'}>
        <div className={'opacity-60 text-right'}>
          {utils.formatEther(
            split.total_funds
              .mul(recipient.ownership || 0)
              .div(PERCENTAGE_SCALE),
          )}{' '}
          ETH
        </div>
        <div className={'w-16'}>
          {recipient.ownership &&
            ((recipient.ownership * 100) / PERCENTAGE_SCALE.toNumber()).toFixed(
              1,
            )}
          %
        </div>
      </div>
    </div>
  )
}

function MessageWrapper({
  message,
  type,
}: {
  message: string
  type: 'error' | 'info'
}): JSX.Element {
  const colorMap = {
    error: 'red',
    info: 'blue',
  }
  return (
    <div
      className={`fixed top-4 right-0 bg-${colorMap[type]}-50 text-${colorMap[type]}-500 text-center px-4 py-2 rounded-l-xl font-medium`}
    >
      {message}
    </div>
  )
}

export default function SplitDetail({
  split,
  isEmbedded,
}: {
  split: ISplit
  isEmbedded?: boolean
}): JSX.Element {
  const { splitMain, PERCENTAGE_SCALE } = useSplits()
  const dropdownRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useDetectOutsideClick(dropdownRef, false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSendingFunds, setIsSendingFunds] = useState(false)

  const [isUrlCopied, setUrlIsCopied] = useState<boolean>(false)
  function copyUrlToClipboard() {
    navigator.clipboard.writeText(window.location.toString())
    setUrlIsCopied(true)
    setTimeout(() => {
      setUrlIsCopied(false)
      setIsMenuOpen(false)
    }, 800)
  }

  const [isEmbedCopied, setEmbedIsCopied] = useState<boolean>(false)
  function copyEmbedToClipboard() {
    navigator.clipboard.writeText(
      `<iframe src="http://localhost:3000/embed/${split.address}" width="100%" height="100%" frameBorder="0" allowtransparency="true"></iframe>`,
    )
    setEmbedIsCopied(true)
    setTimeout(() => {
      setEmbedIsCopied(false)
      setIsMenuOpen(false)
    }, 800)
  }

  const { account, library, chainId } = useEthers()
  const etherBalance = useEtherBalance(account)

  type Inputs = {
    amount: string
  }

  const sendFunds = useCallback(
    ({ amount }: { amount: string }) => {
      if (library && account)
        (async () => {
          setIsSendingFunds(true)
          // TODO: move into hook
          const sendFundsTx = await splitMain.receiveSplitFunds(split.address, {
            value: utils.parseEther(amount).toString(),
          })
          // TODO: add try/catch
          const sendFundsReceipt = await sendFundsTx.wait()
          // TODO (ad): add success / error ui notifications
          if (sendFundsReceipt.status == 1) {
            console.log('SUCCESS', sendFundsReceipt)
          } else {
            console.error(sendFundsReceipt)
          }
          setIsModalOpen(false)
          setIsSendingFunds(false)
        })()
    },
    [library, account, split.address],
  )

  const distributeFunds = useCallback(() => {
    if (library && account)
      (async () => {
        setIsSendingFunds(true) // TODO
        // TODO: move into hook
        const accounts = split.recipients.map((r) => r.address)
        const percentAllocations = split.recipients.map((r) => r.ownership || 0)
        const distributeSplitTx = await splitMain.distributeSplitBalance(
          split.address,
          accounts,
          percentAllocations,
        )
        // TODO: add try/catch
        const distributeSplitReceipt = await distributeSplitTx.wait()
        // TODO (ad): add success / error ui notifications
        if (distributeSplitReceipt.status == 1) {
          console.log('SUCCESS', distributeSplitReceipt)
        } else {
          console.error(distributeSplitReceipt)
        }
        setIsSendingFunds(false) // TODO
      })()
  }, [library, account, split.address])

  const { register, handleSubmit } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => sendFunds(data)

  return (
    <div>
      {isSendingFunds && (
        <MessageWrapper type={'info'} message={'Request sent'} />
      )}
      {account && chainId ? (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={'How much?'}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={'flex items-center space-x-4'}>
              <div
                className={
                  'relative w-full rounded-2xl border-2 border-gray-100 focus-within:border-gray-200 overflow-hidden'
                }
              >
                <input
                  placeholder={'0.0'}
                  type={'string'}
                  autoFocus
                  {...register('amount', {
                    required: {
                      value: true,
                      message: 'Required',
                    },
                  })}
                  required
                  className={
                    'text-xl px-3 py-2 w-full focus:outline-none bg-transparent'
                  }
                />
                <div
                  className={
                    'font-semibold text-gray-400 absolute right-2 inset-y-0 py-2'
                  }
                >
                  ETH
                </div>
              </div>
              <button
                type={'submit'}
                className={
                  'text-lg font-medium h-full px-6 py-2 bg-pink-500 bg-opacity-5 hover:bg-opacity-10 text-pink-500 rounded-2xl focus:outline-none'
                }
              >
                Send
              </button>
            </div>
          </form>
          {etherBalance && (
            <div className={'text-lg font-medium text-gray-400'}>
              Balance: {formatEther(etherBalance)}
            </div>
          )}
        </Modal>
      ) : (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={'Connect Wallet'}
        >
          <div className={'text-lg py-2'}>
            Please connect your wallet first.
          </div>
        </Modal>
      )}
      <div
        className={`bg-white rounded-3xl ${
          isEmbedded ? `p-8` : `py-4`
        } space-y-6`}
      >
        <div className={'space-y-8'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <Identicon string={split.address} size={48} />
            </div>
            <div className={'relative'}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 rounded-2xl bg-transparent ${
                  isMenuOpen
                    ? `text-gray-600 bg-gray-100`
                    : `hover:bg-gray-100 text-gray-400 hover:text-gray-600`
                }  text-center transition focus:outline-none`}
              >
                <Link size={24} strokeWidth={2.5} />
              </button>
              <nav
                ref={dropdownRef}
                className={`bg-white p-2 border border-gray-100 rounded-3xl space-y-2 shadow-lg absolute top-12 right-0 font-medium text-gray-900 w-56 overflow-hidden ${
                  isMenuOpen ? `block z-50` : `hidden`
                }`}
              >
                <Button onClick={() => copyUrlToClipboard()}>
                  {isUrlCopied ? 'Copied!' : 'Copy URL'}
                </Button>
                <Button color={'gray'} onClick={() => copyEmbedToClipboard()}>
                  {isEmbedCopied ? 'Copied!' : 'Copy Embed Code'}
                </Button>
              </nav>
            </div>
          </div>
          <div className={'w-full grid grid-cols-1 md:grid-cols-2 gap-4'}>
            <div
              className={'p-4 space-y-4 border-2 border-gray-100 rounded-3xl'}
            >
              <div className={'-space-y-1'}>
                <div className={'text-lg font-medium text-gray-400'}>
                  Earnings
                </div>
                <div className={'text-2xl font-semibold text-gray-900'}>
                  {utils.formatEther(split.total_funds)} ETH
                </div>
              </div>
              <div className={'font-medium text-sm text-gray-400'}>
                Earnings are split among recipients based on their ownership.
              </div>
              <Button color={'pink'} onClick={() => setIsModalOpen(true)}>
                <CreditCard
                  size={20}
                  strokeWidth={2.5}
                  className={'opacity-60 mr-2'}
                />
                Send Funds
              </Button>
            </div>
            <div
              className={'p-4 space-y-4 border-2 border-gray-100 rounded-3xl'}
            >
              <div className={'-space-y-1'}>
                <div className={'text-lg font-medium text-gray-400'}>
                  Balance
                </div>
                <div className={'text-2xl font-semibold text-gray-900'}>
                  {utils.formatEther(split.current_funds)} ETH
                </div>
              </div>
              <div className={'font-medium text-sm text-gray-400'}>
                Earn {utils.formatEther(split.current_funds.div(100))} ETH by
                paying the gas required to split funds.
              </div>
              <Button color={'purple'} onClick={distributeFunds}>
                <Divide
                  size={20}
                  strokeWidth={2.5}
                  className={'opacity-60 mr-2'}
                />
                Split Funds
              </Button>
            </div>
          </div>
        </div>

        <div className={'space-y-2'}>
          <div className={'flex items-center justify-between px-2'}>
            <div className={'text-xl font-medium'}>
              {split.recipients.length} Recipients
            </div>
            <div
              className={
                'text-sm uppercase font-semibold text-gray-300 tracking-wide flex items-center space-x-4'
              }
            >
              <div className={''}>Earnings</div>
              <div className={'w-16'}>Owned</div>
            </div>
          </div>
          {split.recipients.map((r, i) => {
            return <Recipient key={i} split={split} recipient={r} />
          })}
          <div
            className={
              'flex items-cener justify-between font-semibold text-gray-900 px-2'
            }
          >
            <div></div>
            <div className={'flex items-center space-x-4'}>
              <div className={'text-right'}>
                {utils.formatEther(split.total_funds)} ETH
              </div>
              <div className={'w-16'}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
