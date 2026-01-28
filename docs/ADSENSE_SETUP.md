# Google AdSense Setup Guide for usdamsdata.com

## Pre-Approval Checklist

Before applying for AdSense, ensure:

- [x] Privacy Policy page exists at `/privacy`
- [x] Terms of Service page exists at `/terms`
- [x] About page exists at `/about`
- [x] Sufficient unique content (91,000+ dam pages)
- [x] Site is live and accessible
- [x] No prohibited content
- [x] Mobile-friendly design
- [x] Fast load times (Lighthouse optimized)

## After AdSense Approval

### Step 1: Create ads.txt

Create `public/ads.txt` with your publisher ID:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `pub-XXXXXXXXXXXXXXXX` with your actual AdSense publisher ID (found in your AdSense dashboard).

### Step 2: Enable AdSense Script

In `src/app/layout.tsx`, find the commented AdSense script and uncomment it:

**Before:**
```tsx
{/* Google AdSense - Uncomment and add your publisher ID when approved */}
{/* <script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
  crossOrigin="anonymous"
/> */}
```

**After:**
```tsx
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossOrigin="anonymous"
/>
```

### Step 3: Add Ad Units to Pages

Once approved, you can add ad units to your pages. Recommended placements:

1. **Dam Detail Pages** (`/dam/[slug]/page.tsx`)
   - Below the header, before main content
   - In the sidebar (if applicable)
   - At the bottom of the page

2. **Browse/List Pages** (`/browse`, `/state/[slug]`, etc.)
   - Between listings (every 5-10 items)
   - At the top and bottom of results

3. **Static Pages** (About, Privacy, Terms)
   - Minimal ads or none (keeps pages clean for compliance)

### Step 4: Deploy

```bash
git add .
git commit -m "Enable Google AdSense with publisher ID"
git push
```

## Important Notes

- **ads.txt must match**: The publisher ID in `ads.txt` MUST match the ID in your AdSense script
- **Wait 24-48 hours**: After adding ads.txt, wait for Google to crawl and verify
- **No click fraud**: Never click your own ads or encourage others to
- **Content policy**: Continue to follow AdSense content policies

## Verification

After setup, verify at:
- `https://usdamsdata.com/ads.txt` - Should show your publisher ID
- AdSense dashboard - Check for "ads.txt status" under Sites

