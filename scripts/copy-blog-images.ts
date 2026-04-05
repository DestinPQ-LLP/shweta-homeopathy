/**
 * copy-blog-images.ts
 * Copies blog cover images from MAMP WordPress uploads to public/photos/blog/
 * Then updates the Google Sheets `Blogs` tab with correct local image URLs.
 */

import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';

const WP_UPLOADS = '/Applications/MAMP/htdocs/old/wp-content/uploads';
const DEST_DIR   = path.join(process.cwd(), 'public/photos/blog');
const CSV_PATH   = path.join(process.cwd(), 'public/blog_posts.csv');

const SHEET_ID   = process.env.GOOGLE_SHEETS_BLOG_ID!;
const RANGE      = 'Blogs!A:N';

// Simple CSV parser that handles quoted fields
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim(); });
    return obj;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current);
  return result;
}


// ─── Google Auth ─────────────────────────────────────────────────────────────
function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
  const creds = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// ─── Read current sheet rows ─────────────────────────────────────────────────
async function getSheetRows(): Promise<string[][]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const resp = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: RANGE });
  return (resp.data.values || []) as string[][];
}

// ─── Update a single cell ────────────────────────────────────────────────────
async function updateCell(rowIdx: number, colIdx: number, value: string) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  // Columns: A=0(id), B=1(title), C=2(slug), D=3(excerpt), E=4(coverImageUrl), ...
  const colLetter = String.fromCharCode(65 + colIdx);
  const range = `Blogs!${colLetter}${rowIdx + 1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [[value]] },
  });
}

// ─── Resolve WP image path ────────────────────────────────────────────────────
function resolveWpImage(rawPath: string): string | null {
  if (!rawPath) return null;
  // rawPath is like "2025/11/Endometriosis-Healing-through-Homeopathy.jpg"
  // or could be a PDF stub like "2025/11/SomeFile.pdf" — skip non-images
  if (rawPath.endsWith('.pdf')) return null;
  const full = path.join(WP_UPLOADS, rawPath);
  if (fs.existsSync(full)) return full;
  // try without extension mismatch
  return null;
}

// ─── Sanitize filename ────────────────────────────────────────────────────────
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/__+/g, '_');
}

async function main() {
  // Ensure destination
  fs.mkdirSync(DEST_DIR, { recursive: true });

  // Parse CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parseCSV(csvContent);


  console.log(`\n📂 Processing ${records.length} blog posts for images...\n`);

  // Get sheet rows to map slugs → row index
  const rows = await getSheetRows();
  const headerRow = rows[0] || [];
  const slugCol = headerRow.indexOf('slug');
  const coverCol = headerRow.indexOf('coverImageUrl');

  if (slugCol < 0 || coverCol < 0) {
    console.error('❌ Could not find slug or coverImageUrl columns in sheet');
    process.exit(1);
  }

  let copied = 0;
  let updated = 0;
  let skipped = 0;

  for (const record of records) {
    const slug = record['Slug'] || '';
    const rawImg = record['Featured Image'] || '';

    if (!rawImg || rawImg.endsWith('.pdf')) {
      console.log(`  ⏭  Skipping "${slug}" — no image or PDF`);
      skipped++;
      continue;
    }

    const srcPath = resolveWpImage(rawImg);
    if (!srcPath) {
      console.log(`  ⚠️  Image not found locally: ${rawImg}`);
      skipped++;
      continue;
    }

    const ext = path.extname(srcPath);
    const safeName = sanitizeFilename(path.basename(srcPath));
    const destPath = path.join(DEST_DIR, safeName);

    // Copy
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✅ Copied: ${safeName}`);
      copied++;
    } else {
      console.log(`  ⏭  Already exists: ${safeName}`);
    }

    const publicUrl = `/photos/blog/${safeName}`;

    // Find in sheet rows
    const rowIdx = rows.findIndex((row, i) => i > 0 && row[slugCol] === slug);
    if (rowIdx < 0) {
      console.log(`  ⚠️  Slug not found in sheet: ${slug}`);
      continue;
    }

    // Update coverImageUrl in sheet if it's empty or a placeholder
    const currentCover = rows[rowIdx][coverCol] || '';
    if (!currentCover || currentCover.startsWith('2025/')) {
      await updateCell(rowIdx, coverCol, publicUrl);
      console.log(`  📝 Updated sheet row ${rowIdx + 1}: ${publicUrl}`);
      updated++;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Images copied: ${copied}`);
  console.log(`   Sheet rows updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
