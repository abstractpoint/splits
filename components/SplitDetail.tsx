import * as React from 'react'
import { useState, useRef } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Identicon from 'react-identicons'
import Button from 'components/Button'
import { useDetectOutsideClick } from './useDetectOutsideClick'
import {
  useEthers,
  getExplorerAddressLink,
  shortenAddress,
} from '@usedapp/core'
import { CreditCard, Share } from 'react-feather'

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
  recipients: IRecipient[]
}

function DistributeFunds({ amount }: { amount: number }) {
  const { account } = useEthers()
  return (
    <div
      className={
        'p-4 bg-blue-50 text-blue-500 font-medium rounded-xl space-y-4 md:space-y-0 md:flex md:items-center'
      }
    >
      <div className={'flex-grow'}>
        Earn ${(amount * 0.01).toFixed(4)} ETH by making these funds claimable.
      </div>
      {/* Display CTA to distribute funds only if wallet is connected */}
      {account && (
        <div>
          <Button
            compact
            color={'blue'}
            onClick={() => alert('Distribute funds')}
          >
            Distribute
          </Button>
        </div>
      )}
    </div>
  )
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
      <div className={''}>{recipient.ownership?.toFixed(1)}%</div>
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
  const { chainId } = useEthers()

  const dropdownRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useDetectOutsideClick(dropdownRef, false)

  const [isAddressCopied, setAddressIsCopied] = useState<boolean>(false)
  function copyAddressToClipboard() {
    navigator.clipboard.writeText(split.address || '')
    setAddressIsCopied(true)
    setTimeout(() => {
      setAddressIsCopied(false)
      setIsMenuOpen(false)
    }, 800)
  }

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

  return (
    <div className={'bg-white rounded-3xl p-4 space-y-6'}>
      <div className={'space-y-6 flex flex-col items-center justify-center'}>
        <div
          className={
            'flex flex-col items-center justify-center space-y-2 border-4 border-gray-50 rounded-3xl p-4'
          }
        >
          <Identicon string={split.address} size={120} />
        </div>
        <div className={'grid grid-cols-2 gap-4 relative'}>
          <Button onClick={() => console.log('Send funds')}>
            <CreditCard
              size={20}
              strokeWidth={2.5}
              className={'opacity-60 mr-2'}
            />
            Send Funds
          </Button>
          <Button
            isActive={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Share size={20} strokeWidth={2.5} className={'opacity-60 mr-2'} />
            Share Split
          </Button>
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
            <Button onClick={() => copyAddressToClipboard()}>
              {isAddressCopied ? 'Copied!' : 'Copy Address'}
            </Button>
          </nav>
        </div>
      </div>
      {split.current_funds > 0 && !isEmbedded && (
        <DistributeFunds amount={split.current_funds} />
      )}
      <div className={'space-y-2'}>
        <div className={'text-xl font-medium'}>
          {split.recipients.length} Recipients
        </div>
        <div className={'space-y-1'}>
          {split.recipients.map((i) => {
            return <Recipient key={i.address} recipient={i} />
          })}
        </div>
      </div>
    </div>
  )
}
