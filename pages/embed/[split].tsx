import * as React from 'react'
import { useRouter } from 'next/router'
import { useSplits } from 'context/splitsContext'
import Title from 'components/Title'
import SplitDetail from 'components/SplitDetail'

export default function Split(): JSX.Element {
  const router = useRouter()
  const splitAddress = router.query.split as string
  const { getSplitByAddress } = useSplits()
  const split = getSplitByAddress(splitAddress)

  // TODO: if split doesn't exist
  if (!split) return <div>no such split</div>

  return (
    <div className={'p-1'}>
      <Title value="Splits" />
      <SplitDetail split={split} />
    </div>
  )
}
