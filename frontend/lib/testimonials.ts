import { readSheet, appendToSheet, updateSheetRow, deleteSheetRow } from './google/sheets';

const SHEET_ID = () => process.env.GOOGLE_SHEETS_TESTIMONIALS_ID || '';
const TAB = 'Testimonials';
// Sheet columns: id | name | location | condition | rating | text | status | createdAt
const RANGE = `${TAB}!A:H`;
const HEADERS = ['id', 'name', 'location', 'condition', 'rating', 'text', 'status', 'createdAt'];

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  condition: string;
  rating: number;
  text: string;
  status: 'published' | 'draft';
  createdAt: string;
}

function rowToTestimonial(row: string[]): Testimonial {
  return {
    id:        row[0] ?? '',
    name:      row[1] ?? '',
    location:  row[2] ?? '',
    condition: row[3] ?? '',
    rating:    parseInt(row[4] ?? '5', 10) || 5,
    text:      row[5] ?? '',
    status:    (row[6] === 'published' ? 'published' : 'draft'),
    createdAt: row[7] ?? '',
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
