import React from 'react';

export const useOfferCountdown = (seconds: number) => {
  const [left, setLeft] = React.useState(seconds);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLeft((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { left, finished: left === 0 };
};
