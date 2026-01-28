import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://usdams.com';

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
    ],
    apple: '/favicon.svg',
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
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <ThemeProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
