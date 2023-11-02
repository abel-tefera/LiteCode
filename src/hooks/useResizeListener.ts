import React from 'react';

const useResizeListener = (element: any, handleResize: any, throttle = 800) => {
  const resizingTimer = React.useRef<any>();
  const listenToResize = React.useCallback(
    (e: any) => {
      window.removeEventListener('resize', listenToResize);
      clearTimeout(resizingTimer.current);
      resizingTimer.current = setTimeout(
        () => window.addEventListener('resize', listenToResize),
        throttle,
      );
      handleResize(e);
    },
    [throttle, element, handleResize],
  );

  React.useEffect(() => {
    const currentElement = element.current;
    if (currentElement) {
      window.addEventListener('resize', listenToResize);
    }
    return () => {
      window.removeEventListener('resize', listenToResize);
      clearTimeout(resizingTimer.current);
    };
  }, [element]);
};

export default useResizeListener;
