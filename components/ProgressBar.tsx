import React from 'react'

export default function ProgressBar({
  minLabel,
  maxLabel,
  fill,
  currentAmount,
  maxAmount,
  unit,
  isError,
}: {
  minLabel: string
  maxLabel: string
  fill: number
  currentAmount: number
  maxAmount: number
  unit?: string
  isError?: boolean
}): JSX.Element {
  return (
    <div>
      <div className={`h-4 relative max-w-xl rounded-full overflow-hidden`}>
        <div className={'w-full h-full bg-purple-100 absolute'} />
        <div
          className={'h-full bg-purple-500 absolute'}
          style={{ width: `${fill}%` }}
        />
      </div>
      <div className={'pt-2 flex items-center justify-between'}>
        <div className={'-space-y-1'}>
          <div className={'text-sm uppercase text-gray-300 font-semibold'}>
            {minLabel}
          </div>
          <div
            className={`text-xl font-bold ${
              isError ? `text-red-500` : `text-gray-900`
            }`}
          >
            {currentAmount}
            {unit}
          </div>
        </div>
        <div className={'-space-y-1 text-right'}>
          <div className={'text-sm uppercase text-gray-300 font-semibold'}>
            {maxLabel}
          </div>
          <div
            className={`text-xl font-bold ${
              isError ? `text-red-500` : `text-gray-900`
            }`}
          >
            {maxAmount.toString()}
            {unit}
          </div>
        </div>
      </div>
    </div>
  )
}
