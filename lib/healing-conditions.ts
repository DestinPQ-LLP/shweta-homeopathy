import { readSheet, appendToSheet, updateSheetRow, deleteSheetRow } from './google/sheets';
import type { ConditionCategory } from './conditions';
import { STATIC_CONDITIONS } from './static-conditions';

const SHEET_ID = () => process.env.GOOGLE_SHEETS_CONDITIONS_ID || '';
const TAB      = 'Conditions';
const RANGE    = `${TAB}!A:I`;
// Columns: slug | name | shortDesc | intro | symptoms | howHomeopathyHelps | icon | status | category
const HEADERS  = ['slug','name','shortDesc','intro','symptoms','howHomeopathyHelps','icon','status','category'];

export interface HealingCondition {
  slug: string;
  name: string;
  shortDesc: string;
  intro: string;
  symptoms: string[];          // stored as pipe-separated in sheet
  howHomeopathyHelps: string;
  icon: string;
  status: 'published' | 'draft';
  category?: ConditionCategory;
}

function clean(s: string): string {
  return s.replace(/\\t/g, ' ').replace(/\t/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function rowToCondition(row: string[]): HealingCondition {
  return {
    slug:               (row[0] ?? '').trim(),
    name:               clean(row[1] ?? ''),
    shortDesc:          clean(row[2] ?? ''),
    intro:              clean(row[3] ?? ''),
    symptoms:           (row[4] ?? '').split('|').map(s => clean(s)).filter(Boolean),
    howHomeopathyHelps: clean(row[5] ?? ''),
    icon:               (row[6] ?? '').trim(),
    status:             row[7] === 'draft' ? 'draft' : 'published',
    category:           (row[8] as ConditionCategory) || undefined,
  };
}

function conditionToRow(c: HealingCondition): string[] {
  return [
    c.slug, c.name, c.shortDesc, c.intro,
    c.symptoms.join('|'), c.howHomeopathyHelps, c.icon, c.status, c.category ?? '',
  ];
}

async function ensureHeaders() {
  try {
    const rows = await readSheet(SHEET_ID(), RANGE);
    if (!rows || rows.length === 0) await appendToSheet(SHEET_ID(), RANGE, [HEADERS]);
  } catch {
    await appendToSheet(SHEET_ID(), RANGE, [HEADERS]);
  }
}

let _conditionRowsCache: { data: string[][]; ts: number } | null = null;
const CONDITIONS_TTL = 5 * 60 * 1000; // 5 min

async function getConditionRows(): Promise<string[][]> {
  if (_conditionRowsCache && Date.now() - _conditionRowsCache.ts < CONDITIONS_TTL) return _conditionRowsCache.data;
  const rows = await readSheet(SHEET_ID(), RANGE);
  const data = rows ?? [];
  _conditionRowsCache = { data, ts: Date.now() };
  return data;
}

export async function getAllConditions(includeDraft = false): Promise<HealingCondition[]> {
  const rows = await getConditionRows();
  if (!rows || rows.length <= 1) return STATIC_CONDITIONS.filter(c => includeDraft || c.status === 'published');
  const all = rows.slice(1).filter(r => r[0]).map(rowToCondition);
  return includeDraft ? all : all.filter(c => c.status === 'published');
}

export async function getConditionBySlug(slug: string): Promise<{ condition: HealingCondition; rowIndex: number } | null> {
  const rows = await getConditionRows();
  if (!rows || rows.length <= 1) {
    const staticMatch = STATIC_CONDITIONS.find(c => c.slug === slug);
    return staticMatch ? { condition: staticMatch, rowIndex: -1 } : null;
  }
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === slug) return { condition: rowToCondition(rows[i]), rowIndex: i };
  }
  // Also check static conditions if not found in sheet
  const staticMatch = STATIC_CONDITIONS.find(c => c.slug === slug);
  return staticMatch ? { condition: staticMatch, rowIndex: -1 } : null;
}

export async function createCondition(data: HealingCondition): Promise<HealingCondition> {
  await ensureHeaders();
  await appendToSheet(SHEET_ID(), RANGE, [conditionToRow(data)]);
  _conditionRowsCache = null;
  return data;
}

export async function updateCondition(slug: string, data: Partial<HealingCondition>): Promise<HealingCondition | null> {
  const found = await getConditionBySlug(slug);
  if (!found) return null;
  const updated: HealingCondition = { ...found.condition, ...data };
  const sheetRow = found.rowIndex + 1;
  await updateSheetRow(SHEET_ID(), `${TAB}!A${sheetRow}:I${sheetRow}`, [conditionToRow(updated)]);
  _conditionRowsCache = null;
  return updated;
}

export async function deleteCondition(slug: string): Promise<boolean> {
  const found = await getConditionBySlug(slug);
  if (!found) return false;
  await deleteSheetRow(SHEET_ID(), 0, found.rowIndex);
  _conditionRowsCache = null;
  return true;
}
