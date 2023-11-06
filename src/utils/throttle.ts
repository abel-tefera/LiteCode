const throttle = (func: (...args: any[]) => void, delay: number) => {
  let inProgress = false;
  return (...args: any[]) => {
    if (inProgress) {
      return;
    }
    inProgress = true;
    setTimeout(() => {
      func(...args);
      inProgress = false;
    }, delay);
  };
};

export default throttle;
