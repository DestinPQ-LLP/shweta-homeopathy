import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const YOUR_EMAIL = 'pratik@destinpq.com';

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
const auth = new google.auth.GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/drive'] });
const drive = google.drive({ version: 'v3', auth });

const SHEET_IDS = [
  { id: process.env.GOOGLE_SHEETS_BLOG_ID!,         name: 'Blogs' },
  { id: process.env.GOOGLE_SHEETS_TESTIMONIALS_ID!, name: 'Testimonials' },
  { id: process.env.GOOGLE_SHEETS_BOOKINGS_ID!,     name: 'Bookings' },
  { id: process.env.GOOGLE_SHEETS_CLIENTS_ID!,      name: 'Clients' },
  { id: process.env.GOOGLE_SHEETS_CONDITIONS_ID!,   name: 'Conditions' },
];

for (const sheet of SHEET_IDS) {
  if (!sheet.id) { console.log(`⚠️  Skipping ${sheet.name} — no ID`); continue; }
  try {
    await drive.permissions.create({
      fileId: sheet.id,
      requestBody: { role: 'writer', type: 'user', emailAddress: YOUR_EMAIL },
      sendNotificationEmail: false,
    });
    console.log(`✅ Shared "${sheet.name}" → ${YOUR_EMAIL}`);
  } catch(e: any) {
    console.log(`⚠️  ${sheet.name}: ${e.message}`);
  }
}
