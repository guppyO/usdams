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
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), value);
        setDisplayValue(current);

        if (step >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [hasStarted, value, delay]);

  return (
    <span
      ref={ref}
      className={cn('tabular-nums', className)}
    >
      {displayValue.toLocaleString()}
    </span>
  );
}
