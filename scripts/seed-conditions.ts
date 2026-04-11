/**
 * seed-conditions.ts
 *
 * One-time script to bulk-import conditions from ready-to-upload.json
 * into the Google Sheet (GOOGLE_SHEETS_CONDITIONS_ID / Conditions tab).
 *
 * - Skips the meta entry ("ultra-modern-ui-ux-elements")
 * - Merges category from static-conditions.ts / conditions.ts when available
 * - Skips slugs that already exist in the sheet
 *
 * Usage: npx tsx scripts/seed-conditions.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';

const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
const creds = JSON.parse(raw);
if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ID = process.env.GOOGLE_SHEETS_CONDITIONS_ID;
if (!SHEET_ID) throw new Error('GOOGLE_SHEETS_CONDITIONS_ID is not set');

const TAB = 'Conditions';
const RANGE = `${TAB}!A:I`;
const HEADERS = ['slug', 'name', 'shortDesc', 'intro', 'symptoms', 'howHomeopathyHelps', 'icon', 'status', 'category'];

const SKIP_SLUGS = new Set(['ultra-modern-ui-ux-elements']);

// Category lookup from the static sources
const CATEGORY_MAP: Record<string, string> = {
  'alopecia-hair-loss': 'Lifestyle',
  'cancer-supportive-care': 'Supportive Care',
  'joint-problems-arthritis': 'Chronic Care',
  'womens-health': "Women's Health",
  'diabetes-mellitus': 'Lifestyle',
  'geriatric-disorders': 'Chronic Care',
  'depression-anxiety': 'Lifestyle',
  'gastrointestinal-disorders': 'Chronic Care',
  'pediatric-diseases': 'Pediatric',
  'skin-diseases': 'Skin',
  'respiratory-diseases': 'Respiratory',
  'thyroid-disorders': 'Chronic Care',
};

interface UploadEntry {
  slug: string;
  name: string;
  shortDesc: string;
  intro: string;
  symptoms: string[];
  howHomeopathyHelps: string;
  icon: string;
  status: string;
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'ready-to-upload.json');
  const entries: UploadEntry[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Read existing sheet rows to avoid duplicates
  let existingSlugs = new Set<string>();
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID!, range: RANGE });
    const rows = res.data.values ?? [];
    if (rows.length === 0) {
      console.log('Sheet is empty — writing headers first.');
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID!,
        range: `${TAB}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [HEADERS] },
      });
    } else {
      existingSlugs = new Set(rows.slice(1).map(r => r[0]).filter(Boolean));
      console.log(`Found ${existingSlugs.size} existing condition(s) in sheet.`);
    }
  } catch (err) {
    console.log('Could not read sheet — will create headers:', (err as Error).message);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID!,
      range: `${TAB}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }

  const toInsert = entries.filter(e => !SKIP_SLUGS.has(e.slug) && !existingSlugs.has(e.slug));

  if (toInsert.length === 0) {
    console.log('All conditions already exist in the sheet. Nothing to do.');
    return;
  }

  const rows = toInsert.map(e => [
    e.slug,
    e.name,
    e.shortDesc,
    e.intro,
    e.symptoms.join('|'),
    e.howHomeopathyHelps,
    e.icon || 'Activity',
    e.status || 'published',
    CATEGORY_MAP[e.slug] ?? '',
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID!,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });

  console.log(`Inserted ${rows.length} condition(s):`);
  for (const r of rows) {
    console.log(`  + ${r[0]} — ${r[1]}`);
  }
  console.log('\nDone. Condition pages will be live on next build/revalidation.');
}

main().catch(e => {
  console.error('Error:', e.message);
  if (e.response?.data) console.error(e.response.data);
  process.exit(1);
});
