import React from 'react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Button from 'components/Button'
import Layout from 'components/Layout'
import Title from 'components/Title'
import { useEthers } from '@usedapp/core'

function ErrorWrapper({ error }: { error: string }) {
  return (
    <div
      className={
        'fixed top-0 inset-x-0 bg-red-100 text-red-500 text-center p-2'
      }
    >
      {error}
    </div>
  )
}

function Menu() {
  const router = useRouter()

  const { account, activateBrowserWallet } = useEthers()

  const [activateError, setActivateError] = useState<string>('')

  const { error } = useEthers()
  useEffect(() => {
    if (error) {
      setActivateError(error.message)
    }
  }, [error])

  const activate = async () => {
    setActivateError('')
    activateBrowserWallet()
  }

  return (
    <div className={'py-4 flex items-center space-x-4'}>
      {activateError != '' && <ErrorWrapper error={activateError} />}
      {account ? (
        <>
          <Button
            color={'blue'}
            compact
            onClick={() => router.push('/account')}
          >
            <img
              src={makeBlockie(account)}
              className={'w-6 h-6 rounded-full mr-2'}
            />
            Account
          </Button>
          <Button color={'purple'} compact onClick={() => router.push('/new')}>
            New Split
          </Button>
        </>
      ) : (
        <Button color={'blue'} compact onClick={() => activate()}>
          Connect
        </Button>
      )}
    </div>
  )
}

export default function Home(): JSX.Element {
  return (
    <Layout>
      <Title value="Splits" />
      <div className={'flex items-center justify-between'}>
        <div className="text-4xl font-semibold text-gray-900">Splits</div>
        <Menu />
      </div>
      <div className={'py-4 space-y-4'}>
        <div className={'text-xl'}>Hello world!</div>
      </div>
    </Layout>
  )
}
