import React from 'react'
import Head from 'next/head'

export default function Title({ value }: { value: string }): JSX.Element {
  return (
    <Head>
      <title>{value}</title>
      <link rel="icon" href="/favicon.svg" />
    </Head>
  )
}
