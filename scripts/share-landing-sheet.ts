import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { google } from 'googleapis';

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string);
const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });
const id = process.env.GOOGLE_SHEETS_LANDING_ID as string;

async function main() {
  console.log('SA:', creds.client_email);
  console.log('Landing sheet:', id);
  try {
    await drive.permissions.create({
      fileId: id,
      requestBody: { role: 'writer', type: 'user', emailAddress: creds.client_email },
      sendNotificationEmail: false,
    });
    console.log('✅ SA granted writer access to landing sheet');
  } catch (e) {
    console.log('share error:', (e as Error).message);
  }
}
main();
