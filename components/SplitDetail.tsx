import * as React from 'react'
import { useState } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Button from 'components/Button'
import {
  useEthers,
  getExplorerAddressLink,
  shortenAddress,
} from '@usedapp/core'
import { ExternalLink, Share } from 'react-feather'

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

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

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
      `<iframe src="http://localhost:3000/embed/${split.address}" width="100%" height="380" frameBorder="0" allowtransparency="true"></iframe>`,
    )
    setEmbedIsCopied(true)
    setTimeout(() => {
      setEmbedIsCopied(false)
      setIsMenuOpen(false)
    }, 800)
  }

  return (
    <div className={'p-4 shadow border border-gray-100 rounded-3xl space-y-6'}>
      <div className={'space-y-2'}>
        <div className={'flex items-center justify-between relative'}>
          <div className={'text-2xl font-semibold text-gray-900'}>
            {split.name} {isEmbedded && 'isEmbedded'}
          </div>
          <Button
            compact
            color={'purple'}
            onClick={() => console.log('Send funds')}
          >
            Send Funds
          </Button>
        </div>
        <div className={`flex items-center space-x-4 relative`}>
          <a
            href={chainId && getExplorerAddressLink(split.address, chainId)}
            className={
              'px-2 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 font-medium flex items-center space-x-1 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none transition'
            }
          >
            <ExternalLink size={16} strokeWidth={2.5} />
            <div>{split.address.substring(0, 6)}</div>
          </a>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`px-2 py-1 rounded-xl ${
              isMenuOpen
                ? `bg-gray-100 text-gray-600`
                : `bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600`
            } font-medium flex items-center space-x-1 cursor-pointer focus:outline-none transition`}
          >
            <Share size={16} strokeWidth={2.5} />
            <div>Share</div>
          </button>
          <nav
            className={`bg-white p-4 border border-gray-100 rounded-3xl space-y-2 shadow-lg absolute top-10 font-medium text-gray-900 w-56 overflow-hidden ${
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
      {split.current_funds > 0 && (
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
