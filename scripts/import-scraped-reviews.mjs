/**
 * import-scraped-reviews.mjs
 * Reads scripts/scraped-reviews.json (output of scrape-and-import-all-reviews.py)
 * Filters to reviews with non-empty text, dedupes against the sheet, and appends.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SHEET_ID = process.env.GOOGLE_SHEETS_TESTIMONIALS_ID;
const RANGE    = 'Testimonials!A:J';
const RAW_FILE = path.join(__dirname, 'scraped-reviews.json');

if (!SHEET_ID) { console.error('GOOGLE_SHEETS_TESTIMONIALS_ID not set'); process.exit(1); }

const raw = JSON.parse(fs.readFileSync(RAW_FILE, 'utf-8'));
const filtered = raw.filter(r =>
  (r.text || '').trim().length > 0 &&
  // skip owner replies
  !/dr\.?\s*shweta/i.test(r.name || '')
);
console.log(`Loaded ${raw.length} (with text & not owner: ${filtered.length})`);

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

const resp = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: RANGE });
const existing = resp.data.values || [];

if (existing.length === 0 || existing[0][0] !== 'id') {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Testimonials!A1:J1',
    valueInputOption: 'RAW',
    requestBody: { values: [['id','name','text','rating','condition','location','imageUrl','source','clinic','status']] },
  });
}

const seen = new Set(existing.slice(1).map(r => `${(r[1]||'').toLowerCase().trim()}|${(r[2]||'').slice(0,60).toLowerCase().trim()}`));
const toAdd = [];
for (const r of filtered) {
  const key = `${(r.name||'').toLowerCase().trim()}|${(r.text||'').slice(0,60).toLowerCase().trim()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const id = 'gp-' + crypto.createHash('sha1').update(key).digest('hex').slice(0, 12);
  toAdd.push([
    id,
    r.name || 'Google Reviewer',
    r.text,
    String(r.rating ?? 5),
    'General',
    r.clinic || 'Zirakpur',
    r.imageUrl || '',
    'Google',
    r.clinic || 'Zirakpur',
    'published',
  ]);
}

if (!toAdd.length) { console.log('Nothing new.'); process.exit(0); }

await sheets.spreadsheets.values.append({
  spreadsheetId: SHEET_ID,
  range: RANGE,
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: toAdd },
});
console.log(`Appended ${toAdd.length} new reviews.`);
