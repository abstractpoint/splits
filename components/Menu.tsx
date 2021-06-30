import * as React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import makeBlockie from 'ethereum-blockies-base64'
import Button from 'components/Button'
import { useEthers } from '@usedapp/core'

function ErrorWrapper({ error }: { error: string }) {
  return (
    <div
      className={`fixed top-0 inset-x-0 bg-red-100 text-red-500 text-center p-1`}
    >
      {error}
    </div>
  )
}

function ConnectButton() {
  const { activateBrowserWallet } = useEthers()
  const [activateError, setActivateError] = useState<string>('')
  const { error } = useEthers()
  useEffect(() => {
    if (error) {
      setActivateError(error.message)
      setTimeout(() => {
        setActivateError('')
      }, 3000)
    }
  }, [error])

  const activate = async () => {
    setActivateError('')
    activateBrowserWallet()
  }
  return (
    <>
      {activateError != '' && <ErrorWrapper error={activateError} />}
      <Button color={'blue'} compact onClick={() => activate()}>
        Connect
      </Button>
    </>
  )
}

export default function Menu(): JSX.Element {
  const router = useRouter()
  const { account, deactivate } = useEthers()
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  const disconnectWallet = async () => {
    deactivate()
    setIsAccountOpen(false)
  }

  const [isCopied, setIsCopied] = useState<boolean>(false)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(account || '')
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
      setIsAccountOpen(false)
    }, 800)
  }

  return (
    <div className={'flex items-center justify-between pb-4'}>
      {router.pathname !== '/' ? (
        <Link href={'/'}>
          <img
            src={'/splits_logo.png'}
            className={'w-12 h-12 cursor-pointer hover:opacity-80 transition'}
          />
        </Link>
      ) : (
        <img src={'/splits_logo.png'} className={'w-12 h-12'} />
      )}
      <div className={'flex items-center space-x-4 relative'}>
        {account ? (
          <>
            {router.pathname !== '/new' && (
              <Button compact onClick={() => router.push('/new')}>
                New Split
              </Button>
            )}
            <Button
              isActive={isAccountOpen}
              compact
              onClick={() => setIsAccountOpen(!isAccountOpen)}
            >
              <img
                src={makeBlockie(account)}
                className={'w-4 h-4 rounded-lg mr-2'}
              />
              {account.slice(0, 6)}
            </Button>
            <nav
              className={`bg-white p-4 border border-gray-100 rounded-3xl space-y-2 shadow-lg absolute right-0 top-12 font-medium text-gray-900 w-56 overflow-hidden ${
                isAccountOpen ? `block z-50` : `hidden`
              }`}
            >
              <Button onClick={() => copyToClipboard()}>
                {isCopied ? 'Copied!' : 'Copy Address'}
              </Button>
              <Button color={'gray'} onClick={() => disconnectWallet()}>
                Disconnect
              </Button>
            </nav>
          </>
        ) : (
          <ConnectButton />
        )}
      </div>
    </div>
  )
}
