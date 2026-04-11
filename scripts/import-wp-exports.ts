/**
 * import-wp-exports.ts
 *
 * Imports WordPress CSV exports (from exports.zip) into Google Sheets and
 * copies photos to public/photos/. Also merges Google Reviews from data.sql
 * and the existing import-google-reviews.ts hardcoded set.
 *
 * Data flow:
 *   testimonials.csv + data.sql reviews + hardcoded reviews -> Testimonials sheet
 *   blog_posts.csv                                          -> Blogs sheet
 *   pages.csv (condition pages only)                        -> Conditions sheet
 *   photos/*                                                -> public/photos/
 *
 * Usage: npx tsx scripts/import-wp-exports.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { parse } from 'csv-parse/sync';
import { google } from 'googleapis';
import { randomUUID } from 'crypto';

// ─── Auth ────────────────────────────────────────────────────────────────────

const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
const creds = JSON.parse(raw);
if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// ─── Sheet IDs ───────────────────────────────────────────────────────────────

const TESTIMONIALS_SHEET_ID = process.env.GOOGLE_SHEETS_TESTIMONIALS_ID!;
const BLOG_SHEET_ID = process.env.GOOGLE_SHEETS_BLOG_ID!;
const CONDITIONS_SHEET_ID = process.env.GOOGLE_SHEETS_CONDITIONS_ID!;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const EXPORT_DIR = '/tmp/shweta-wp-exports/exports';

function extractZip() {
  const zipPath = path.join(ROOT, 'exports.zip');
  if (!fs.existsSync(zipPath)) throw new Error('exports.zip not found in project root');
  execSync(`rm -rf /tmp/shweta-wp-exports && unzip -o "${zipPath}" -d /tmp/shweta-wp-exports`, { stdio: 'pipe' });
  console.log('[extract] Unzipped exports.zip');
}

function readCSV<T extends Record<string, string>>(filename: string): T[] {
  const csvPath = path.join(EXPORT_DIR, filename);
  if (!fs.existsSync(csvPath)) { console.warn(`[csv] ${filename} not found, skipping`); return []; }
  const content = fs.readFileSync(csvPath, 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true }) as T[];
}

async function readSheetRows(sheetId: string, range: string): Promise<string[][]> {
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    return (res.data.values as string[][]) || [];
  } catch { return []; }
}

async function ensureHeaders(sheetId: string, range: string, headers: string[]) {
  const rows = await readSheetRows(sheetId, range);
  if (rows.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: range.replace(/![A-Z]+:[A-Z]+$/, '!A1'),
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
    console.log(`  + Headers written for ${range}`);
  }
}

async function appendRows(sheetId: string, range: string, rows: string[][]) {
  if (rows.length === 0) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
}

function stripElementorCSS(text: string): string {
  return text
    .replace(/\/\*!.*?\*\//gs, '')
    .replace(/\.elementor[^{]*\{[^}]*\}/g, '')
    .replace(/@media[^{]*\{[^}]*(\{[^}]*\})*[^}]*\}/g, '')
    .replace(/\[rev_slider[^\]]*\]\[\/rev_slider\]/g, '')
    .replace(/\[wpforms[^\]]*\]/g, '')
    .replace(/\[contact-form-7[^\]]*\]/g, '')
    .replace(/\[caption[^\]]*\].*?\[\/caption\]/g, '')
    .replace(/https?:\/\/www\.youtube\.com\/watch\S+/g, '')
    .trim();
}

function excerpt(text: string, maxLen = 200): string {
  const clean = stripElementorCSS(text);
  const firstBlock = clean.split(/\n\n|\t\t/)[0] || clean;
  if (firstBlock.length <= maxLen) return firstBlock;
  return firstBlock.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
}

// ─── Condition page slug mapping ─────────────────────────────────────────────

const CONDITION_SLUGS: Record<string, string> = {
  'homoeopathy-hair-loss-treatment': 'alopecia-hair-loss',
  'homoeopathic-treatment-for-cancer': 'cancer-supportive-care',
  'homeopathic-remedies-depression-anxiety': 'depression-anxiety',
  'diabetes-mellitus': 'diabetes-mellitus',
  'homoeopathy-female-diseases': 'womens-health',
  'homoeopathy-gastrointestinal-disorders': 'gastrointestinal-disorders',
  'homoeopathy-geriatric-disorders': 'geriatric-disorders',
  'homeopathy-joint-pain': 'joint-problems-arthritis',
  'homoeopathy-pediatric-illness': 'pediatric-diseases',
  'homoeopathy-for-respiratory-diseases': 'respiratory-diseases',
  'skin-disorders-homoeopathy-treatment': 'skin-diseases',
  'thyroid-disorders-and-homoeopathy': 'thyroid-disorders',
};

const CATEGORY_MAP: Record<string, string> = {
  'alopecia-hair-loss': 'Lifestyle',
  'cancer-supportive-care': 'Supportive Care',
  'joint-problems-arthritis': 'Chronic Care',
  'womens-health': "Women's Health",
  'diabetes-mellitus': 'Lifestyle',
  'geriatric-disorders': 'Chronic Care',
  'depression-anxiety': 'Lifestyle',
  'gastrointestinal-disorders': 'Chronic Care',
  'pediatric-diseases': 'Pediatric',
  'skin-diseases': 'Skin',
  'respiratory-diseases': 'Respiratory',
  'thyroid-disorders': 'Chronic Care',
};

// ─── Google Reviews from data.sql (trustindex table) ─────────────────────────

const SQL_GOOGLE_REVIEWS = [
  { name: 'Harmandeep Kaur', text: 'Outstanding experience', rating: 5, date: '2025-07-20' },
  { name: 'Surbhi Singla', text: 'I consulted with Dr Shweta around a month ago I have issue with pcod and stress with in a month she was able to help me in control my cravings and help with my mental Fogg. I am really grateful to her my experience with her is amazing she listens and acknowledge your problem with a proper diagnosis and treatment', rating: 5, date: '2025-06-28' },
  { name: 'Amit Sharma', text: 'Excellent experience....I suggest everyone to visit once if you are on allopathic medicines...Iam very much satisfied as I have almost been recovered from the skin problem I have for the last 10 years. Thank you to Dr. Shweta.', rating: 5, date: '2025-06-24' },
  { name: 'Vishal Sagar', text: "A wise counselor. She takes complete history before giving any medicine. Must recommend to everyone. Perfect diagnosis and perfect treatment every time. Our family doctor.", rating: 5, date: '2025-05-28' },
  { name: 'Varnika #25', text: 'Good', rating: 5, date: '2025-05-12' },
  { name: 'AASHISH CHAUDHARY', text: 'Really very good experience here with Dr. Shweta treatment and counseling.so much helpful for us to recover..Thanks a lot', rating: 5, date: '2025-04-23' },
  { name: 'Jashan Guliani', text: "Dr.Shweta was very patient with hearing us and made sure she took all relevant information in detail before prescribing a course of action. Her treatment yielded results effectively and as per the time frame she informed me of. 10/10 would recommend.", rating: 5, date: '2025-03-19' },
  { name: 'Ishan Goyal', text: "I have got great experience in getting treatment for various muscle injuries and recovery thereof. A strongly recommended doctor for any type disease or injury for getting fast recovery.", rating: 5, date: '2025-03-18' },
  { name: 'Miss Goyal', text: "I had an eye injury due to tennis ball while playing cricket so my left eye got hurt very badly and I was unable to see anything for whole day. After consulting Dr. Shweta about the same, my eye got better within 6 hours and visibility got normal after taking medicine.", rating: 5, date: '2025-03-18' },
  { name: 'Parveen Singh', text: '', rating: 5, date: '2025-03-18' },
];

// ─── 1. Import Testimonials ─────────────────────────────────────────────────

async function importTestimonials() {
  console.log('\n=== TESTIMONIALS ===');

  const HEADERS = ['id', 'name', 'location', 'condition', 'rating', 'text', 'status', 'createdAt', 'imageUrl', 'source'];
  await ensureHeaders(TESTIMONIALS_SHEET_ID, 'Testimonials!A:J', HEADERS);

  const existing = await readSheetRows(TESTIMONIALS_SHEET_ID, 'Testimonials!A:J');
  const existingNames = new Set(existing.slice(1).map(r => (r[1] || '').toLowerCase().trim()));
  const existingIds = new Set(existing.slice(1).map(r => r[0]));

  const allRows: string[][] = [];

  // Source 1: CSV testimonials
  const csvRows = readCSV<{ Name: string; 'Condition/Role': string; 'Review Text': string; 'Image URL': string; Source: string }>('testimonials.csv');
  for (const r of csvRows) {
    const name = r.Name?.trim();
    if (!name || existingNames.has(name.toLowerCase())) continue;
    existingNames.add(name.toLowerCase());
    allRows.push([
      `wp-${randomUUID().slice(0, 8)}`, name, 'Zirakpur', r['Condition/Role'] || '',
      '5', (r['Review Text'] || '').replace(/\\n/g, '\n').replace(/\\u2026/g, '...').replace(/\\u2019/g, '\u2019'),
      'published', new Date().toISOString(), r['Image URL'] || '', r.Source || 'WordPress',
    ]);
  }
  console.log(`  CSV testimonials: ${allRows.length} new`);

  // Source 2: SQL Google Reviews
  let sqlCount = 0;
  for (const r of SQL_GOOGLE_REVIEWS) {
    const name = r.name.trim();
    if (!name || !r.text || existingNames.has(name.toLowerCase())) continue;
    existingNames.add(name.toLowerCase());
    allRows.push([
      `grsql-${randomUUID().slice(0, 8)}`, name, 'Zirakpur', '',
      String(r.rating), r.text, 'published', r.date || new Date().toISOString(), '', 'Google',
    ]);
    sqlCount++;
  }
  console.log(`  SQL Google Reviews: ${sqlCount} new`);

  // Source 3: Hardcoded reviews from import-google-reviews.ts
  const HARDCODED_REVIEWS = [
    { name: 'Carmina "mina" Ruiz', condition: 'General Wellness', location: 'Philippines', text: "I am from the Philippines and I'm a user of homeopathic medicine for over a year now, thanks to Dr. Shweta Goyal for educating me on the natural wonders of how homeopathic medicine works." },
    { name: 'Yogendra Singh Rawat', condition: 'Headache / High BP', location: 'Zirakpur', text: 'I had been suffering from frequent headaches for a long time. Dr. Shweta identified that the root cause was high blood pressure and treated it holistically. After her treatment, my headaches stopped completely.' },
    { name: 'Himanshu Arya', condition: 'Digestive Disorders', location: 'Zirakpur', text: "I had severe digestive issues and couldn't eat ice creams, curds or other dairy products. Since I started taking medicine from Dr. Shweta, I can eat anything. Highly recommend!" },
    { name: 'Maninder Kaur', condition: 'Asthma', location: 'Zirakpur', text: 'My asthma symptoms improved significantly within 15 days of starting treatment with Dr. Shweta. I have been able to stop using my inhaler.' },
    { name: 'Sunita Rani', condition: 'Fatty Liver', location: 'Budhlada', text: "After just 3 months of treatment with Dr. Shweta, my ultrasound reports came back completely normal for fatty liver." },
    { name: 'Sajan Batra', condition: 'Muscle Spasms / Neurology', location: 'Budhlada', text: 'I had been suffering from severe muscle spasms for 10 years. After coming to Dr. Shweta, I have fully recovered.' },
    { name: 'Deepak Kumar', condition: 'Chronic Headache', location: 'Zirakpur', text: "These medicines have improved my headache problem tremendously. Earlier I used to take painkillers daily, now I don't need them at all." },
    { name: 'Priya Sharma', condition: 'PCOD / Infertility', location: 'Zirakpur', text: 'Dr. Shweta treated my PCOD and within a few months my hormones were balanced and my cycles became regular. I was able to conceive naturally.' },
    { name: 'Ranjeet Singh', condition: 'High Cholesterol', location: 'Budhlada', text: "My cholesterol levels were dangerously high. After 4 months of Dr. Shweta's treatment, my cholesterol is under control without any side effects." },
    { name: 'Sakshi Gupta', condition: 'Recurrent UTI', location: 'Zirakpur', text: "I was suffering from UTI recurrently for 2 years. After Dr. Shweta's treatment, I have not had a single episode in over 8 months." },
  ];
  let hcCount = 0;
  for (const r of HARDCODED_REVIEWS) {
    if (existingNames.has(r.name.toLowerCase())) continue;
    existingNames.add(r.name.toLowerCase());
    allRows.push([
      `gr-${randomUUID().slice(0, 8)}`, r.name, r.location, r.condition,
      '5', r.text, 'published', new Date().toISOString(), '', 'Google',
    ]);
    hcCount++;
  }
  console.log(`  Hardcoded Google Reviews: ${hcCount} new`);

  await appendRows(TESTIMONIALS_SHEET_ID, 'Testimonials!A:J', allRows);
  console.log(`  TOTAL: ${allRows.length} testimonials imported`);
}

// ─── 2. Import Blog Posts ────────────────────────────────────────────────────

async function importBlogPosts() {
  console.log('\n=== BLOG POSTS ===');

  const HEADERS = ['id', 'title', 'slug', 'excerpt', 'coverImageUrl', 'category', 'tags', 'author', 'publishedDate', 'updatedDate', 'status', 'metaDescription', 'docId', 'docUrl'];
  await ensureHeaders(BLOG_SHEET_ID, 'Blogs!A:N', HEADERS);

  const existing = await readSheetRows(BLOG_SHEET_ID, 'Blogs!A:N');
  const existingSlugs = new Set(existing.slice(1).map(r => r[2]).filter(Boolean));

  interface BlogCSV { ID: string; Title: string; Date: string; Slug: string; 'Local URL': string; 'Live URL': string; Author: string; Categories: string; 'Featured Image': string; 'Content (Plain)': string; 'Word Count': string }
  const csvRows = readCSV<BlogCSV>('blog_posts.csv');

  const rows: string[][] = [];
  for (const r of csvRows) {
    const slug = r.Slug?.trim();
    if (!slug || existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);

    const content = stripElementorCSS(r['Content (Plain)'] || '');
    const title = (r.Title || '').replace(/^"|"$/g, '');
    const cats = (r.Categories || '').split('|').map(c => c.trim()).filter(Boolean);
    const category = cats[0] || 'Homoeopathy';
    const tags = cats.join(', ');
    const coverUrl = r['Featured Image'] || '';
    const publishedDate = r.Date || new Date().toISOString().split('T')[0];

    rows.push([
      `wp-${r.ID}`, title, slug, excerpt(content), coverUrl,
      category, tags, r.Author || 'Dr. Shweta Goyal', publishedDate, publishedDate,
      'published', excerpt(content, 160), '', '',
    ]);
  }

  await appendRows(BLOG_SHEET_ID, 'Blogs!A:N', rows);
  console.log(`  ${rows.length} blog posts imported (${csvRows.length - rows.length} duplicates skipped)`);
}

// ─── 3. Import Condition Pages ───────────────────────────────────────────────

async function importConditions() {
  console.log('\n=== CONDITIONS ===');

  const HEADERS = ['slug', 'name', 'shortDesc', 'intro', 'symptoms', 'howHomeopathyHelps', 'icon', 'status', 'category'];
  await ensureHeaders(CONDITIONS_SHEET_ID, 'Conditions!A:I', HEADERS);

  const existing = await readSheetRows(CONDITIONS_SHEET_ID, 'Conditions!A:I');
  const existingSlugs = new Set(existing.slice(1).map(r => r[0]).filter(Boolean));

  interface PageCSV { ID: string; Title: string; Slug: string; Date: string; 'Local URL': string; 'Content (Plain)': string }
  const csvRows = readCSV<PageCSV>('pages.csv');

  const rows: string[][] = [];
  for (const r of csvRows) {
    const wpSlug = r.Slug?.trim();
    const conditionSlug = CONDITION_SLUGS[wpSlug];
    if (!conditionSlug) continue; // not a condition page
    if (existingSlugs.has(conditionSlug)) {
      console.log(`  ~ ${conditionSlug} already exists, skipping`);
      continue;
    }
    existingSlugs.add(conditionSlug);

    const content = stripElementorCSS(r['Content (Plain)'] || '');

    // Extract symptoms: lines starting with \t that look like symptom names
    const symptomLines = content.split(/[\t\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 3 && s.length < 120 && !s.includes('.') && !s.includes(':') && /^[A-Z]/.test(s));
    const symptoms = symptomLines.slice(0, 15).join('|');

    // Extract intro: first substantial paragraph after cleaning
    const paragraphs = content.split(/\n\n|\t\t/).map(p => p.trim()).filter(p => p.length > 100);
    const intro = paragraphs[0] || excerpt(content, 500);

    // Extract "how homeopathy helps" section
    const helpIdx = content.toLowerCase().indexOf('role of homoeopathy') !== -1
      ? content.toLowerCase().indexOf('role of homoeopathy')
      : content.toLowerCase().indexOf('homoeopathy');
    const helpText = helpIdx > 0 ? excerpt(content.slice(helpIdx), 500) : '';

    rows.push([
      conditionSlug, r.Title?.trim() || '', excerpt(content, 120), intro,
      symptoms, helpText, 'Activity', 'published', CATEGORY_MAP[conditionSlug] || '',
    ]);
  }

  await appendRows(CONDITIONS_SHEET_ID, 'Conditions!A:I', rows);
  console.log(`  ${rows.length} conditions imported`);
}

// ─── 4. Copy Photos ─────────────────────────────────────────────────────────

function copyPhotos() {
  console.log('\n=== PHOTOS ===');
  const srcDir = path.join(EXPORT_DIR, 'photos');
  const destDir = path.join(ROOT, 'public', 'photos');

  if (!fs.existsSync(srcDir)) { console.log('  No photos directory found'); return; }
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
  let copied = 0, skipped = 0;
  for (const file of files) {
    const dest = path.join(destDir, file);
    if (fs.existsSync(dest)) { skipped++; continue; }
    fs.copyFileSync(path.join(srcDir, file), dest);
    copied++;
  }
  console.log(`  ${copied} photos copied, ${skipped} already existed`);
}

// ─── 5. Save non-condition pages as reference JSON ───────────────────────────

function saveReferencePages() {
  console.log('\n=== REFERENCE PAGES ===');
  interface PageCSV { ID: string; Title: string; Slug: string; Date: string; 'Local URL': string; 'Content (Plain)': string }
  const csvRows = readCSV<PageCSV>('pages.csv');

  const nonCondition = csvRows.filter(r => !CONDITION_SLUGS[r.Slug?.trim()]);
  const output = nonCondition.map(r => ({
    id: r.ID,
    title: r.Title?.trim(),
    slug: r.Slug?.trim(),
    date: r.Date,
    content: stripElementorCSS(r['Content (Plain)'] || '').slice(0, 2000),
  }));

  const outPath = path.join(ROOT, 'data', 'wp-pages-reference.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`  ${output.length} non-condition pages saved to data/wp-pages-reference.json`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('WordPress Export → Google Sheets Import');
  console.log('=======================================\n');

  extractZip();
  await importTestimonials();
  await importBlogPosts();
  await importConditions();
  copyPhotos();
  saveReferencePages();

  console.log('\n=======================================');
  console.log('Done! All data has been imported.');
}

main().catch(e => {
  console.error('\nFATAL:', e.message);
  if (e.response?.data) console.error(e.response.data);
  process.exit(1);
});
