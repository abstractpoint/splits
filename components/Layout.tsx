import React from 'react'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <main className={'max-w-xl mx-auto p-4 md:p-0 md:py-8'}>{children}</main>
  )
}
