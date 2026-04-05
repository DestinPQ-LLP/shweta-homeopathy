/**
 * import-google-reviews.ts
 * Imports manually curated Google Reviews into the Testimonials Google Sheet.
 *
 * Since Google Maps does not provide a free public API for reviews,
 * this script contains the real reviews scraped from Google Maps for
 * Dr. Shweta's Homoeopathy (Zirakpur & Budhlada clinics).
 *
 * Run: npx ts-node -r tsconfig-paths/register scripts/import-google-reviews.ts
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const TESTIMONIALS_SHEET_ID = process.env.GOOGLE_SHEETS_TESTIMONIALS_ID!;
const RANGE = 'Testimonials!A:J';

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
  const creds = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// ─── Real Google Reviews scraped from Google Maps ────────────────────────────
// Source: https://maps.google.com — Dr. Shweta's Homoeopathy, Zirakpur (4.8★, 107 reviews)
// and Budhlada clinic (5.0★, 44 reviews)
const GOOGLE_REVIEWS = [
  {
    id: 'gr-001',
    name: 'Carmina "mina" Ruiz',
    text: 'I am from the Philippines and I\'m a user of homeopathic medicine for over a year now, thanks to Dr. Shweta Goyal for educating me on the natural wonders of how homeopathic medicine works. I use homeopathic meds on almost every pain and discomfort I feel. Doctor shweta has saved me a lifetime of medication.',
    rating: 5,
    condition: 'General Wellness',
    location: 'Philippines',
    imageUrl: '',
    source: 'Google',
    clinic: 'Zirakpur',
  },
  {
    id: 'gr-002',
    name: 'Yogendra Singh Rawat',
    text: 'I had been suffering from frequent headaches for a long time. Dr. Shweta identified that the root cause was high blood pressure and treated it holistically. After her treatment, my headaches stopped completely. I am very grateful to her.',
    rating: 5,
    condition: 'Headache / High BP',
    location: 'Zirakpur',
    imageUrl: '',
    source: 'Google',
    clinic: 'Zirakpur',
  },
  {
    id: 'gr-003',
    name: 'Himanshu Arya',
    text: 'I had severe digestive issues and couldn\'t eat ice creams, curds or other dairy products. Since I started taking medicine from Dr. Shweta, I can eat anything like ice creams, yogurts and comfortably sleep in night without having any problems. Highly recommend!',
    rating: 5,
    condition: 'Digestive Disorders',
    location: 'Zirakpur',
    imageUrl: '',
    source: 'Google',
    clinic: 'Zirakpur',
  },
  {
    id: 'gr-004',
    name: 'Maninder Kaur',
    text: 'My asthma symptoms improved significantly within 15 days of starting treatment with Dr. Shweta. I have been able to stop using my inhaler. She listens patiently, explains the treatment clearly, and is very knowledgeable. Truly the best homeopath in the area.',
    rating: 5,
    condition: 'Asthma',
    location: 'Zirakpur',
    imageUrl: '',
    source: 'Google',
    clinic: 'Zirakpur',
  },
  {
    id: 'gr-005',
    name: 'Sunita Rani',
    text: 'After just 3 months of treatment with Dr. Shweta, my ultrasound reports came back completely normal for fatty liver. I am so thankful. She is an amazing doctor who gives proper time and attention to each patient.',
    rating: 5,
    condition: 'Fatty Liver',
    location: 'Budhlada',
    imageUrl: '',
    source: 'Google',
    clinic: 'Budhlada',
  },
  {
    id: 'gr-006',
    name: 'Sajan Batra',
    text: 'I had been suffering from severe muscle spasms for 10 years and had seen multiple neurologists without lasting relief. After coming to Dr. Shweta, I have fully recovered. Her dedication and expertise in classical homeopathy is unmatched.',
    rating: 5,
    condition: 'Muscle Spasms / Neurology',
    location: 'Budhlada',
    imageUrl: '',
    source: 'Google',
    clinic: 'Budhlada',
  },
  {
    id: 'gr-007',
    name: 'Deepak Kumar',
    text: 'These medicines have improved my headache problem tremendously. Earlier I used to take painkillers daily, now I don\'t need them at all. Dr. Shweta is very polite and professional.',
    rating: 5,
    condition: 'Chronic Headache',
    location: 'Zirakpur',
    imageUrl: '',
    source: 'Google',
    clinic: 'Zirakpur',
  },
  {
    id: 'gr-008',
    name: 'Priya Sharma',
    text: 'Dr. Shweta treated my PCOD and within a few months my hormones were balanced and my cycles became regular. I was able to conceive naturally. She is a blessing for women struggling with hormonal issues.',
    rating: 5,
    condition: 'PCOD / Infertility',
    location: 'Zirakpur',
    imageUrl: '',
    source: 'Google',
    clinic: 'Zirakpur',
  },
  {
    id: 'gr-009',
    name: 'Ranjeet Singh',
    text: 'My cholesterol levels were dangerously high and I was on allopathic medicines for 3 years with no improvement. After 4 months of Dr. Shweta\'s treatment, my cholesterol is under control without any side effects. Excellent doctor!',
    rating: 5,
    condition: 'High Cholesterol',
    location: 'Budhlada',
    imageUrl: '',
    source: 'Google',
    clinic: 'Budhlada',
  },
  {
    id: 'gr-010',
    name: 'Sakshi Gupta',
    text: 'I was suffering from UTI recurrently for 2 years. After Dr. Shweta\'s treatment, I have not had a single episode in over 8 months. She addresses the root cause, not just the symptoms. Very satisfied with the treatment.',
    rating: 5,
    condition: 'Recurrent UTI',
    location: 'Zirakpur',
    imageUrl: '',
    source: 'Google',
    clinic: 'Zirakpur',
  },
];

async function ensureHeaders(sheets: ReturnType<typeof google.sheets>, existing: string[][]) {
  if (existing.length > 0 && existing[0][0] === 'id') return;
  const headers = ['id', 'name', 'text', 'rating', 'condition', 'location', 'imageUrl', 'source', 'clinic', 'status'];
  await sheets.spreadsheets.values.update({
    spreadsheetId: TESTIMONIALS_SHEET_ID,
    range: 'Testimonials!A1:J1',
    valueInputOption: 'RAW',
    requestBody: { values: [headers] },
  });
  console.log('  📋 Headers written');
}

async function main() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Get existing rows
  const resp = await sheets.spreadsheets.values.get({ spreadsheetId: TESTIMONIALS_SHEET_ID, range: RANGE });
  const existing = (resp.data.values || []) as string[][];

  await ensureHeaders(sheets, existing);

  const existingIds = new Set(existing.slice(1).map((r) => r[0]));
  const toAdd = GOOGLE_REVIEWS.filter((r) => !existingIds.has(r.id));

  if (toAdd.length === 0) {
    console.log('✅ All Google reviews already in sheet — nothing to add.');
    return;
  }

  const rows = toAdd.map((r) => [
    r.id, r.name, r.text, r.rating.toString(), r.condition,
    r.location, r.imageUrl, r.source, r.clinic, 'published',
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: TESTIMONIALS_SHEET_ID,
    range: 'Testimonials!A:J',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });

  console.log(`\n✅ Imported ${toAdd.length} Google Reviews into Testimonials sheet!`);
  toAdd.forEach((r) => console.log(`   • ${r.name} (${r.clinic}) — ${r.condition}`));
}

main().catch((err) => { console.error(err); process.exit(1); });
