/**
 * import-to-sheets.ts
 * One-time script: reads blog_posts.csv + testimonials.csv and populates Google Sheets.
 * Run: npx tsx scripts/import-to-sheets.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';

// ── Config ──────────────────────────────────────────────────────────────────
const BLOG_SHEET_ID = '1ZacD0UBwBsp7W5Sj_5zcZ3oJXAmpeN4Y70L8UVsxf9Q';
const TESTI_SHEET_ID = '1pZMifrvZBXxF2UGAxlFPdfdcC0Etud7YJZwJ9ZLG9CI';

const PUBLIC_DIR = path.join(__dirname, '../public');
const BLOG_CSV = path.join(PUBLIC_DIR, 'blog_posts.csv');
const TESTI_CSV = path.join(PUBLIC_DIR, 'testimonials.csv');
const MEDIA_CSV = path.join(PUBLIC_DIR, 'media_library.csv');

// ── Google Auth ──────────────────────────────────────────────────────────────
function getAuth() {
  // Load .env manually since we're running as a script
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim();
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  
  let credentials: any;
  try {
    credentials = JSON.parse(raw);
  } catch {
    // Sometimes the key spans multiple lines in .env — try to find it differently
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
    const keyMatch = envContent.match(/GOOGLE_SERVICE_ACCOUNT_KEY=(\{[\s\S]*?\})\n/);
    if (!keyMatch) throw new Error('Cannot parse GOOGLE_SERVICE_ACCOUNT_KEY');
    credentials = JSON.parse(keyMatch[1]);
  }
  
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }
  
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// ── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const ch = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentField += '"';
        i += 2;
        continue;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
        continue;
      } else {
        currentField += ch;
        i++;
        continue;
      }
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ',') {
      currentRow.push(currentField);
      currentField = '';
      i++;
      continue;
    }

    if (ch === '\r' && next === '\n') {
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim())) rows.push(currentRow);
      currentRow = [];
      currentField = '';
      i += 2;
      continue;
    }

    if (ch === '\n') {
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim())) rows.push(currentRow);
      currentRow = [];
      currentField = '';
      i++;
      continue;
    }

    currentField += ch;
    i++;
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim())) rows.push(currentRow);
  }

  return rows;
}

// ── Sheets helpers ────────────────────────────────────────────────────────────

/** Ensures a named sheet/tab exists in the spreadsheet, creates it if not */
async function ensureSheetTab(auth: any, sheetId: string, tabName: string): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const existing = meta.data.sheets?.map(s => s.properties?.title) || [];
  if (!existing.includes(tabName)) {
    console.log(`  Creating tab: ${tabName}`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: tabName } } }],
      },
    });
  }
}

async function clearSheet(auth: any, sheetId: string, range: string) {
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    await sheets.spreadsheets.values.clear({ spreadsheetId: sheetId, range });
    console.log(`  ✓ Cleared ${range}`);
  } catch (e: any) {
    console.log(`  ⚠ Could not clear ${range}: ${e.message}`);
  }
}

async function appendRows(auth: any, sheetId: string, range: string, rows: any[][]) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
}

// ── Build media URL map ───────────────────────────────────────────────────────
function buildMediaMap(mediaRows: string[][]): Map<string, string> {
  // key = short file path (e.g. "2025/11/Endometriosis-Healing-through-Homeopathy.jpg")
  // value = local photo filename that exists
  const map = new Map<string, string>();
  for (const row of mediaRows.slice(1)) {
    const filePath = row[4] || ''; // File Path column
    const exportedFilename = row[8] || ''; // Exported Filename column
    if (filePath && exportedFilename) {
      map.set(filePath, exportedFilename);
    }
  }
  return map;
}

function resolveImagePath(featuredImage: string, mediaMap: Map<string, string>): string {
  if (!featuredImage) return '';
  // featuredImage is like "2025/11/Endometriosis-Healing-through-Homeopathy.jpg"
  const exported = mediaMap.get(featuredImage);
  if (exported) {
    return `/photos/${exported}`;
  }
  // Try to find by basename match
  const basename = featuredImage.split('/').pop() || '';
  for (const [key, val] of mediaMap.entries()) {
    if (key.endsWith(basename)) {
      return `/photos/${val}`;
    }
  }
  return '';
}

