/**
 * Setup data_metadata table for tracking data freshness
 * Run once: npx tsx scripts/setup-metadata.ts
 */

import { createClient } from '@supabase/supabase-js';

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Creating data_metadata table...');

    // Use RPC to execute raw SQL
    const { error } = await supabase.rpc('exec_sql', {
        sql: `
            CREATE TABLE IF NOT EXISTS data_metadata (
                id INTEGER PRIMARY KEY DEFAULT 1,
                source_name TEXT DEFAULT 'National Inventory of Dams',
                source_url TEXT DEFAULT 'https://nid.sec.usace.army.mil/api/nation/csv',
                data_period TEXT,
                record_count INTEGER,
                file_size BIGINT,
                last_modified_header TEXT,
                last_updated TIMESTAMPTZ,
                last_checked_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT single_row CHECK (id = 1)
            );

            -- Enable RLS
            ALTER TABLE data_metadata ENABLE ROW LEVEL SECURITY;

            -- Allow public reads
            CREATE POLICY IF NOT EXISTS "Allow public read" ON data_metadata
                FOR SELECT USING (true);

            -- Allow service role updates
            CREATE POLICY IF NOT EXISTS "Allow service role update" ON data_metadata
                FOR ALL USING (true);

            -- Insert initial row if not exists
            INSERT INTO data_metadata (id, source_name, source_url)
            VALUES (1, 'National Inventory of Dams', 'https://nid.sec.usace.army.mil/api/nation/csv')
            ON CONFLICT (id) DO NOTHING;
        `
    });

    if (error) {
        // If exec_sql doesn't exist, try direct REST approach
        console.log('RPC not available, inserting metadata row via REST...');
        const { error: upsertError } = await supabase.from('data_metadata').upsert({
            id: 1,
            source_name: 'National Inventory of Dams',
            source_url: 'https://nid.sec.usace.army.mil/api/nation/csv',
            last_checked_at: new Date().toISOString(),
        });

        if (upsertError) {
            console.error('Error:', upsertError.message);
            console.log('\nPlease create the table manually in Supabase SQL editor:');
            console.log(`
CREATE TABLE IF NOT EXISTS data_metadata (
    id INTEGER PRIMARY KEY DEFAULT 1,
    source_name TEXT DEFAULT 'National Inventory of Dams',
    source_url TEXT,
    data_period TEXT,
    record_count INTEGER,
    file_size BIGINT,
    last_modified_header TEXT,
    last_updated TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE data_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON data_metadata FOR SELECT USING (true);
CREATE POLICY "Allow service role all" ON data_metadata FOR ALL USING (true);

INSERT INTO data_metadata (id, source_name, source_url)
VALUES (1, 'National Inventory of Dams', 'https://nid.sec.usace.army.mil/api/nation/csv')
ON CONFLICT (id) DO NOTHING;
            `);
        } else {
            console.log('Metadata row created successfully.');
        }
    } else {
        console.log('data_metadata table created successfully.');
    }
}

main().catch(console.error);
