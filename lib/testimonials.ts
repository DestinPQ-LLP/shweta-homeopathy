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
  // Two historical layouts coexist in the same sheet:
  //   Old layout:    id | name | location | condition | rating  | text   | status | createdAt | imageUrl
  //                  [0]  [1]    [2]        [3]         [4]       [5]      [6]      [7]         [8]
  //   Google layout: id | name | text     | rating    | condition | location | imageUrl | source | clinic | status
  //                  [0]  [1]    [2]        [3]         [4]         [5]        [6]        [7]      [8]      [9]
  //
  // Disambiguate using the *content* of the columns that differ structurally:
  //   - Old layout: row[6] is one of 'published'/'draft' (status) and row[7] is an ISO date.
  //   - Google layout: row[7] is the source name ('Google' / 'WordPress' / etc.).
  // The previous "row[3] is numeric" heuristic was wrong because the old
  // layout's row[4] (rating) is also numeric — that mis-identification caused
  // the rating value (e.g. "5") to be displayed as the condition.
  const col6 = (row[6] ?? '').toLowerCase();
  const col7 = row[7] ?? '';
  const isOldLayout = col6 === 'published' || col6 === 'draft';
  const isGoogleLayout = !isOldLayout && (col7 === 'Google' || col7 === 'WordPress' || row.length >= 10);

  if (isGoogleLayout) {
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
  // Old layout
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
  await updateSheetRow(SHEET_ID(), `${TAB}!A${sheetRow}:I${sheetRow}`, [testimonialToRow(updated)]);
  return updated;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const found = await getTestimonialById(id);
  if (!found) return false;
  // Tab GID 0 (first sheet). Adjust if your tab is not the first.
  await deleteSheetRow(SHEET_ID(), 0, found.rowIndex);
  return true;
}
