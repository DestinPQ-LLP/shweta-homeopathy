'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import s from '../clients.module.css';

interface Client {
  id: string; name: string; email: string; phone: string; dob: string;
  address: string; firstConsultationDate: string; concern: string;
  notes: string; docId: string; docUrl: string; driveFolderId: string; status: string;
}

export default function ClientDetailClient({ client }: { client: Client }) {
  const [sessionDate, setSessionDate] = useState('');
  const [uploading, setUploading]     = useState(false);
  const [ocrText, setOcrText]         = useState('');
  const [ocrError, setOcrError]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setOcrError('Please select an image file.'); return; }
    setUploading(true);
    setOcrText('');
    setOcrError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      if (sessionDate) fd.append('sessionDate', sessionDate);
      const res = await fetch(`/api/admin/clients/${client.id}/notes`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setOcrError(data.error || 'Upload failed'); return; }
      setOcrText(data.text || '(no text extracted)');
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      setOcrError('Network error, please try again.');
    } finally {
      setUploading(false);
    }
  }

  const fields: [string, string][] = [
    ['Phone',           client.phone || '—'],
    ['Email',           client.email || '—'],
    ['Date of Birth',   client.dob   || '—'],
    ['Address',         client.address || '—'],
    ['First Visit',     client.firstConsultationDate || '—'],
    ['Status',          client.status],
    ['Concern',         client.concern || '—'],
    ['Internal Notes',  client.notes  || '—'],
  ];

  return (
    <>
      <div className={s.header}>
        <div>
          <span className={s.title}>{client.name}</span>
          <span className={s.count} style={{ marginLeft: '0.75rem' }}>
            <code style={{ fontSize: '0.8rem' }}>{client.id}</code>
          </span>
        </div>
        <div className={s.actions}>
          <Link href={`/admin/clients/${client.id}/edit`} className={`${s.btn} ${s.btnSecondary}`}>Edit</Link>
          <Link href="/admin/clients" className={`${s.btn} ${s.btnSecondary}`}>← Back</Link>
        </div>
      </div>

      <div className={s.detailGrid}>
        {/* Left: client info */}
        <div className={s.card}>
          <p className={s.cardTitle}>Client Information</p>
          <dl className={s.dl}>
            {fields.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {client.docUrl && (
            <div style={{ marginTop: '1rem' }}>
              <dt className={s.label}>Google Doc (session notes)</dt>
              <dd>
                <a href={client.docUrl} target="_blank" rel="noopener noreferrer" className={s.docLink}>
                  Open Client Doc ↗
                </a>
              </dd>
            </div>
          )}
        </div>

        {/* Right: OCR upload */}
        <div>
          <div className={s.card}>
            <p className={s.cardTitle}>Upload Doctor&apos;s Handwritten Note</p>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
              Photo of a handwritten note will be OCR&apos;d and appended to the client&apos;s Google Doc automatically.
            </p>
            <form onSubmit={handleUpload}>
              <div className={s.formGroup} style={{ marginBottom: '0.75rem' }}>
                <label className={s.label}>Session Date (optional)</label>
                <input type="date" className={s.input} value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
              </div>
              <div
                className={s.uploadArea}
                onClick={() => fileRef.current?.click()}
                onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                tabIndex={0}
                role="button"
                aria-label="Select image"
              >
                <div>📷</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.4rem' }}>
                  Click to select image (JPG/PNG)
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
              </div>
              {ocrError && <p className={s.errorMsg}>{ocrError}</p>}
              <div className={s.formActions}>
                <button type="submit" disabled={uploading} className={`${s.btn} ${s.btnPrimary}`}>
                  {uploading ? 'Processing…' : 'Extract & Save Note'}
                </button>
              </div>
            </form>

            {ocrText && (
              <>
                <p className={s.successMsg}>✓ Note appended to client doc.</p>
                <div className={s.noteResult}>{ocrText}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
