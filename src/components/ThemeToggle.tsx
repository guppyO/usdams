'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        <div className="h-8 w-8" />
        <div className="h-8 w-8" />
        <div className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <button
        onClick={() => setTheme('light')}
        className={`rounded-md p-2 transition-colors ${
          theme === 'light'
            ? 'bg-background text-amber-500 shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`rounded-md p-2 transition-colors ${
          theme === 'system'
            ? 'bg-background text-cyan-500 shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="System preference"
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`rounded-md p-2 transition-colors ${
          theme === 'dark'
            ? 'bg-background text-indigo-500 shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