// ── Import Blog Posts ────────────────────────────────────────────────────────
async function importBlogs(auth: any, mediaMap: Map<string, string>) {
  console.log('\n📝 Importing Blog Posts...');
  
  const content = fs.readFileSync(BLOG_CSV, 'utf-8');
  const rows = parseCSV(content);
  
  if (rows.length < 2) {
    console.error('  ✗ No blog rows found in CSV');
    return;
  }
  
  console.log(`  Found ${rows.length - 1} posts`);
  
  // Header for blog sheet:
  // id | title | slug | excerpt | coverImageUrl | category | tags | author | publishedDate | updatedDate | status | metaDescription | docId | docUrl
  const BLOG_HEADERS = [
    'id', 'title', 'slug', 'excerpt', 'coverImageUrl', 'category', 'tags',
    'author', 'publishedDate', 'updatedDate', 'status', 'metaDescription', 'docId', 'docUrl'
  ];

  // CSV columns: ID, Title, Date, Slug, Local URL, Live URL, Author, Categories, Featured Image, Content (Plain), Word Count
  const blogRows: string[][] = [BLOG_HEADERS];
  
  for (const row of rows.slice(1)) {
    if (!row[0] || !row[1]) continue; // skip empty rows
    
    const id = `wp_${row[0]}`; // prefix WP id to avoid conflicts
    const title = row[1] || '';
    const date = row[2] || '';
    const slug = row[3] || '';
    const author = row[6] || 'Dr. Shweta Goyal';
    const categories = row[7] || 'Homoeopathy';
    const featuredImage = row[8] || '';
    const contentPlain = row[9] || '';
    const wordCount = row[10] || '0';
    
    // Build excerpt from first 300 chars of content (strip \t which are bullet separators)
    const cleanContent = contentPlain
      .replace(/\\t/g, ' ')
      .replace(/\[caption[^\]]*\]/g, '')
      .replace(/\[\/caption\]/g, '')
      .trim();
    const excerpt = cleanContent.substring(0, 300).trim() + (cleanContent.length > 300 ? '...' : '');
    
    // Format date: "2025-11-17" -> already in correct format
    const publishedDate = date.split('T')[0] || date;
    
    // Resolve image to local /photos/ path
    const coverImageUrl = resolveImagePath(featuredImage, mediaMap);
    
    // Category: take first category
    const category = categories.split('|')[0].trim() || 'Homoeopathy';
    const tags = categories.split('|').map((c: string) => c.trim()).join(',');
    
    // Meta description: first 160 chars of clean content
    const metaDescription = cleanContent.substring(0, 160).trim();
    
    blogRows.push([
      id, title, slug, excerpt, coverImageUrl, category, tags,
      author, publishedDate, publishedDate, 'published', metaDescription, '', ''
    ]);
  }
  
  // Ensure tab exists, then clear and re-populate
  await ensureSheetTab(auth, BLOG_SHEET_ID, 'Blogs');
  await clearSheet(auth, BLOG_SHEET_ID, 'Blogs!A:N');
  await appendRows(auth, BLOG_SHEET_ID, 'Blogs!A1', blogRows);
  
  console.log(`  ✓ Imported ${blogRows.length - 1} blog posts to Google Sheets`);
}

// ── Import Testimonials ───────────────────────────────────────────────────────
async function importTestimonials(auth: any) {
  console.log('\n💬 Importing Testimonials...');
  
  const content = fs.readFileSync(TESTI_CSV, 'utf-8');
  const rows = parseCSV(content);
  
  if (rows.length < 2) {
    console.error('  ✗ No testimonial rows found in CSV');
    return;
  }
  
  console.log(`  Found ${rows.length - 1} testimonials`);
  
  // Sheet columns: id | name | location | condition | rating | text | status | createdAt | imageUrl
  const TESTI_HEADERS = ['id', 'name', 'location', 'condition', 'rating', 'text', 'status', 'createdAt', 'imageUrl'];
  
  // CSV columns: Name, Condition/Role, Review Text, Image URL, Source
  const testiRows: string[][] = [TESTI_HEADERS];
  
  for (let i = 0; i < rows.slice(1).length; i++) {
    const row = rows.slice(1)[i];
    if (!row[0]) continue;
    
    const name = row[0] || '';
    const condition = row[1] || '';
    const text = row[2] || '';
    const imageUrlRaw = row[3] || '';
    
    // Convert WP URL to local photo path
    // e.g. "https://drshwetahomoeopathy.com/wp-content/uploads/2023/12/shalijatestimonial.jpg"
    // -> we have "17593_shalijatestimonial.jpg" locally
    let imageUrl = '';
    if (imageUrlRaw) {
      const basename = imageUrlRaw.split('/').pop() || '';
      // Check in photos folder by matching basename (strip extension variation)
      const photosDir = path.join(PUBLIC_DIR, 'photos');
      const photoFiles = fs.readdirSync(photosDir);
      const match = photoFiles.find(f => f.includes(basename.replace(/\.(jpe?g|png|webp)$/i, '')));
      if (match) {
        imageUrl = `/photos/${match}`;
      }
    }
    
    const id = `t_wp_${i + 1}`;
    const createdAt = new Date().toISOString();
    
    testiRows.push([
      id, name, '', condition, '5', text, 'published', createdAt, imageUrl
    ]);
  }
  
  // Ensure tab exists, then clear and re-populate
  await ensureSheetTab(auth, TESTI_SHEET_ID, 'Testimonials');
  await clearSheet(auth, TESTI_SHEET_ID, 'Testimonials!A:I');
  await appendRows(auth, TESTI_SHEET_ID, 'Testimonials!A1', testiRows);
  
  console.log(`  ✓ Imported ${testiRows.length - 1} testimonials to Google Sheets`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting CSV → Google Sheets import...\n');
  
  const auth = getAuth();
  
  // Parse media library to build filename map
  console.log('📂 Loading media library...');
  const mediaContent = fs.readFileSync(MEDIA_CSV, 'utf-8');
  const mediaRows = parseCSV(mediaContent);
  const mediaMap = buildMediaMap(mediaRows);
  console.log(`  Found ${mediaMap.size} media entries`);
  
  await importBlogs(auth, mediaMap);
  await importTestimonials(auth);
  
  console.log('\n✅ Import complete!');
  console.log('   Blog Sheet: https://docs.google.com/spreadsheets/d/' + BLOG_SHEET_ID);
  console.log('   Testimonials Sheet: https://docs.google.com/spreadsheets/d/' + TESTI_SHEET_ID);
}

main().catch((e) => {
  console.error('\n❌ Error:', e.message);
  process.exit(1);
});
