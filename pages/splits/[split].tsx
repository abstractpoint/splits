import * as React from 'react'
import Title from 'components/Title'
import Link from 'next/link'
import Layout from 'components/Layout'
import Menu from 'components/Menu'
import SplitDetail from 'components/SplitDetail'

const split = {
  address: '0x1022a225cd49fa3c73c9094730a16e5f70ff015b',
  name: 'This is a split!',
  created_by: '0xc649fca6524014433aeeb926f26dddf984216322',
  current_funds: 20,
  total_funds: 30,
  recipients: [
    {
      address: '0x1147086E32B5e372cB7Bce946e4De22171DEc49f',
      ownership: 50.0,
    },
    {
      address: '0xeb78334dfde3afbc2b904f06153f59cc80ee07fa',
      ownership: 50.0,
    },
  ],
}

export default function Split(): JSX.Element {
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
