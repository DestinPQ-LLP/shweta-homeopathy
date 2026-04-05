import { readSheet, appendToSheet, updateSheetRow, deleteSheetRow } from './google/sheets';

const SHEET_ID = () => process.env.GOOGLE_SHEETS_TESTIMONIALS_ID || '';
const TAB = 'Testimonials';
// Old cols: id|name|location|condition|rating|text|status|createdAt|imageUrl (A:I)
// New cols from Google reviews: id|name|text|rating|condition|location|imageUrl|source|clinic|status (A:J)
// We extend range to A:J to capture all columns
const RANGE = `${TAB}!A:J`;
const HEADERS = ['id', 'name', 'location', 'condition', 'rating', 'text', 'status', 'createdAt', 'imageUrl', 'source'];

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  condition: string;
  rating: number;
  text: string;
  status: 'published' | 'draft';
  createdAt: string;
  imageUrl?: string;
  source?: string;  // 'Google' | 'WordPress' | undefined
  clinic?: string;  // 'Zirakpur' | 'Budhlada' | undefined
}

function rowToTestimonial(row: string[]): Testimonial {
  // Detect layout: Google reviews have text in col[2], old layout has location in col[2]
  // Google layout: id|name|text|rating|condition|location|imageUrl|source|clinic|status
  // Old layout:    id|name|location|condition|rating|text|status|createdAt|imageUrl
  const isGoogleLayout = row[7] === 'Google' || row[7] === 'WordPress' && row[3] && !isNaN(Number(row[3]));
  // Actually detect by checking if col[3] is numeric (rating in Google layout)
  const looksLikeGoogleLayout = !isNaN(Number(row[3])) && row.length >= 9;

  if (looksLikeGoogleLayout) {
    // Google layout: id|name|text|rating|condition|location|imageUrl|source|clinic|status
    return {
      id:        row[0] ?? '',
      name:      row[1] ?? '',
      text:      row[2] ?? '',
      rating:    parseInt(row[3] ?? '5', 10) || 5,
      condition: row[4] ?? '',
      location:  row[5] ?? '',
      imageUrl:  row[6] ?? '',
      source:    row[7] ?? '',
      clinic:    row[8] ?? '',
      status:    (row[9] === 'published' ? 'published' : 'draft'),
      createdAt: '',
    };
  }
  // Old layout: id|name|location|condition|rating|text|status|createdAt|imageUrl
  return {
    id:        row[0] ?? '',
    name:      row[1] ?? '',
    location:  row[2] ?? '',
    condition: row[3] ?? '',
    rating:    parseInt(row[4] ?? '5', 10) || 5,
    text:      row[5] ?? '',
    status:    (row[6] === 'published' ? 'published' : 'draft'),
    createdAt: row[7] ?? '',
    imageUrl:  row[8] ?? '',
    source:    '',
    clinic:    '',
  };
}

function testimonialToRow(t: Omit<Testimonial, 'createdAt'> & { createdAt?: string }): string[] {
  return [
    t.id,
    t.name,
    t.location,
    t.condition,
    String(t.rating),
    t.text,
    t.status,
    t.createdAt ?? new Date().toISOString(),
    t.imageUrl ?? '',
  ];
}

async function ensureHeaders() {
  const rows = await readSheet(SHEET_ID(), RANGE);
  if (!rows || rows.length === 0) {
    await appendToSheet(SHEET_ID(), RANGE, [HEADERS]);
  }
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const rows = await readSheet(SHEET_ID(), RANGE);
  if (!rows || rows.length <= 1) return [];
  return rows.slice(1).filter(r => r[0]).map(rowToTestimonial);
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const all = await getAllTestimonials();
  return all.filter(t => t.status === 'published');
}

export async function getTestimonialById(id: string): Promise<{ testimonial: Testimonial; rowIndex: number } | null> {
  const rows = await readSheet(SHEET_ID(), RANGE);
  if (!rows || rows.length <= 1) return null;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) return { testimonial: rowToTestimonial(rows[i]), rowIndex: i };
  }
  return null;
}

export async function createTestimonial(
  data: Omit<Testimonial, 'id' | 'createdAt'>
): Promise<Testimonial> {
  await ensureHeaders();
  const id = `t_${Date.now()}`;
  const createdAt = new Date().toISOString();
  const t: Testimonial = { ...data, id, createdAt };
  await appendToSheet(SHEET_ID(), RANGE, [testimonialToRow(t)]);
  return t;
}

export async function updateTestimonial(
  id: string,
  data: Partial<Omit<Testimonial, 'id' | 'createdAt'>>
): Promise<Testimonial | null> {
  const found = await getTestimonialById(id);
  if (!found) return null;
  const updated: Testimonial = { ...found.testimonial, ...data };
  const sheetRow = found.rowIndex + 1; // 1-based
  await updateSheetRow(SHEET_ID(), `${TAB}!A${sheetRow}:H${sheetRow}`, [testimonialToRow(updated)]);
  return updated;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const found = await getTestimonialById(id);
  if (!found) return false;
  // Tab GID 0 (first sheet). Adjust if your tab is not the first.
  await deleteSheetRow(SHEET_ID(), 0, found.rowIndex);
  return true;
}
