import * as React from 'react'
import { useState, useRef } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Identicon from 'react-identicons'
import Button from 'components/Button'
import { useDetectOutsideClick } from './useDetectOutsideClick'
import { useForm, SubmitHandler } from 'react-hook-form'
import {
  useEthers,
  useEtherBalance,
  getExplorerAddressLink,
  shortenAddress,
} from '@usedapp/core'
import { formatEther } from '@ethersproject/units'
import { CreditCard, Link, Divide } from 'react-feather'
import Modal from './Modal'

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
      <div className={'flex items-center space-x-4'}>
        <div className={'opacity-60 text-right'}>
          {(recipient.ownership || 0 * 0.5).toFixed(2)} ETH
        </div>
        <div className={'w-16'}>{recipient.ownership?.toFixed(1)}%</div>
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

  const { account, chainId } = useEthers()
  const etherBalance = useEtherBalance(account)

  type Inputs = {
    amount: string
  }

  function sendFunds({ amount }: { amount: string }) {
    setIsSendingFunds(true)
    console.log({ amount: amount, to: split.address, from: account })
    setIsModalOpen(false)
    setTimeout(() => {
      setIsSendingFunds(false)
    }, 3000)
  }

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
                  type={'number'}
                  autoFocus
                  defaultValue="test"
                  {...register('amount', {
                    valueAsNumber: true,
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
                  {split.total_funds.toFixed(2)} ETH
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
                  {split.current_funds.toFixed(2)} ETH
                </div>
              </div>
              <div className={'font-medium text-sm text-gray-400'}>
                Earn {(split.current_funds * 0.01).toFixed(2)} ETH by paying the
                gas required to split funds.
              </div>
              <Button
                color={'purple'}
                onClick={() => console.log('Send funds')}
              >
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
          {split.recipients.map((i) => {
            return <Recipient key={i.address} recipient={i} />
          })}
          <div
            className={
              'flex items-cener justify-between font-semibold text-gray-900 px-2'
            }
          >
            <div></div>
            <div className={'flex items-center space-x-4'}>
              <div className={'text-right'}>
                {split.total_funds.toFixed(2)} ETH
              </div>
              <div className={'w-16'}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
