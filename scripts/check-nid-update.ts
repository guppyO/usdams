/**
 * Smart NID Update Check
 *
 * Checks if the NID CSV has changed WITHOUT downloading the full file.
 * Uses HTTP HEAD request to compare Content-Length against stored value.
 *
 * Exit codes:
 *   0 = No update needed
 *   1 = Update available
 *   2 = Error
 */

import { createClient } from '@supabase/supabase-js';

const NID_CSV_URL = 'https://nid.sec.usace.army.mil/api/nation/csv';

// Threshold: if file size differs by more than 0.5%, consider it changed
const SIZE_CHANGE_THRESHOLD = 0.005;

// Max age in days before forcing update regardless
const MAX_AGE_DAYS = 30;

async function main() {
    console.log('=== NID Smart Update Check ===\n');

    // 1. Check NID file size via HEAD request (no download)
    let remoteSize: number | null = null;
    let lastModified: string | null = null;

    try {
        console.log('Sending HEAD request to NID API...');
        const response = await fetch(NID_CSV_URL, { method: 'HEAD' });

        if (!response.ok) {
            console.error(`NID API returned ${response.status}`);
            process.exit(2);
        }

        const contentLength = response.headers.get('content-length');
        lastModified = response.headers.get('last-modified');

        if (contentLength) {
            remoteSize = parseInt(contentLength, 10);
            console.log(`Remote file size: ${(remoteSize / 1024 / 1024).toFixed(1)} MB`);
        } else {
            console.log('No Content-Length header, will need to download to check');
        }

        if (lastModified) {
            console.log(`Last-Modified: ${lastModified}`);
        }
    } catch (error) {
        console.error('Failed to reach NID API:', error);
        process.exit(2);
    }

    // 2. Check current metadata from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        process.exit(2);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to get metadata
    const { data: metadata, error } = await supabase
        .from('data_metadata')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        console.log('No metadata found (first run or table missing). Update needed.');
        // Update last_checked_at if table exists
        await supabase.from('data_metadata').upsert({
            id: 1,
            source_name: 'National Inventory of Dams',
            source_url: NID_CSV_URL,
            last_checked_at: new Date().toISOString(),
        });
        process.exit(1);
    }

    console.log(`\nStored metadata:`);
    console.log(`  Record count: ${metadata.record_count || 'unknown'}`);
    console.log(`  File size: ${metadata.file_size ? `${(metadata.file_size / 1024 / 1024).toFixed(1)} MB` : 'unknown'}`);
    console.log(`  Last updated: ${metadata.last_updated || 'unknown'}`);
    console.log(`  Last checked: ${metadata.last_checked_at || 'unknown'}`);

    // Update last_checked_at
    await supabase.from('data_metadata').update({
        last_checked_at: new Date().toISOString(),
    }).eq('id', 1);

    // 3. Compare
    let updateNeeded = false;
    const reasons: string[] = [];

    // Check age
    if (metadata.last_updated) {
        const lastUpdate = new Date(metadata.last_updated);
        const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        console.log(`\nDays since last update: ${daysSinceUpdate.toFixed(0)}`);

        if (daysSinceUpdate > MAX_AGE_DAYS) {
            updateNeeded = true;
            reasons.push(`Data is ${daysSinceUpdate.toFixed(0)} days old (max: ${MAX_AGE_DAYS})`);
        }
    } else {
        updateNeeded = true;
        reasons.push('No last_updated timestamp');
    }

    // Check file size change
    if (remoteSize && metadata.file_size) {
        const sizeDiff = Math.abs(remoteSize - metadata.file_size) / metadata.file_size;
        console.log(`File size change: ${(sizeDiff * 100).toFixed(2)}%`);

        if (sizeDiff > SIZE_CHANGE_THRESHOLD) {
            updateNeeded = true;
            reasons.push(`File size changed by ${(sizeDiff * 100).toFixed(2)}% (threshold: ${SIZE_CHANGE_THRESHOLD * 100}%)`);
        }
    } else if (!metadata.file_size) {
        updateNeeded = true;
        reasons.push('No stored file size to compare');
    }

    // Check Last-Modified header against stored date
    if (lastModified && metadata.last_modified_header) {
        const remoteDate = new Date(lastModified);
        const storedDate = new Date(metadata.last_modified_header);
        if (remoteDate > storedDate) {
            updateNeeded = true;
            reasons.push(`Last-Modified header is newer: ${lastModified}`);
        }
    }

    // 4. Decision
    console.log('\n=== Decision ===');
    if (updateNeeded) {
        console.log('UPDATE NEEDED');
        reasons.forEach(r => console.log(`  Reason: ${r}`));
        process.exit(1);
    } else {
        console.log('No update needed. Data is current.');
        process.exit(0);
    }
}

main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(2);
});
