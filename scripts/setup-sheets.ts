/**
 * setup-sheets.ts
 * 
 * Idempotent script: ensures all required tabs and header rows exist in every 
 * Google Spreadsheet. Safe to re-run — skips tabs/headers that already exist.
 * Also creates the LANDING spreadsheet if GOOGLE_SHEETS_LANDING_ID is not set.
 *
 * Usage: npx tsx scripts/setup-sheets.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set in .env');
const creds = JSON.parse(raw);
if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
});
const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

// ── Required tab specs per spreadsheet env var ───────────────────────────────
const SHEET_SPECS: {
  envVar: string;
  tabs: { name: string; headers: string[] }[];
}[] = [
  {
    envVar: 'GOOGLE_SHEETS_BOOKINGS_ID',
    tabs: [
      {
        name: 'Leads',
        headers: ['Timestamp', 'Name', 'Email', 'Phone', 'Concern', 'PreferredDate', 'PreferredTime', 'Message', 'Status'],
      },
      {
        name: 'Contacts',
        headers: ['Timestamp', 'Name', 'Email', 'Phone', 'Message', 'Status'],
      },
      {
        name: 'Notes',
        headers: ['id', 'clientId', 'clientName', 'sessionDate', 'summary', 'remedies', 'followUpDate', 'status', 'docId', 'docUrl'],
      },
    ],
  },
  {
    envVar: 'GOOGLE_SHEETS_BLOG_ID',
    tabs: [
      {
        name: 'Blogs',
        headers: ['id', 'title', 'slug', 'excerpt', 'coverImageUrl', 'category', 'tags', 'author', 'publishedDate', 'updatedDate', 'status', 'metaDescription', 'docId', 'docUrl'],
      },
    ],
  },
  {
    envVar: 'GOOGLE_SHEETS_CLIENTS_ID',
    tabs: [
      {
        name: 'Clients',
        headers: ['id', 'name', 'email', 'phone', 'dob', 'address', 'firstConsultationDate', 'concern', 'notes', 'docId', 'docUrl', 'driveFolderId', 'status', 'createdAt'],
      },
    ],
  },
  {
    envVar: 'GOOGLE_SHEETS_TESTIMONIALS_ID',
    tabs: [
      {
        name: 'Testimonials',
        headers: ['id', 'name', 'location', 'condition', 'rating', 'text', 'status', 'createdAt', 'imageUrl', 'source'],
      },
    ],
  },
  {
    envVar: 'GOOGLE_SHEETS_CONDITIONS_ID',
    tabs: [
      {
        name: 'Conditions',
        headers: ['slug', 'name', 'shortDesc', 'intro', 'symptoms', 'howHomeopathyHelps', 'icon', 'status', 'category'],
      },
    ],
  },
  {
    envVar: 'GOOGLE_SHEETS_LANDING_ID',
    tabs: [
      {
        name: 'LandingConfig',
        headers: ['key', 'value'],
      },
      {
        name: 'TrackingConfig',
        headers: ['key', 'value'],
      },
    ],
  },
];

async function ensureTab(spreadsheetId: string, tabName: string): Promise<{ sheetId: number; created: boolean }> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets?.find(s => s.properties?.title === tabName);
  if (existing) {
    return { sheetId: existing.properties!.sheetId!, created: false };
  }
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  });
  const newSheet = res.data.replies?.[0]?.addSheet?.properties;
  console.log(`  + Created tab "${tabName}" (id=${newSheet?.sheetId})`);
  return { sheetId: newSheet!.sheetId!, created: true };
}

async function ensureHeaders(spreadsheetId: string, tabName: string, headers: string[]) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tabName}!1:1` });
  const existing = res.data.values?.[0] ?? [];
  if (existing.length > 0) {
    console.log(`  ✅ "${tabName}" already has headers (${existing.length} cols)`);
    return;
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [headers] },
  });
  console.log(`  → Wrote ${headers.length} headers to "${tabName}"`);
}

async function createSpreadsheet(title: string): Promise<string> {
  // Create via Drive so we can set parent folder if needed, but Sheets API is simpler
  const res = await sheets.spreadsheets.create({
    requestBody: { properties: { title } },
  });
  const id = res.data.spreadsheetId!;
  // Share with anyone with the link so SA can always access it
  await drive.permissions.create({
    fileId: id,
    requestBody: { role: 'writer', type: 'user', emailAddress: creds.client_email },
    sendNotificationEmail: false,
  });
  console.log(`  ✨ Created spreadsheet "${title}" → ID: ${id}`);
  console.log(`  📋 Add this to .env:  GOOGLE_SHEETS_LANDING_ID=${id}`);
  return id;
}

async function main() {
  for (const spec of SHEET_SPECS) {
    let spreadsheetId = process.env[spec.envVar];

    if (!spreadsheetId) {
      if (spec.envVar === 'GOOGLE_SHEETS_LANDING_ID') {
        console.log(`\n[${spec.envVar}] ID not found — creating new spreadsheet...`);
        spreadsheetId = await createSpreadsheet('Dr Shweta — Landing Config');
        // Persist to .env automatically
        const fs = await import('fs');
        const path = await import('path');
        const envPath = path.join(process.cwd(), '.env');
        let envContent = fs.readFileSync(envPath, 'utf-8');
        envContent += `\n# Sheets: Landing page config\nGOOGLE_SHEETS_LANDING_ID=${spreadsheetId}\n`;
        fs.writeFileSync(envPath, envContent);
        console.log(`  💾 Appended GOOGLE_SHEETS_LANDING_ID to .env`);
      } else {
        console.log(`\n[${spec.envVar}] *** MISSING — skipping ***`);
        continue;
      }
    }

    console.log(`\n[${spec.envVar}] ${spreadsheetId}`);

    for (const tab of spec.tabs) {
      await ensureTab(spreadsheetId, tab.name);
      await ensureHeaders(spreadsheetId, tab.name, tab.headers);
    }
  }

  console.log('\n✅ All sheets are ready.\n');
  console.log('Next steps:');
  console.log('  1. If GOOGLE_SHEETS_LANDING_ID was just created, restart your dev server.');
  console.log('  2. Share all spreadsheets with: ' + creds.client_email + ' (Editor)');
  console.log('  3. In Vercel → Settings → Environment Variables, add ALL vars from your .env file.');
}

main().catch(e => {
  console.error('\n❌ Error:', e.message);
  if (e.response?.data) console.error(e.response.data);
  process.exit(1);
});
