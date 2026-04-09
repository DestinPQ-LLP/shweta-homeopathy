/**
 * fix-sheet-headers.ts
 * Overwrites header rows in all sheets to exactly match what the APIs read/write.
 * Run: npx tsx scripts/fix-sheet-headers.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');
const creds = JSON.parse(raw);
if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function setHeaders(spreadsheetId: string, tab: string, headers: string[]) {
  const lastCol = String.fromCharCode(64 + headers.length); // A=65
  const range = `${tab}!A1:${lastCol}1`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [headers] },
  });
  console.log(`  ✅ ${tab} headers: ${JSON.stringify(headers)}`);
}

async function main() {
  const bookingsId = process.env.GOOGLE_SHEETS_BOOKINGS_ID;
  if (!bookingsId) throw new Error('GOOGLE_SHEETS_BOOKINGS_ID not set');

  console.log('\n[Bookings Sheet]');

  // Leads — 10 cols: matches appointment POST + PATCH status update in col I
  await setHeaders(bookingsId, 'Leads', [
    'timestamp', 'name', 'email', 'phone', 'age',
    'concern', 'preferredTime', 'consultationType', 'status', 'message',
  ]);

  // Contacts — 6 cols: matches contact POST
  await setHeaders(bookingsId, 'Contacts', [
    'timestamp', 'name', 'email', 'phone', 'subject', 'message',
  ]);

  // Notes — 10 cols: matches notes API own ensureNotesSheet() headers
  await setHeaders(bookingsId, 'Notes', [
    'id', 'patientName', 'date', 'caseId', 'driveFileId',
    'driveFileName', 'docId', 'docUrl', 'status', 'extractedTextPreview',
  ]);

  console.log('\n✅ All Bookings sheet headers fixed.\n');
}

main().catch(e => {
  console.error('❌', e.message);
  if (e.response?.data) console.error(e.response.data);
  process.exit(1);
});
