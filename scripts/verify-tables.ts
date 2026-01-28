import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('Verifying database tables...\n');

  const tables = ['states', 'counties', 'purposes', 'owner_types', 'dams'];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.log(`[X] ${table}: ${error.message}`);
    } else {
      console.log(`[OK] ${table}: Ready (${data?.length || 0} rows)`);
    }
  }

  console.log('\nDone!');
}

verify();
