'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, MapPin, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  state: string;
  county: string;
  hazard_potential: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  const searchDams = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchDams(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchDams]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToResult(results[selectedIndex]);
        } else if (query.length >= 2) {
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const navigateToResult = (result: SearchResult) => {
    router.push(`/dam/${result.slug}`);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const getHazardColor = (hazard: string) => {
    switch (hazard?.toLowerCase()) {
      case 'high':
        return 'text-hazard-high';
      case 'significant':
        return 'text-hazard-significant';
      case 'low':
        return 'text-hazard-low';
      default:
        return 'text-hazard-undetermined';
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search dams..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-lg border border-border bg-card shadow-lg"
        >
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => navigateToResult(result)}
              className={clsx(
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                index === selectedIndex
                  ? 'bg-muted'
                  : 'hover:bg-muted/50'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">
                  {result.name || 'Unnamed Dam'}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {result.county}, {result.state}
                  </span>
                </div>
              </div>
              {result.hazard_potential && (
                <div className={clsx('flex items-center gap-1 text-xs', getHazardColor(result.hazard_potential))}>
                  <AlertTriangle className="h-3 w-3" />
                  <span>{result.hazard_potential}</span>
                </div>
              )}
            </button>
          ))}
          <div className="border-t border-border px-4 py-2">
            <button
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                setIsOpen(false);
              }}
              className="text-xs text-accent hover:underline"
            >
              View all results for "{query}"
            </button>
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground shadow-lg"
        >
          No dams found for "{query}"
        </div>
      )}
    </div>
  );
}
