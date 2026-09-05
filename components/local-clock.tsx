'use client';

import { Clock } from 'pixelarticons/react/Clock';
import { useSyncExternalStore } from 'react';
import { formatLocalTime } from '@/lib/local-time.mjs';

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 1000);
  return () => window.clearInterval(timer);
}

const getSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => null;

export function LocalClock() {
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = tick === null ? null : new Date(tick * 1000);
  const local = now ? formatLocalTime(now) : null;

  return (
    <div className="local-clock" aria-label="Local time in Jamshedpur, India">
      <div className="local-clock-place">
        <Clock aria-hidden="true" /> JAMSHEDPUR, IN
      </div>
      <div className="local-clock-face">
        <time dateTime={now?.toISOString()}>{local?.time ?? '--:--:--'}</time>
        <span>
          IST
          <br />
          UTC +5:30
        </span>
      </div>
      <span className="local-clock-date">
        {local?.date ?? 'India Standard Time'}
      </span>
    </div>
  );
}
