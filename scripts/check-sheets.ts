import * as dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

async function main() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
  const creds = JSON.parse(raw);
  if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');
  const auth = new google.auth.GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth });

  const ids: Record<string, string | undefined> = {
    BOOKINGS: process.env.GOOGLE_SHEETS_BOOKINGS_ID,
    BLOG: process.env.GOOGLE_SHEETS_BLOG_ID,
    CLIENTS: process.env.GOOGLE_SHEETS_CLIENTS_ID,
    TESTIMONIALS: process.env.GOOGLE_SHEETS_TESTIMONIALS_ID,
    CONDITIONS: process.env.GOOGLE_SHEETS_CONDITIONS_ID,
    LANDING: process.env.GOOGLE_SHEETS_LANDING_ID,
  };

  for (const [name, id] of Object.entries(ids)) {
    if (!id) { console.log(`${name}: *** MISSING ID in .env ***`); continue; }
    try {
      const r = await sheets.spreadsheets.get({ spreadsheetId: id });
      const tabs = r.data.sheets?.map(s => s.properties?.title) ?? [];
      console.log(`${name} ("${r.data.properties?.title}"): tabs = ${JSON.stringify(tabs)}`);

      // Check first row (headers) of each expected tab
      const expectedTabs: Record<string, string[]> = {
        BOOKINGS: ['Leads', 'Contacts', 'Notes'],
        BLOG: ['Blogs'],
        CLIENTS: ['Clients'],
        TESTIMONIALS: ['Testimonials'],
        CONDITIONS: ['Conditions'],
        LANDING: ['LandingConfig', 'TrackingConfig'],
      };
      for (const tab of (expectedTabs[name] ?? [])) {
        if (!tabs.includes(tab)) {
          console.log(`  ⚠️  Tab "${tab}" is MISSING`);
        } else {
          const h = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${tab}!1:1` });
          const headers = h.data.values?.[0] ?? [];
          console.log(`  ✅ Tab "${tab}" headers: ${JSON.stringify(headers)}`);
        }
      }
    } catch (e: any) {
      console.log(`${name}: ❌ ERROR - ${e.message}`);
    }
  }
}

main().catch(console.error);
