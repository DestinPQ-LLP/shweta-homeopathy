'use client';
import { useState, useRef } from 'react';
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

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError('');
  }

  async function runOcr() {
    if (!file) { setError('Please select an image first.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/ocr', { method: 'POST', body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `OCR failed (${res.status})`);
      }
      const result: OcrResult = await res.json();
      setOcrResult(result);
      setEditedNote(result.cleanedNote);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OCR failed');
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
      setTimeout(() => router.push('/admin/notes'), 1800);
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
            <div className={s.uploadIcon}>📄</div>
            <p className={s.uploadLabel}>
              {file ? file.name : <><strong>Click to choose</strong> or drag &amp; drop an image</>}
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          {previewUrl && <img src={previewUrl} alt="Preview" className={s.preview} />}
          <div className={s.actions}>
            <button className="btn btn-primary" disabled={!file || loading} onClick={runOcr}>
              {loading ? <span className={s.spinner} /> : 'Extract Text'}
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
            <label className={s.label}>Extracted &amp; Cleaned Note</label>
            <textarea className={s.textarea} value={editedNote} onChange={e => setEditedNote(e.target.value)} />
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
        <p className={s.successMsg}>Saved! Redirecting to notes list…</p>
      )}
    </div>
  );
}
