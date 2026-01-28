'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface NumberTickerProps {
  value: number;
  className?: string;
  delay?: number;
}

export function NumberTicker({ value, className, delay = 0 }: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // If already animated or no value, skip
    if (hasAnimated || value === 0) return;

    // Small delay to ensure component is mounted and visible
    const startTimer = setTimeout(() => {
      setHasAnimated(true);

      const duration = 1500;
      const steps = 40;
      const increment = value / steps;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        const current = Math.min(Math.round(increment * step), value);
        setDisplayValue(current);

        if (step >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay + 100);

    return () => clearTimeout(startTimer);
  }, [value, delay, hasAnimated]);

  // Ensure final value is always correct
  useEffect(() => {
    if (hasAnimated && displayValue !== value) {
      setDisplayValue(value);
    }
  }, [value, hasAnimated, displayValue]);

  return (
    <span
      ref={ref}
      className={cn('tabular-nums', className)}
    >
      {displayValue.toLocaleString()}
    </span>
  );
}
