import { NextResponse } from 'next/server';
import { readSheet } from '@/lib/google/sheets';

const BOOKINGS_ID = () => process.env.GOOGLE_SHEETS_BOOKINGS_ID || '';

export async function GET() {
  try {
    const [apptRows, contactRows] = await Promise.all([
      readSheet(BOOKINGS_ID(), 'Leads!A:I').catch(() => []),
      readSheet(BOOKINGS_ID(), 'Contacts!A:F').catch(() => []),
    ]);

    const headers = (rows: string[][]): { headers: string[], data: string[][] } => {
      if (!rows || rows.length === 0) return { headers: [], data: [] };
      return { headers: rows[0], data: rows.slice(1) };
    };

    const appt    = headers(apptRows    as string[][]);
    const contact = headers(contactRows as string[][]);

    const appointments = appt.data.map(row =>
      Object.fromEntries(appt.headers.map((h, i) => [h, row[i] ?? '']))
    );
    const contacts = contact.data.map(row =>
      Object.fromEntries(contact.headers.map((h, i) => [h, row[i] ?? '']))
    );

    return NextResponse.json({ appointments, contacts });
  } catch (err: unknown) {
    console.error('[leads]', err);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
