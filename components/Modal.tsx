import * as React from 'react'

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean
  onClose: React.MouseEventHandler
  title: string
  children: React.ReactNode
}): JSX.Element | null {
  if (isOpen) {
    return (
      <div
        className={`fixed inset-y-0 inset-x-0 bg-black bg-opacity-20 blurred flex items-center justify-center overflow-y-hidden z-40`}
      >
        <div
          className={`bg-white rounded-3xl shadow max-w-md w-full mx-2 sm:mx-auto overflow-hidden block z-50`}
        >
          <div className={'p-4 space-y-2'}>
            <div className={'text-xl font-medium'}>{title}</div>
            {children}
          </div>
          <button
            onClick={onClose}
            className={
              'w-full p-4 text-lg font-medium bg-gray-50 hover:bg-gray-100 text-gray-500 focus:outline-none transition'
            }
          >
            Close
          </button>
        </div>
      </div>
    )
  } else return null
}

export default Modal
