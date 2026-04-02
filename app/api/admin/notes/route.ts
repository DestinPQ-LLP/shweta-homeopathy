import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet, readSheet } from '@/lib/google/sheets';
import { createBlogDoc } from '@/lib/google/docs';
import { randomUUID } from 'crypto';

const BOOKINGS_ID = () => process.env.GOOGLE_SHEETS_BOOKINGS_ID || '';
const RANGE_NOTES = 'Notes!A:J';
const HEADERS = ['id','patientName','date','caseId','driveFileId','driveFileName','docId','docUrl','status','extractedTextPreview'];

async function ensureNotesSheet() {
  const rows = await readSheet(BOOKINGS_ID(), RANGE_NOTES);
  if (!rows || rows.length === 0) {
    await appendToSheet(BOOKINGS_ID(), RANGE_NOTES, [HEADERS]);
  }
}

export async function GET() {
  try {
    await ensureNotesSheet();
    const rows = (await readSheet(BOOKINGS_ID(), RANGE_NOTES)) as string[][];
    const data  = rows.length > 1 ? rows.slice(1) : [];
    const notes = data.map(row => ({
      id:                   row[0] || '',
      patientName:          row[1] || '',
      date:                 row[2] || '',
      caseId:               row[3] || '',
      driveFileId:          row[4] || '',
      driveFileName:        row[5] || '',
      docId:                row[6] || '',
      docUrl:               row[7] || '',
      status:               row[8] || '',
      extractedTextPreview: row[9] || '',
    }));
    return NextResponse.json({ notes });
  } catch (err) {
    console.error('[notes GET]', err);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: { patientName: string; date: string; caseId?: string; cleanedNote: string; driveFileId?: string; driveFileName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { patientName, date, caseId = '', cleanedNote, driveFileId = '', driveFileName = '' } = body;
  if (!patientName || !date || !cleanedNote) {
    return NextResponse.json({ error: 'patientName, date, and cleanedNote are required' }, { status: 400 });
  }

  try {
    await ensureNotesSheet();
    const id   = randomUUID();
    const docTitle = `Note — ${patientName} — ${date}`;
    const htmlContent = `<h1>${docTitle}</h1><pre style="font-family:inherit;white-space:pre-wrap">${cleanedNote}</pre>`;
    let docId = '', docUrl = '';
    try {
      const doc = await createBlogDoc({ title: docTitle, htmlContent });
      docId = doc.docId; docUrl = doc.url;
    } catch (e) {
      console.warn('createBlogDoc failed (SA quota?), saving note without doc link:', (e as Error).message);
    }
    const preview = cleanedNote.slice(0, 120).replace(/\n/g, ' ');
    const row = [id, patientName, date, caseId, driveFileId, driveFileName, docId, docUrl, 'saved', preview];
    await appendToSheet(BOOKINGS_ID(), RANGE_NOTES, [row]);
    return NextResponse.json({ id, docId, docUrl, status: 'saved' }, { status: 201 });
  } catch (err) {
    console.error('[notes POST]', err);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
