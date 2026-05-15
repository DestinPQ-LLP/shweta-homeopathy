import { google, type sheets_v4 } from 'googleapis';
import type { GoogleAuth } from 'googleapis-common';

// ---------------------------------------------------------------------------
// Auth — singleton so we don't re-parse credentials + mint tokens per call
// ---------------------------------------------------------------------------

let _auth: GoogleAuth | null = null;

/**
 * Parse the service-account credentials from env. Accepts either:
 *   1. Raw JSON pasted directly into the env var, or
 *   2. Base64-encoded JSON (recommended for Vercel — avoids newline / quoting issues
 *      that frequently corrupt the `private_key` field when pasted into the UI).
 *
 * Set `GOOGLE_SERVICE_ACCOUNT_KEY_B64` to the base64-encoded JSON to use option 2.
 */
function parseCredentials(): Record<string, unknown> {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64;
  if (b64) {
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (e) {
      throw new SheetsError(
        `Failed to decode GOOGLE_SERVICE_ACCOUNT_KEY_B64: ${(e as Error).message}`,
        'config',
      );
    }
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new SheetsError(
      'Neither GOOGLE_SERVICE_ACCOUNT_KEY nor GOOGLE_SERVICE_ACCOUNT_KEY_B64 is set',
      'config',
    );
  }
  try {
    return JSON.parse(raw);
  } catch (e1) {
    // Common Vercel pitfall: JSON pasted into the UI gets real newlines inside
    // the `private_key` string, which makes JSON.parse fail. As a last-ditch
    // attempt, escape any unescaped newlines and try again.
    try {
      const fixed = raw.replace(/\r/g, '').replace(/\n/g, '\\n');
      return JSON.parse(fixed);
    } catch {
      throw new SheetsError(
        `GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON (${(e1 as Error).message}). ` +
        `Tip: set GOOGLE_SERVICE_ACCOUNT_KEY_B64 to the base64-encoded JSON instead.`,
        'config',
      );
    }
  }
}

function getAuth(): GoogleAuth {
  if (_auth) return _auth;
  const credentials = parseCredentials() as { private_key?: string; client_email?: string };
  if (typeof credentials.private_key === 'string') {
    // Normalize escaped newlines that survive Vercel's env-var encoding.
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }
  if (!credentials.private_key || !credentials.client_email) {
    throw new SheetsError(
      'Service account credentials are missing private_key or client_email',
      'config',
    );
  }
  _auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/gmail.send',
    ],
  });
  return _auth;
}

function getSheetsClient(): sheets_v4.Sheets {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

// ---------------------------------------------------------------------------
// Custom error with classification
// ---------------------------------------------------------------------------

export type SheetsErrorKind = 'transient' | 'quota' | 'permission' | 'not_found' | 'config' | 'unknown';

export class SheetsError extends Error {
  kind: SheetsErrorKind;
  status?: number;

  constructor(message: string, kind: SheetsErrorKind, status?: number) {
    super(message);
    this.name = 'SheetsError';
    this.kind = kind;
    this.status = status;
  }
}

function classifyError(err: unknown): SheetsErrorKind {
  if (err && typeof err === 'object') {
    const status = (err as { code?: number; status?: number }).code
      ?? (err as { code?: number; status?: number }).status;
    const msg = String((err as Error).message ?? '');

    if (/quota|rate.*limit/i.test(msg) || status === 429) return 'quota';
    if (status === 503 || status === 500) return 'transient';
    if (status === 403 || status === 401) return 'permission';
    if (status === 404) return 'not_found';
    // "Unable to parse range: SheetName!A:Z" means the tab doesn't exist — not retryable
    if (/unable to parse range/i.test(msg)) return 'not_found';
    if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up/i.test(msg)) return 'transient';
  }
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Concurrency limiter — prevents thundering herd during SSG build
// Google Sheets free tier: 60 reads/min/user, 300 reads/min/project
// ---------------------------------------------------------------------------

const MAX_CONCURRENT = 3;
let _inFlight = 0;
const _queue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (_inFlight < MAX_CONCURRENT) {
    _inFlight++;
    return Promise.resolve();
  }
  return new Promise<void>(resolve => {
    _queue.push(() => { _inFlight++; resolve(); });
  });
}

