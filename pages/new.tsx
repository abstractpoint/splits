import React from 'react'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import Button from 'components/Button'
import Title from 'components/Title'

export default function New(): JSX.Element {
  const router = useRouter()
  return (
    <Layout>
      <Title value="New Split | Splits" />
      <div className={'flex items-center justify-between'}>
        <div className="text-4xl font-semibold text-gray-900">New Split</div>
        <div className={'py-4 flex items-center space-x-4 text-xl'}>
          <Button color={'gray'} compact onClick={() => router.push('/')}>
            Close
          </Button>
        </div>
      </div>
      <div className={'py-4 space-y-4'}>
        <div className={'text-xl'}>New split</div>
      </div>
    </Layout>
  )
}
