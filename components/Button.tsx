import React from 'react'

interface IButton {
  children: React.ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
  color?: string
  compact?: boolean
  isDisabled?: boolean
  type?: 'button' | 'submit' | 'reset' | undefined
}

export default function Button(btn: IButton): JSX.Element {
  const buttonColor = btn.color ? btn.color : 'purple'
  return (
    <button
      onClick={btn.isDisabled ? null : btn.onClick}
      type={btn.type ? btn.type : 'button'}
      className={`rounded-2xl bg-${buttonColor}-50 text-${buttonColor}-500 text-base px-4 py-2.5 ${
        !btn.compact && `w-full`
      } flex items-center justify-center font-semibold focus:outline-none focus:ring-2 focus:ring-${buttonColor}-200 transition ${
        btn.isDisabled
          ? `disabled opacity-20 cursor-default`
          : `hover:text-${buttonColor}-400`
      }`}
    >
      {btn.children}
    </button>
  )
}
