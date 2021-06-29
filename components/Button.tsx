import * as React from 'react'

interface IButton {
  children: React.ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
  color?: string
  compact?: boolean
  isDisabled?: boolean
  isActive?: boolean
  type?: 'button' | 'submit' | 'reset' | undefined
}

export default function Button(btn: IButton): JSX.Element {
  const buttonColor = btn.color ? btn.color : 'gray'
  return (
    <button
      onClick={btn.isDisabled ? undefined : btn.onClick}
      type={btn.type ? btn.type : 'button'}
      className={`rounded-2xl bg-${buttonColor}-500 bg-opacity-5 text-${buttonColor}-500 text-base px-4 py-2.5 ${
        !btn.compact && `w-full`
      } flex items-center justify-center font-semibold focus:outline-none transition ${
        btn.isDisabled
          ? `disabled opacity-20 cursor-default`
          : btn.isActive
          ? `bg-opacity-10`
          : `hover:bg-opacity-10`
      }
      }`}
    >
      {btn.children}
    </button>
  )
}
