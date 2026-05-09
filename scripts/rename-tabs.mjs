import { google } from 'googleapis';

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function renameSheet1(spreadsheetId, newName) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const tab = meta.data.sheets.find(s => s.properties.title === 'Sheet1');
  if (!tab) { console.log(`  – ${newName}: no Sheet1, skipping`); return; }
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        updateSheetProperties: {
          properties: { sheetId: tab.properties.sheetId, title: newName },
          fields: 'title',
        }
      }]
    }
  });
  console.log(`  ✅ Renamed Sheet1 → ${newName} in ${spreadsheetId}`);
}

await renameSheet1(process.env.GOOGLE_SHEETS_CONDITIONS_ID, 'Conditions');
await renameSheet1(process.env.GOOGLE_SHEETS_CLIENTS_ID, 'Clients');
