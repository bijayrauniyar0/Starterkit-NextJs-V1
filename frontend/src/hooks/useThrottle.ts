import { useEffect, useRef, useState } from "react";

export function useThrottle<T>(value: T, interval = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();

    if (lastUpdated.current === 0) {
      lastUpdated.current = now;
      return;
    }

    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const id = window.setTimeout(
        () => {
          lastUpdated.current = Date.now();
          setThrottledValue(value);
        },
        interval - (now - lastUpdated.current),
      );

      return () => window.clearTimeout(id);
    }
  }, [value, interval]);

  return throttledValue;
}
