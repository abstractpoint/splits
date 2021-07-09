import * as React from 'react'
import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import makeBlockie from 'ethereum-blockies-base64'
import { Identicon } from '@lidofinance/identicon'
import Button from 'components/Button'
import { useDetectOutsideClick } from './useDetectOutsideClick'
import { useForm, SubmitHandler } from 'react-hook-form'
import { utils, BigNumber } from 'ethers'
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
  recentlyAdded,
}: {
  split: ISplit
  recipient: IRecipient
  recentlyAdded: BigNumber
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
              .add(recentlyAdded)
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

export default function SplitDetail({
  split,
  isEmbedded,
}: {
  split: ISplit
  isEmbedded?: boolean
}): JSX.Element {
  const { splitMain } = useSplits()
  const dropdownRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useDetectOutsideClick(dropdownRef, false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
  // TODO: why is this showing up as undefined?
  const etherBalance = useEtherBalance(account)

  type Inputs = {
    amount: string
  }

  // TODO: reconsider
  const [recentlyAdded, setRecentlyAdded] = useState<BigNumber>(
    BigNumber.from(0),
  )
  const sendFunds = useCallback(
    ({ amount }: { amount: string }) => {
      if (library && account)
        (async () => {
          // TODO: move into hook
          const sendFundsTx = await splitMain.receiveSplitFunds(split.address, {
            value: utils.parseEther(amount).toString(),
          })
          const toastId = toast.loading('Sending funds...')
          // TODO: add try/catch
          const sendFundsReceipt = await sendFundsTx.wait()
          // TODO (ad): add success / error ui notifications
          if (sendFundsReceipt.status == 1) {
            toast.success('Funds sent!', {
              id: toastId,
            })
            setRecentlyAdded(utils.parseEther(amount))
          } else {
            toast.error('Error sending funds', {
              id: toastId,
            })
          }
          setIsModalOpen(false)
        })()
    },
    [library, account, split.address, setRecentlyAdded],
  )

  // TODO: reconsider
  const [recentlyDistributed, setRecentlyDistributed] = useState<BigNumber>(
    BigNumber.from(0),
  )
  const distributeFunds = useCallback(() => {
    if (library && account)
      (async () => {
        // TODO: move into hook
        const accounts = split.recipients.map((r) => r.address)
        const percentAllocations = split.recipients.map((r) => r.ownership || 0)
        const distributeSplitTx = await splitMain.distributeSplitBalance(
          split.address,
          accounts,
          percentAllocations,
        )
        const toastId = toast.loading('Splitting funds...')
        // TODO: add try/catch
        const distributeSplitReceipt = await distributeSplitTx.wait()
        if (distributeSplitReceipt.status == 1) {
          toast.success('Funds split!', {
            id: toastId,
          })
          setRecentlyDistributed(split.current_funds.add(recentlyAdded))
        } else {
          toast.error('Error splitting funds', {
            id: toastId,
          })
        }
      })()
  }, [library, account, split.address, recentlyAdded, setRecentlyDistributed])

  const { register, handleSubmit } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => sendFunds(data)

  /* useEffect(() => {
   *   const event;

   *   splitMain.on(event, listener)
   *   return () => splitMain.off(event, listener)
   * }, []) */

  return (
    <div>
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
              <Identicon address={split.address} diameter={48} />
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
                  {utils.formatEther(split.total_funds.add(recentlyAdded))} ETH
                </div>
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
                  Pending
                </div>
                <div className={'text-2xl font-semibold text-gray-900'}>
                  {utils.formatEther(
                    split.current_funds
                      .add(recentlyAdded)
                      .sub(recentlyDistributed),
                  )}{' '}
                  ETH
                </div>
              </div>
              <Button
                color={'blue'}
                isDisabled={split.current_funds
                  .add(recentlyAdded)
                  .sub(recentlyDistributed)
                  .eq(0)}
                onClick={distributeFunds}
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
          {split.recipients.map((r, i) => {
            return (
              <Recipient
                key={i}
                split={split}
                recipient={r}
                recentlyAdded={recentlyAdded}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
