import { RefObject, useEffect } from 'react';

const useOutsideAlerter = (
  ref: RefObject<HTMLElement | null>,
  callback: React.Dispatch<React.SetStateAction<boolean>> | (() => void)
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

export default useOutsideAlerter;
