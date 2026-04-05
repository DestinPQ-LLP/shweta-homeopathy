/**
 * fix-blog-covers.ts  
 * Directly maps copied blog images → slugs → updates sheet col E (coverImageUrl)
 */
import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const SHEET_ID = process.env.GOOGLE_SHEETS_BLOG_ID!;
const BLOG_DIR = path.join(process.cwd(), 'public/photos/blog');
const WP_UPLOADS = '/Applications/MAMP/htdocs/old/wp-content/uploads';

// Sheet columns (0-indexed): id=0, title=1, slug=2, excerpt=3, coverImageUrl=4
const SLUG_COL = 2;
const COVER_COL = 4; // E

// Map: CSV slug → WP image relative path (from blog_posts.csv Featured Image column)
const CSV_PATH = path.join(process.cwd(), 'public/blog_posts.csv');

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (line[i] === ',' && !inQ) { result.push(cur); cur = ''; }
    else cur += line[i];
  }
  result.push(cur);
  return result;
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/__+/g, '_');
}

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function main() {
  // 1. Parse CSV to get slug → featured image map
  const lines = fs.readFileSync(CSV_PATH, 'utf-8').split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  const slugIdx = headers.indexOf('Slug');
  const imgIdx  = headers.indexOf('Featured Image');
  
  const slugToImg: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const cols = parseCSVLine(line);
    const slug = (cols[slugIdx] || '').trim();
    const img  = (cols[imgIdx]  || '').trim();
    if (slug && img && !img.endsWith('.pdf')) slugToImg[slug] = img;
  }
  console.log(`📋 Found ${Object.keys(slugToImg).length} blog posts with images in CSV`);

  // 2. Resolve which images actually exist locally (copied already)
  const slugToCover: Record<string, string> = {};
  for (const [slug, wpPath] of Object.entries(slugToImg)) {
    const full = path.join(WP_UPLOADS, wpPath);
    if (fs.existsSync(full)) {
      const safeName = sanitize(path.basename(full));
      const dest = path.join(BLOG_DIR, safeName);
      if (!fs.existsSync(dest)) { fs.mkdirSync(BLOG_DIR, { recursive: true }); fs.copyFileSync(full, dest); }
      slugToCover[slug] = `/photos/blog/${safeName}`;
    }
  }
  console.log(`📁 ${Object.keys(slugToCover).length} images resolved locally`);

  // 3. Get sheet rows
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const resp = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Blogs!A:E' });
  const rows = (resp.data.values || []) as string[][];
  console.log(`📊 Sheet has ${rows.length} rows (including header)`);
  if (rows.length > 0) console.log('   Header:', rows[0]);

  // 4. Update each matching row
  let updated = 0;
  const updateData: { range: string; values: string[][] }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const slug = (rows[i][SLUG_COL] || '').trim();
    const cover = slugToCover[slug];
    if (cover && !rows[i][COVER_COL]) {
      const range = `Blogs!E${i + 1}`;
      updateData.push({ range, values: [[cover]] });
      console.log(`  ✅ Row ${i+1} (${slug}): ${cover}`);
      updated++;
    }
  }

  if (updateData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updateData },
    });
  }

  console.log(`\n✅ Done! Updated ${updated} rows.`);
}

main().catch(e => { console.error(e); process.exit(1); });
