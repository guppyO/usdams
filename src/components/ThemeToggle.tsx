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
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <div className="h-8 w-8" />
        <div className="h-8 w-8" />
        <div className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
      <button
        onClick={() => setTheme('light')}
        className={`rounded-md p-2 transition-colors ${
          theme === 'light'
            ? 'bg-white text-amber-500 shadow-sm dark:bg-slate-700'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`rounded-md p-2 transition-colors ${
          theme === 'system'
            ? 'bg-white text-cyan-500 shadow-sm dark:bg-slate-700'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        aria-label="System preference"
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`rounded-md p-2 transition-colors ${
          theme === 'dark'
            ? 'bg-white text-indigo-500 shadow-sm dark:bg-slate-700'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
