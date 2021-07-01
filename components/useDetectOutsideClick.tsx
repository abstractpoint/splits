import { useState, useEffect, RefObject } from 'react'

export const useDetectOutsideClick = (
  ref: RefObject<HTMLElement>,
  initialState: boolean,
) => {
  const [isActive, setIsActive] = useState(initialState)

  useEffect(() => {
    const pageClickEvent = (event: MouseEvent) => {
      // If the active element exists and is clicked outside of
      if (ref.current !== null && !ref.current.contains(event.target as Node)) {
        setIsActive(!isActive)
      }
    }

    // If the item is active (ie open) then listen for clicks
    if (isActive) {
      window.addEventListener('click', pageClickEvent)
    }

    return () => {
      window.removeEventListener('click', pageClickEvent)
    }
  }, [isActive, ref])

  return [isActive, setIsActive] as const
}
