import { useEffect } from 'react'

export default function useOutsideAlerter (ref: React.RefObject<HTMLElement> | any, callback: any) {
  useEffect(() => {
    function handleClickOutside (event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback])
}
