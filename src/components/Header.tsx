'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronDown, Waves } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';

const navigation = [
  { name: 'Browse Dams', href: '/browse' },
  { name: 'By State', href: '/state' },
  {
    name: 'By Hazard',
    href: '/hazard',
    children: [
      { name: 'High Hazard', href: '/hazard/high' },
      { name: 'Significant Hazard', href: '/hazard/significant' },
      { name: 'Low Hazard', href: '/hazard/low' },
    ],
  },
  {
    name: 'By Purpose',
    href: '/purpose',
    children: [
      { name: 'Recreation', href: '/purpose/recreation' },
      { name: 'Water Supply', href: '/purpose/water-supply' },
      { name: 'Flood Risk Reduction', href: '/purpose/flood-risk-reduction' },
      { name: 'Fire Protection', href: '/purpose/fire-protection-stock-or-small-fish-pond' },
      { name: 'Irrigation', href: '/purpose/irrigation' },
      { name: 'All Purposes', href: '/purpose' },
    ],
  },
  {
    name: 'By Owner',
    href: '/owner',
    children: [
      { name: 'Private', href: '/owner/private' },
      { name: 'Local Government', href: '/owner/local-government' },
      { name: 'State', href: '/owner/state' },
      { name: 'Federal', href: '/owner/federal' },
      { name: 'Public Utility', href: '/owner/public-utility' },
      { name: 'All Owner Types', href: '/owner' },
    ],
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-accent transition-colors">
          <Waves className="h-7 w-7 text-accent" />
          <span className="hidden sm:inline">US Dams Database</span>
          <span className="sm:hidden">USDAMS</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-6">
          {navigation.map((item) => (
            <div key={item.name} className="relative">
              {item.children ? (
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">
                    {item.name}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {openDropdown === item.name && (
                    <div className="absolute left-0 top-full z-50 pt-2">
                      <div className="w-52 rounded-lg border border-border bg-card p-2 shadow-xl">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Right side - Search, Theme Toggle, Mobile Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <SearchBar />
          </div>
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden rounded-md p-2 text-foreground-secondary hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Search */}
            <div className="pb-3 md:hidden">
              <SearchBar />
            </div>

            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div className="space-y-1">
                    <span className="block px-3 py-2 text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                    <div className="pl-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block rounded-md px-3 py-2 text-sm text-foreground-secondary hover:bg-muted hover:text-foreground transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground-secondary hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
