'use client';

import { CodeGloss } from 'codegloss/react';
import type { Annotation, Connection } from 'codegloss/react';

const CODE = `function useThrottle<T>(value: T, interval = 500) {
  const [throttled, setThrottled] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottled(value);
    } else {
      const id = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottled(value);
      }, interval);

      return () => clearTimeout(id);
    }
  }, [value, interval]);

  return throttled;
}`;

const ANNOTATIONS: Annotation[] = [
  { id: 'a1', token: 'throttled', line: 1, occurrence: 0, title: 'Throttled state', text: 'Holds the most recently emitted value. Updates at most once per interval.' },
  { id: 'a2', token: 'lastUpdated', line: 2, occurrence: 0, title: 'Timestamp ref', text: 'Tracks when the output last changed. Persists across renders without causing re-renders.' },
  { id: 'a3', token: 'now >= lastUpdated.current + interval', line: 6, occurrence: 0, title: 'Cooldown check', text: 'If enough time has passed since the last emit, update immediately. Otherwise, schedule a delayed update.' },
  { id: 'a4', token: 'setTimeout', line: 10, occurrence: 0, title: 'Trailing edge', text: 'Schedules the final update to fire after the interval. Cleaned up if the value changes before it fires.' },
  { id: 'a5', token: 'clearTimeout', line: 15, occurrence: 0, title: 'Cleanup', text: 'Cancels any pending update when the value or interval changes, preventing stale writes.' },
];

const CONNECTIONS: Connection[] = [
  { from: 'a2', to: 'a3', color: '#534AB7' },
  { from: 'a4', to: 'a5', color: '#0F6E56' },
];

export function HeroDemo() {
  return (
    <CodeGloss
      code={CODE}
      lang="ts"
      filename="use-throttle.ts"
      theme="github-light"
      annotations={ANNOTATIONS}
      connections={CONNECTIONS}
      runnable={false}
    />
  );
}
