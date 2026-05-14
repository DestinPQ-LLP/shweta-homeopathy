import { config } from 'dotenv';
config({ path: '.env' });
import { readSheet } from '../lib/google/sheets';

(async () => {
  const id = process.env.GOOGLE_SHEETS_BOOKINGS_ID!;
  const rows = (await readSheet(id, 'Leads!A:J')) as string[][];
  const headers = rows[0];
  const last = rows[rows.length - 1];
  console.log('\n=== Last row in Leads tab ===');
  headers.forEach((h, i) => console.log(`  ${h.padEnd(18)} : ${last[i] ?? ''}`));
  console.log(`\nTotal rows (incl. header): ${rows.length}`);
})().catch(e => { console.error(e); process.exit(1); });
