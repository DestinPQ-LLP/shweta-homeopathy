'use client';
import { useEffect, useState } from 'react';
import styles from './notes.module.css';

export interface NoteRow {
  id: string;
  patientName: string;
  date: string;
  caseId: string;
  driveFileId: string;
  driveFileName: string;
  docId: string;
  docUrl: string;
  status: string;
  extractedTextPreview: string;
}

interface Props {
  notes: NoteRow[];
}

/**
 * Build the best previewable URL for the uploaded scan/image.
 *  - Drive thumbnail endpoint serves a JPEG preview for PDFs and images alike.
 *  - We use a large size so it stays sharp inside the modal.
 */
function driveThumbUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`;
}

function driveOpenUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
}

export default function NotesTable({ notes }: Props) {
  const [open, setOpen] = useState<NoteRow | null>(null);
  const [fullText, setFullText] = useState<string>('');
  const [loadingText, setLoadingText] = useState(false);

  // Pull the full extracted text (if any) from the linked Google Doc when the modal opens.
  useEffect(() => {
    if (!open) { setFullText(''); return; }
    let cancelled = false;
    if (!open.docId) return;
    setLoadingText(true);
    fetch(`/api/admin/notes/${open.id}/text`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(j => { if (!cancelled) setFullText(j.text || ''); })
      .catch(() => { /* fall back to preview */ })
      .finally(() => { if (!cancelled) setLoadingText(false); });
    return () => { cancelled = true; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
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
              <tr
                key={n.id}
                onClick={() => setOpen(n)}
                style={{ cursor: 'pointer' }}
                title="Click to view image and text"
              >
                <td>{n.patientName}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{n.date}</td>
                <td>{n.caseId || '—'}</td>
                <td className={styles.preview}>{n.extractedTextPreview || '—'}</td>
                <td><span className={styles.badge}>{n.status}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  {n.docUrl
                    ? <a href={n.docUrl} target="_blank" rel="noopener noreferrer" className={styles.linkDoc}>Open Doc ↗</a>
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Note for ${open.patientName}`}
          onClick={() => setOpen(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 12, width: 'min(1200px, 100%)',
              maxHeight: '90vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid #eaeaea',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{open.patientName || 'Session note'}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  {open.date && <span>{open.date}</span>}
                  {open.caseId && <span> &middot; Case {open.caseId}</span>}
                  {open.driveFileName && <span> &middot; {open.driveFileName}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {open.docUrl && (
                  <a href={open.docUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Open Doc ↗</a>
                )}
                {open.driveFileId && (
                  <a href={driveOpenUrl(open.driveFileId)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Open File ↗</a>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(null)} aria-label="Close">✕</button>
              </div>
            </div>

            {/* Body — image left, text right */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, flex: 1, minHeight: 0 }}>
              <div style={{
                background: '#0b0b0b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16, overflow: 'auto',
              }}>
                {open.driveFileId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={driveThumbUrl(open.driveFileId)}
                    alt={open.driveFileName || 'Uploaded scan'}
                    style={{ maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain', background: '#fff', borderRadius: 4 }}
                  />
                ) : (
                  <div style={{ color: '#bbb', fontSize: 14 }}>No file attached</div>
                )}
              </div>
              <div style={{ padding: 20, overflow: 'auto', background: '#fafafa' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Extracted text
                </h4>
                {loadingText && <p style={{ color: '#888', fontSize: 13 }}>Loading full text…</p>}
                <pre style={{
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit',
                  fontSize: 14, lineHeight: 1.55, color: '#222', margin: 0,
                }}>
                  {fullText || open.extractedTextPreview || '(No text extracted.)'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
