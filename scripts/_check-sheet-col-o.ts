import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { readSheet } from '@/lib/google/sheets';

async function main() {
  const rows = await readSheet(process.env.GOOGLE_SHEETS_BLOG_ID!, 'Blogs!A2:O2');
  const row = rows[0] || [];
  console.log('Row cols:', row.length);
  console.log('col O (idx 14) len:', (row[14]||'').length);
  console.log('col O preview:', (row[14]||'').slice(0,300));
}
main().catch(console.error);
