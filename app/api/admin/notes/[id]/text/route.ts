import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth';
import { readSheet } from '@/lib/google/sheets';
import { getDocPlainText } from '@/lib/google/docs';

const RANGE_NOTES = 'Notes!A:K';

/**
 * Return the full extracted text for a session note, pulled live from the
 * linked Google Doc. Falls back to the preview column on the sheet.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getTokenFromRequest(req);
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEETS_BOOKINGS_ID;
  if (!sheetId) return NextResponse.json({ error: 'Sheet not configured' }, { status: 500 });

  try {
    const { id } = await params;
    const rows = (await readSheet(sheetId, RANGE_NOTES)) as string[][] | null;
    const row = rows?.find((r, i) => i > 0 && r[0] === id);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const docId = row[6] || '';
    const preview = row[9] || '';

    let text = preview;
    if (docId) {
      try {
        const full = await getDocPlainText(docId);
        if (full && full.trim()) text = full;
      } catch (e) {
        console.warn('[notes/text] getDocPlainText failed:', (e as Error).message);
      }
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error('[admin/notes/[id]/text]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
