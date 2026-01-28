import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://usdams.com';

export async function GET() {
  const staticPages = [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/browse', priority: 0.9, changefreq: 'daily' },
    { loc: '/states', priority: 0.9, changefreq: 'weekly' },
    { loc: '/hazard/high', priority: 0.8, changefreq: 'weekly' },
    { loc: '/hazard/significant', priority: 0.8, changefreq: 'weekly' },
    { loc: '/hazard/low', priority: 0.7, changefreq: 'weekly' },
    { loc: '/purpose', priority: 0.8, changefreq: 'weekly' },
    { loc: '/owner-type', priority: 0.8, changefreq: 'weekly' },
    { loc: '/about', priority: 0.5, changefreq: 'monthly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