function releaseSlot() {
  _inFlight--;
  const next = _queue.shift();
  if (next) next();
}

// ---------------------------------------------------------------------------
// Retry wrapper — quota errors get much longer backoff
// ---------------------------------------------------------------------------

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 500;
const QUOTA_DELAY_MS = 5_000;

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  await acquireSlot();
  try {
    return await _withRetryInner(label, fn);
  } finally {
    releaseSlot();
  }
}

async function _withRetryInner<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const kind = classifyError(err);
      const status = (err as { code?: number }).code;

      if (kind !== 'transient' && kind !== 'quota' && kind !== 'unknown') {
        console.error(`[sheets] ${label} failed (${kind}, status=${status}):`, (err as Error).message);
        throw new SheetsError((err as Error).message ?? String(err), kind, status);
      }

      if (attempt < MAX_RETRIES) {
        const delay = kind === 'quota'
          ? QUOTA_DELAY_MS * attempt
          : BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`[sheets] ${label} attempt ${attempt}/${MAX_RETRIES} failed (${kind}), retrying in ${delay}ms…`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  const kind = classifyError(lastErr);
  const status = (lastErr as { code?: number }).code;
  console.error(`[sheets] ${label} failed after ${MAX_RETRIES} attempts:`, (lastErr as Error).message);
  throw new SheetsError((lastErr as Error).message ?? String(lastErr), kind, status);
}

// ---------------------------------------------------------------------------
// Tab management — auto-create a missing sheet tab
// ---------------------------------------------------------------------------

/** Parses "TabName!A:Z" → "TabName" (returns undefined for bare ranges like "A:Z") */
function parseTabName(range: string): string | undefined {
  const bang = range.indexOf('!');
  return bang > 0 ? range.slice(0, bang) : undefined;
}

/**
 * Ensures a sheet tab exists. If not, creates it with a header row.
 * Safe to call even if the tab already exists (will silently skip).
 */
export async function ensureSheetTab(
  sheetId: string,
  tabName: string,
  headers?: string[],
): Promise<void> {
  const sheets = getSheetsClient();

  // Check if the tab already exists
  const meta = await withRetry(`getSheetMeta(${tabName})`, () =>
    sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'sheets.properties.title' }),
  );
  const exists = (meta.data.sheets ?? []).some(
    (s) => s.properties?.title === tabName,
  );

  if (!exists) {
    console.log(`[sheets] Tab "${tabName}" not found — creating it...`);
    await withRetry(`createTab(${tabName})`, () =>
      sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: tabName } } }],
        },
      }),
    );

    if (headers?.length) {
      await appendToSheet(sheetId, `${tabName}!A1`, [headers]);
    }
    console.log(`[sheets] Tab "${tabName}" created successfully.`);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function appendToSheet(
  sheetId: string,
  range: string,
  values: (string | number | null)[][],
) {
  // Use a fixed-cell anchor (TabName!A1) rather than a column range.
  // The values.append API detects a "table" starting from the first column of the
  // given range. If we pass "Tab!A:J", Sheets can misidentify the table start as a
  // non-A column when some rows have data only in later columns. Anchoring to A1
  // forces the table's first column to always be A so data is written from column A.
  const tabName   = range.includes('!') ? range.split('!')[0] : range;
  const anchoredRange = `${tabName}!A1`;

  await withRetry(`append(${range})`, () =>
    getSheetsClient().spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: anchoredRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    }),
  );
}

export async function readSheet(
  sheetId: string,
  range: string,
): Promise<string[][]> {
  const res = await withRetry(`read(${range})`, () =>
    getSheetsClient().spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    }),
  );
  return (res.data.values as string[][]) || [];
}

export async function updateSheetRow(
  sheetId: string,
  range: string,
  values: (string | number | null)[][],
) {
  await withRetry(`update(${range})`, () =>
    getSheetsClient().spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    }),
  );
}

export async function deleteSheetRow(sheetId: string, sheetTabId: number, rowIndex: number) {
  await withRetry(`deleteRow(tab=${sheetTabId}, row=${rowIndex})`, () =>
    getSheetsClient().spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetTabId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        }],
      },
    }),
  );
}
