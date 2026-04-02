import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import styles from './notes.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Session Notes — Admin' };

interface Note {
  id: string; patientName: string; date: string; caseId: string;
  driveFileId: string; driveFileName: string; docId: string; docUrl: string;
  status: string; extractedTextPreview: string;
}

async function fetchNotes(): Promise<{ notes: Note[]; error?: string }> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res  = await fetch(`${base}/api/admin/notes`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return res.json();
  } catch {
    return { notes: [], error: 'Could not load notes.' };
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
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Case ID</th>
                <th>Preview</th>
                <th>Status</th>
                <th>Doc</th>
              </tr>
            </thead>
            <tbody>
              {notes.map(n => (
                <tr key={n.id}>
                  <td>{n.patientName}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{n.date}</td>
                  <td>{n.caseId || '—'}</td>
                  <td className={styles.preview}>{n.extractedTextPreview || '—'}</td>
                  <td><span className={styles.badge}>{n.status}</span></td>
                  <td>
                    {n.docUrl
                      ? <a href={n.docUrl} target="_blank" rel="noopener noreferrer" className={styles.linkDoc}>Open Doc ↗</a>
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
