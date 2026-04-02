import { NextRequest, NextResponse } from 'next/server';
import { updateSheetRow } from '@/lib/google/sheets';

const BOOKINGS_ID = () => process.env.GOOGLE_SHEETS_BOOKINGS_ID || '';
const VALID_STATUSES = ['New', 'Contacted', 'Confirmed', 'Cancelled', 'Completed'];

// PATCH /api/admin/leads/[rowIndex]  body: { status }
// rowIndex is 0-based data row index (excludes header row)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ rowIndex: string }> },
) {
  try {
    const { rowIndex: rowIndexStr } = await params;
    const rowIndex = parseInt(rowIndexStr, 10);
    if (isNaN(rowIndex) || rowIndex < 0) {
      return NextResponse.json({ error: 'Invalid row index' }, { status: 400 });
    }

    const body = await req.json();
    const status: string = String(body?.status ?? '').trim();
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Sheet row = rowIndex + 2 (row 1 = header, row 2 = first data row)
    const sheetRow = rowIndex + 2;
    // Column I = status (9th column)
    await updateSheetRow(BOOKINGS_ID(), `Leads!I${sheetRow}`, [[status]]);

    return NextResponse.json({ ok: true, rowIndex, status });
  } catch (err: unknown) {
    console.error('[leads PATCH]', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
