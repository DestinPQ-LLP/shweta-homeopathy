import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import styles from './notes.module.css';
import { readSheet, appendToSheet } from '@/lib/google/sheets';
import NotesTable, { type NoteRow } from './NotesTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Session Notes — Admin' };

const RANGE_NOTES = 'Notes!A:K';
const HEADERS = ['id','patientName','date','caseId','driveFileId','driveFileName','docId','docUrl','status','extractedTextPreview','clientId'];

async function fetchNotes(): Promise<{ notes: NoteRow[]; error?: string }> {
  const sheetId = process.env.GOOGLE_SHEETS_BOOKINGS_ID;
  if (!sheetId) return { notes: [], error: 'GOOGLE_SHEETS_BOOKINGS_ID is not configured.' };
  try {
    let rows = (await readSheet(sheetId, RANGE_NOTES)) as string[][] | null;
    if (!rows || rows.length === 0) {
      await appendToSheet(sheetId, RANGE_NOTES, [HEADERS]);
      rows = [HEADERS];
    }
    const data = rows.length > 1 ? rows.slice(1) : [];
    const notes: NoteRow[] = data.filter(r => r[0]).map(row => ({
      id: row[0] || '', patientName: row[1] || '', date: row[2] || '',
      caseId: row[3] || '', driveFileId: row[4] || '', driveFileName: row[5] || '',
      docId: row[6] || '', docUrl: row[7] || '', status: row[8] || '',
      extractedTextPreview: row[9] || '',
    }));
    return { notes };
  } catch (err) {
    console.error('[admin/notes page] fetchNotes failed:', err);
    return { notes: [], error: `Could not load notes: ${(err as Error).message}` };
  }
}

export default async function NotesPage() {
  const { notes, error } = await fetchNotes();

  return (
    <AdminLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Session Notes</h1>
        <Link href="/admin/notes/new" className="btn btn-primary">+ New Note</Link>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {notes.length === 0 && !error ? (
        <p className={styles.empty}>No notes yet. <Link href="/admin/notes/new">Upload your first note →</Link></p>
      ) : (
        <NotesTable notes={notes} />
      )}
    </AdminLayout>
  );
}
