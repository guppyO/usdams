import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://usdamsdata.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'US Dams Database - National Inventory of Dams | 91,000+ Dams',
    template: '%s | US Dams Database',
  },
  description:
    'Explore the complete National Inventory of Dams with 91,000+ dams across the United States. Search by state, county, hazard level, purpose, and owner type. Find dam locations, specifications, inspection records, and safety information.',
  keywords: [
    'dams',
    'US dams',
    'National Inventory of Dams',
    'NID',
    'dam safety',
    'dam inspection',
    'hazard potential',
    'high hazard dams',
    'dam locations',
    'reservoir',
    'dam height',
    'dam database',
  ],
  authors: [{ name: 'US Dams Database' }],
  creator: 'US Dams Database',
  publisher: 'US Dams Database',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/icon',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'US Dams Database',
    title: 'US Dams Database - National Inventory of Dams',
    description:
      'Explore 91,000+ dams across the United States. Search by state, hazard level, purpose, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'US Dams Database',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Dams Database - National Inventory of Dams',
    description:
      'Explore 91,000+ dams across the United States. Search by state, hazard level, purpose, and more.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: 'JG4lGon_1fMuzWooVG1H1UtwvdE1XlqoRWthg9vJpJM',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1226435955298586"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <ThemeProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
