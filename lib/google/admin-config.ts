/**
 * Persistent admin configuration stored in a "Config" tab on the Bookings sheet.
 * Allows runtime changes (e.g. password) without a Vercel redeployment.
 *
 * Sheet structure (tab: "Config"):
 *   A          | B
 *   key        | value
 *   ---------- | -----
 *   admin_pw   | sha256:<hex>
 */
import { createHash, timingSafeEqual } from 'crypto';
import {
  readSheet,
  updateSheetRow,
  appendToSheet,
  ensureSheetTab,
  SheetsError,
} from './sheets';

const TAB = 'Config';
const KEY_PW = 'admin_pw';

function sheetId(): string {
  const id = process.env.GOOGLE_SHEETS_BOOKINGS_ID;
  if (!id) throw new Error('GOOGLE_SHEETS_BOOKINGS_ID is not set');
  return id;
}

/** Returns a pepper'd SHA-256 hash of a plaintext password */
function hashPassword(plain: string): string {
  const pepper = process.env.JWT_SECRET ?? 'fallback-pepper';
  return 'sha256:' + createHash('sha256').update(plain + pepper).digest('hex');
}

/** Verifies a plaintext password against a stored hash OR the env-var plaintext */
export function verifyPassword(plain: string, stored: string): boolean {
  if (stored.startsWith('sha256:')) {
    const expected = hashPassword(plain);
    const a = Buffer.from(expected);
    const b = Buffer.from(stored);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  // Legacy plaintext comparison (env-var fallback)
  const a = Buffer.from(plain ?? '');
  const b = Buffer.from(stored ?? '');
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Reads all config rows from the Config tab.
 * Returns null if the tab doesn't exist or the sheet is not configured.
 */
async function readConfigMap(): Promise<Map<string, string> | null> {
  const id = process.env.GOOGLE_SHEETS_BOOKINGS_ID;
  if (!id) return null;
  try {
    const rows = await readSheet(id, `${TAB}!A:B`);
    const map = new Map<string, string>();
    for (const [key, value] of rows.slice(1)) { // skip header row
      if (key) map.set(key, value ?? '');
    }
    return map;
  } catch (err) {
    if (err instanceof SheetsError && err.kind === 'not_found') return null;
    throw err;
  }
}

/**
 * Returns the stored admin password (hash) from the Config sheet,
 * or null if not set (caller should fall back to ADMIN_PASSWORD env var).
 */
export async function getStoredPasswordHash(): Promise<string | null> {
  try {
    const map = await readConfigMap();
    if (!map) return null;
    return map.get(KEY_PW) ?? null;
  } catch {
    return null; // Fail open — fall back to env var
  }
}

/**
 * Saves a new password hash to the Config sheet.
 * Creates the Config tab + header row if they don't exist.
 */
export async function savePasswordHash(newPlainPassword: string): Promise<void> {
  const id = sheetId();
  await ensureSheetTab(id, TAB, ['key', 'value']);

  const hash = hashPassword(newPlainPassword);

  // Check if the key row already exists
  let rows: string[][] = [];
  try {
    rows = await readSheet(id, `${TAB}!A:B`);
  } catch (err) {
    if (!(err instanceof SheetsError && err.kind === 'not_found')) throw err;
  }

  // Find existing row index (1-based, skipping header at row 1)
  const existingRowIndex = rows.findIndex((r, i) => i > 0 && r[0] === KEY_PW);

  if (existingRowIndex > 0) {
    // Update existing row (existingRowIndex is 0-based in the array, so +1 for 1-based sheet row)
    await updateSheetRow(id, `${TAB}!A${existingRowIndex + 1}:B${existingRowIndex + 1}`, [
      [KEY_PW, hash],
    ]);
  } else {
    // Append new row
    await appendToSheet(id, `${TAB}!A1`, [[KEY_PW, hash]]);
  }
}
