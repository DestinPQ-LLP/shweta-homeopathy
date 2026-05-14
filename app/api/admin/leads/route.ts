import { NextResponse } from 'next/server';
import { readSheet } from '@/lib/google/sheets';

const BOOKINGS_ID = () => process.env.GOOGLE_SHEETS_BOOKINGS_ID || '';

export async function GET() {
  try {
    const [apptRows, contactRows] = await Promise.all([
      readSheet(BOOKINGS_ID(), 'Leads!A:J').catch(() => []),
      readSheet(BOOKINGS_ID(), 'Contacts!A:F').catch(() => []),
    ]);

    // Normalize header names to camelCase so Title Case sheet headers
    // (e.g. "Timestamp", "PreferredTime") match the client-side APPT_COLS keys.
    const toCamel = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

    const headers = (rows: string[][]): { headers: string[], data: string[][] } => {
      if (!rows || rows.length === 0) return { headers: [], data: [] };
      return { headers: rows[0].map(toCamel), data: rows.slice(1) };
    };

    const appt    = headers(apptRows    as string[][]);
    const contact = headers(contactRows as string[][]);

    // A real appointment row must have at least a timestamp (col 0) or name (col 1).
    // Phantom rows created by mis-targeted status updates only have data in col 8 (status).
    const appointments = appt.data
      .filter(row => row[0]?.trim() || row[1]?.trim())
      .map(row =>
        Object.fromEntries(appt.headers.map((h, i) => [h, row[i] ?? '']))
      );
    // A real contact row must have at least a timestamp (col 0) or name (col 1).
    const contacts = contact.data
      .filter(row => row[0]?.trim() || row[1]?.trim())
      .map(row =>
        Object.fromEntries(contact.headers.map((h, i) => [h, row[i] ?? '']))
      );

    return NextResponse.json({ appointments, contacts });
  } catch (err: unknown) {
    console.error('[leads]', err);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
