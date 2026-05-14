'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import s from './OcrReviewForm.module.css';

type Step = 1 | 2 | 3;

interface OcrResult {
  rawTranscription: string;
  cleanedNote: string;
  uncertainItems: { text: string; reason: string }[];
  driveFileId: string;
  driveFileName: string;
}

interface ClientOption { id: string; name: string; }

export default function OcrReviewForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step,        setStep]        = useState<Step>(1);
  const [file,        setFile]        = useState<File | null>(null);
  const [previewUrl,  setPreviewUrl]  = useState('');
  const [ocrResult,   setOcrResult]   = useState<OcrResult | null>(null);
  const [editedNote,  setEditedNote]  = useState('');
  const [patientName, setPatientName] = useState('');
  const [date,        setDate]        = useState(new Date().toISOString().slice(0, 10));
  const [caseId,      setCaseId]      = useState('');
  const [clientId,    setClientId]    = useState('');
  const [clients,     setClients]     = useState<ClientOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const isPdf = file ? file.type === 'application/pdf' : false;

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(d => setClients((d.clients || []).map((c: ClientOption) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  }, []);

  // When a client is selected, pre-fill patient name
  function handleClientChange(id: string) {
    setClientId(id);
    if (id) {
      const c = clients.find(c => c.id === id);
      if (c) setPatientName(c.name);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError('');
  }

  async function runOcr() {
    if (!file) { setError('Please select a file first.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);

      if (isPdf) {
        // PDFs: upload to Drive directly, skip OCR
        const res = await fetch('/api/admin/ocr', { method: 'POST', body: fd });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `Upload failed (${res.status})`);
        }
        const result = await res.json();
        setOcrResult({ rawTranscription: '', cleanedNote: '', uncertainItems: [], driveFileId: result.driveFileId, driveFileName: result.driveFileName });
        setEditedNote('');
        setStep(2);
      } else {
        // Images: run OCR
        const res = await fetch('/api/admin/ocr', { method: 'POST', body: fd });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `OCR failed (${res.status})`);
        }
        const result: OcrResult = await res.json();
        setOcrResult(result);
        setEditedNote(result.cleanedNote);
        setStep(2);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    if (!patientName || !date) { setError('Patient name and date are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          date,
          caseId,
          clientId,
          cleanedNote: editedNote,
          driveFileId: ocrResult?.driveFileId || '',
          driveFileName: ocrResult?.driveFileName || '',
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Save failed (${res.status})`);
      }
      setStep(3);
      setSuccess('Note saved to Google Sheets and Docs!');
      setTimeout(() => router.push(clientId ? `/admin/clients/${clientId}` : '/admin/notes'), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.wizard}>
      <div className={s.steps}>
        {(['1. Upload','2. Review','3. Save'] as const).map((label, i) => (
          <div key={label} className={`${s.step} ${step === i + 1 ? s.stepActive : ''} ${step > i + 1 ? s.stepDone : ''}`}>
            {label}
          </div>
        ))}
      </div>

      {error   && <p className={s.errMsg}>{error}</p>}
      {success && <p className={s.successMsg}>{success}</p>}

      {step === 1 && (
        <>
          <label className={s.uploadBox} onClick={() => fileInputRef.current?.click()}>
            <div className={s.uploadIcon}>{isPdf ? '📑' : '📄'}</div>
            <p className={s.uploadLabel}>
              {file
                ? file.name
                : <><strong>Click to choose</strong> or drag &amp; drop — image or PDF</>}
            </p>
            <p style={{ fontSize: '0.8em', color: 'var(--clr-text-lt)', margin: '4px 0 0' }}>
              Supported: JPEG, PNG, WebP · PDF (Samsung Notes export, prescriptions)
            </p>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf,.pdf" onChange={handleFileChange} />
          </label>
          {previewUrl && !isPdf && <img src={previewUrl} alt="Preview" className={s.preview} />}
          {isPdf && file && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-sage)', margin: '8px 0', fontWeight: 600 }}>
              📑 PDF selected — it will be uploaded to Google Drive. You can type or paste the note text manually on the next step.
            </p>
          )}
          <div className={s.actions}>
            <button className="btn btn-primary" disabled={!file || loading} onClick={runOcr}>
              {loading
                ? <span className={s.spinner} />
                : isPdf ? 'Upload PDF →' : 'Extract Text'}
            </button>
          </div>
        </>
      )}

      {step === 2 && ocrResult && (
        <>
          {ocrResult.uncertainItems.length > 0 && (
            <div className={s.uncertainBox}>
              <p className={s.uncertainTitle}>⚠ Uncertain items — please verify:</p>
              <ul className={s.uncertainList}>
                {ocrResult.uncertainItems.map((item, i) => (
                  <li key={i}><strong>{item.text}</strong> — {item.reason}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={s.field}>
            <label className={s.label}>
              {ocrResult?.rawTranscription
                ? 'Extracted & Cleaned Note'
                : 'Case Note (type or paste content from the PDF)'}
            </label>
            <textarea className={s.textarea} value={editedNote} onChange={e => setEditedNote(e.target.value)}
              placeholder={ocrResult?.rawTranscription ? '' : 'Type or paste the case note content here…'} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Link to Client (optional)</label>
            <select className={s.input} value={clientId} onChange={e => handleClientChange(e.target.value)}>
              <option value="">— Select client —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>

          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>Patient Name *</label>
              <input className={s.input} value={patientName} onChange={e => setPatientName(e.target.value)} required />
            </div>
            <div className={s.field}>
              <label className={s.label}>Date *</label>
              <input className={s.input} type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>

          <div className={s.field}>
            <label className={s.label}>Case ID (optional)</label>
            <input className={s.input} value={caseId} onChange={e => setCaseId(e.target.value)} placeholder="e.g. C-2024-001" />
          </div>

          <div className={s.actions}>
            <button className="btn btn-primary" disabled={loading} onClick={saveNote}>
              {loading ? <span className={s.spinner} /> : 'Save Note'}
            </button>
            <button className="btn btn-ghost" onClick={() => setStep(1)} disabled={loading}>Back</button>
          </div>
        </>
      )}

      {step === 3 && (
        <p className={s.successMsg}>Saved! Redirecting…</p>
      )}
    </div>
  );
}
