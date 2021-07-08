import * as React from 'react'
import { useRouter } from 'next/router'
import { useSplits } from 'context/splitsContext'
import Title from 'components/Title'
import Link from 'next/link'
import Layout from 'components/Layout'
import Menu from 'components/Menu'
import SplitDetail from 'components/SplitDetail'

export default function Split(): JSX.Element {
  const router = useRouter()
  const splitAddress = router.query.split as string
  const { getSplitByAddress } = useSplits()
  const split = getSplitByAddress(splitAddress)

  // TODO: if split doesn't exist
  if (!split) return <div>no such split</div>

  return (
    <Layout>
      <Title value="Split | Splits" />
      <Menu />
      <div className={'py-4 space-y-4'}>
        <Link href={'/'}>
          <a
            className={
              'font-semibold text-lg text-gray-400 hover:text-gray-600 transition'
            }
          >
            &larr; Back
          </a>
        </Link>
        <SplitDetail split={split} />
      </div>
    </Layout>
  )
}
