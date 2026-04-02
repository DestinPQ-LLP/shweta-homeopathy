import { readSheet, updateSheetRow, appendToSheet } from './google/sheets';

const SHEET_ID = () => process.env.GOOGLE_SHEETS_LANDING_ID || '';

const LANDING_TAB = 'LandingConfig';
const TRACKING_TAB = 'TrackingConfig';

// Columns: headline | subheadline | video_url | whatsapp_number | whatsapp_message | cta_text
const LANDING_HEADERS = ['headline', 'subheadline', 'video_url', 'whatsapp_number', 'whatsapp_message', 'cta_text'];
// Columns: meta_pixel_id | google_ads_id | google_ads_label
const TRACKING_HEADERS = ['meta_pixel_id', 'google_ads_id', 'google_ads_label'];

export interface LandingConfig {
  headline: string;
  subheadline: string;
  video_url: string;
  whatsapp_number: string;
  whatsapp_message: string;
  cta_text: string;
}

export interface TrackingConfig {
  meta_pixel_id: string;
  google_ads_id: string;
  google_ads_label: string;
}

export const LANDING_DEFAULTS: LandingConfig = {
  headline: 'Get Lasting Relief from Chronic Conditions — Naturally',
  subheadline:
    'Personalised classical homeopathic treatment by Dr. Shweta Goyal. Safe for all ages, no side effects.',
  video_url: '',
  whatsapp_number: '916284411753',
  whatsapp_message: "Hi Dr. Shweta, I'd like to book a consultation",
  cta_text: 'Chat on WhatsApp Now',
};

export const TRACKING_DEFAULTS: TrackingConfig = {
  meta_pixel_id: '',
  google_ads_id: '',
  google_ads_label: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseRow(headers: string[], row: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  headers.forEach((h, i) => { map[h] = row[i] ?? ''; });
  return map;
}

async function ensureTab(sheetId: string, tab: string, headers: string[]) {
  const range = `${tab}!A:Z`;
  const rows = await readSheet(sheetId, range);
  if (!rows || rows.length === 0) {
    await appendToSheet(sheetId, range, [headers, headers.map(() => '')]);
  } else if (rows.length === 1) {
    // Has header but no data row
    await appendToSheet(sheetId, range, [headers.map(() => '')]);
  }
}

async function readTabRow(sheetId: string, tab: string, headers: string[]): Promise<Record<string, string>> {
  await ensureTab(sheetId, tab, headers);
  const rows = await readSheet(sheetId, `${tab}!A:Z`);
  const dataRow = rows[1] ?? [];
  return parseRow(headers, dataRow);
}

async function writeTabRow(sheetId: string, tab: string, headers: string[], values: Record<string, string>) {
  await ensureTab(sheetId, tab, headers);
  const row = headers.map(h => values[h] ?? '');
  const colEnd = String.fromCharCode(65 + headers.length - 1); // A, B, C, …
  await updateSheetRow(sheetId, `${tab}!A2:${colEnd}2`, [row]);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getLandingConfig(): Promise<LandingConfig> {
  try {
    const id = SHEET_ID();
    if (!id) return LANDING_DEFAULTS;
    const map = await readTabRow(id, LANDING_TAB, LANDING_HEADERS);
    return {
      headline: map['headline'] || LANDING_DEFAULTS.headline,
      subheadline: map['subheadline'] || LANDING_DEFAULTS.subheadline,
      video_url: map['video_url'] || LANDING_DEFAULTS.video_url,
      whatsapp_number: map['whatsapp_number'] || LANDING_DEFAULTS.whatsapp_number,
      whatsapp_message: map['whatsapp_message'] || LANDING_DEFAULTS.whatsapp_message,
      cta_text: map['cta_text'] || LANDING_DEFAULTS.cta_text,
    };
  } catch {
    return LANDING_DEFAULTS;
  }
}

export async function setLandingConfig(config: Partial<LandingConfig>): Promise<void> {
  const id = SHEET_ID();
  if (!id) throw new Error('GOOGLE_SHEETS_LANDING_ID is not set');
  const current = await getLandingConfig();
  await writeTabRow(id, LANDING_TAB, LANDING_HEADERS, { ...current, ...config });
}

export async function getTrackingConfig(): Promise<TrackingConfig> {
  try {
    const id = SHEET_ID();
    if (!id) return TRACKING_DEFAULTS;
    const map = await readTabRow(id, TRACKING_TAB, TRACKING_HEADERS);
    return {
      meta_pixel_id: map['meta_pixel_id'] ?? '',
      google_ads_id: map['google_ads_id'] ?? '',
      google_ads_label: map['google_ads_label'] ?? '',
    };
  } catch {
    return TRACKING_DEFAULTS;
  }
}

export async function setTrackingConfig(config: Partial<TrackingConfig>): Promise<void> {
  const id = SHEET_ID();
  if (!id) throw new Error('GOOGLE_SHEETS_LANDING_ID is not set');
  const current = await getTrackingConfig();
  await writeTabRow(id, TRACKING_TAB, TRACKING_HEADERS, { ...current, ...config });
}
