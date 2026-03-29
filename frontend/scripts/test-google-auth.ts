import * as dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

async function test() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("No key");
  console.log("Raw key available. Length:", raw.length);
  const credentials = JSON.parse(raw);
  console.log("Private key start:", credentials.private_key.substring(0, 35));
  console.log("Private key end:", credentials.private_key.substring(credentials.private_key.length - 35));
  
  // Try to fix newlines if they are literally '\\n'
  if (credentials.private_key.includes('\\n')) {
     console.log("Replacing escaped newlines...");
     credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  console.log("Client acquired!");
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEETS_CONDITIONS_ID });
  console.log("Target Sheet Title:", res.data.properties?.title);
}

test().catch(e => {
  console.error(e.message);
  if (e.response && e.response.data) {
     console.error(e.response.data);
  }
});
