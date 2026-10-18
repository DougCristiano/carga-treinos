import { useEffect, useState } from 'react';

/** Re-renderiza a cada `interval` ms enquanto `enabled` for verdadeiro. */
export function useNow(interval = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval, enabled]);
  return now;
}
