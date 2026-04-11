import { google, type sheets_v4 } from 'googleapis';
import type { GoogleAuth } from 'googleapis-common';

// ---------------------------------------------------------------------------
// Auth — singleton so we don't re-parse credentials + mint tokens per call
// ---------------------------------------------------------------------------

let _auth: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (_auth) return _auth;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new SheetsError('GOOGLE_SERVICE_ACCOUNT_KEY is not set', 'config');
  const credentials = JSON.parse(raw);
  if (credentials.private_key)
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
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

export type SheetsErrorKind = 'transient' | 'permission' | 'not_found' | 'config' | 'unknown';

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
    if (status === 429 || status === 503 || status === 500) return 'transient';
    if (status === 403 || status === 401) return 'permission';
    if (status === 404) return 'not_found';

    const msg = String((err as Error).message ?? '');
    if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up/i.test(msg)) return 'transient';
    if (/quota|rate/i.test(msg)) return 'transient';
  }
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Retry wrapper — only retries transient / unknown errors
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const kind = classifyError(err);
      const status = (err as { code?: number }).code;

      if (kind !== 'transient' && kind !== 'unknown') {
        console.error(`[sheets] ${label} failed (${kind}, status=${status}):`, (err as Error).message);
        throw new SheetsError((err as Error).message ?? String(err), kind, status);
      }

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
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
// Public API
// ---------------------------------------------------------------------------

export async function appendToSheet(
  sheetId: string,
  range: string,
  values: (string | number | null)[][],
) {
  await withRetry(`append(${range})`, () =>
    getSheetsClient().spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
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
