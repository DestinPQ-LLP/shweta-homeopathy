// Diagnose Google Sheets access — prints the REAL error per sheet.
// Run: node --env-file=.env scripts/diagnose-sheets.mjs

import { google } from 'googleapis';

const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
if (!raw) {
  console.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY not set');
  process.exit(1);
}

const creds = JSON.parse(raw);
if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');

console.log('🔑 Service account:', creds.client_email);
console.log('🆔 Project ID     :', creds.project_id);
console.log('🗝️  Key ID        :', creds.private_key_id);
console.log('');

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
});

const sheets = google.sheets({ version: 'v4', auth });
const drive  = google.drive({ version: 'v3', auth });

const TARGETS = [
  ['BLOG',         process.env.GOOGLE_SHEETS_BLOG_ID],
  ['CONDITIONS',   process.env.GOOGLE_SHEETS_CONDITIONS_ID],
  ['TESTIMONIALS', process.env.GOOGLE_SHEETS_TESTIMONIALS_ID],
  ['BOOKINGS',     process.env.GOOGLE_SHEETS_BOOKINGS_ID],
  ['CLIENTS',      process.env.GOOGLE_SHEETS_CLIENTS_ID],
  ['LANDING',      process.env.GOOGLE_SHEETS_LANDING_ID],
];

for (const [name, id] of TARGETS) {
  console.log(`── ${name} (${id}) ──`);
  if (!id) { console.log('  ⚠️  no ID set'); continue; }

  // 1. Drive metadata (does the service account see the file at all?)
  try {
    const meta = await drive.files.get({ fileId: id, fields: 'id,name,owners(emailAddress),mimeType,trashed', supportsAllDrives: true });
    console.log(`  📄 Drive: name="${meta.data.name}" owner=${meta.data.owners?.[0]?.emailAddress} trashed=${meta.data.trashed} mime=${meta.data.mimeType}`);
  } catch (e) {
    console.log(`  ❌ Drive get failed: ${e.code} ${e.message}`);
  }

  // 2. Sheets metadata — list tab names
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: id, fields: 'properties.title,sheets.properties.title' });
    const title = meta.data.properties?.title;
    const tabs  = meta.data.sheets?.map(s => s.properties?.title);
    console.log(`  ✅ Sheets: title="${title}" tabs=${JSON.stringify(tabs)}`);
  } catch (e) {
    console.log(`  ❌ Sheets get failed: ${e.code} ${e.message}`);
  }
  console.log('');
}
