'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import s from './media.module.css';

interface DriveFile { id: string; name: string; mimeType: string; webViewLink: string; thumbnailLink: string; createdTime: string; size: string; }

function isImage(mimeType: string) { return mimeType.startsWith('image/'); }
function formatBytes(bytes: string) {
  const n = parseInt(bytes || '0', 10);
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

export default function MediaClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files,    setFiles]    = useState<DriveFile[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState<string>('');
  const [copied,   setCopied]   = useState(false);
  const [dragging, setDragging] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      setFiles(data.files || []);
    } catch { setError('Could not load media files.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  async function upload(file: File) {
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'Upload failed'); }
      await loadFiles();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Upload failed'); }
    finally { setUploading(false); }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const selectedFile = files.find(f => f.id === selected);
  const selectedUrl  = selectedFile ? `https://drive.google.com/uc?id=${selectedFile.id}` : '';

  return (
    <>
      {error && <p className={s.error}>{error}</p>}

      <label
        className={`${s.uploadZone} ${dragging ? s.uploadZoneActive : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className={s.uploadIcon}>☁️</div>
        <p className={s.uploadText}><strong>Click to upload</strong> or drag &amp; drop</p>
        <p className={s.uploadText}>Images, PDFs — max 10 MB</p>
        <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileInput} />
      </label>

      {uploading && (
        <div className={s.progress}><span className={s.spinner} /> Uploading to Google Drive…</div>
      )}

      {selected && selectedUrl && (
        <div className={s.copyBar}>
          <input className={s.copyInput} value={selectedUrl} readOnly />
          <button className="btn btn-primary" onClick={() => copyUrl(selectedUrl)}>
            {copied ? '✓ Copied' : 'Copy URL'}
          </button>
          <a href={selectedFile?.webViewLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Open ↗</a>
        </div>
      )}

      {loading ? (
        <p className={s.empty}>Loading…</p>
      ) : files.length === 0 ? (
        <p className={s.empty}>No files yet. Upload something above.</p>
      ) : (
        <div className={s.grid}>
          {files.map(f => (
            <div key={f.id} className={`${s.card} ${selected === f.id ? s.cardSelected : ''}`} onClick={() => setSelected(f.id === selected ? '' : f.id)}>
              {f.thumbnailLink && isImage(f.mimeType)
                ? <img src={f.thumbnailLink} alt={f.name} className={s.thumb} />
                : <div className={s.thumbPlaceholder}>{isImage(f.mimeType) ? '🖼️' : '📄'}</div>
              }
              <div className={s.cardBody}>
                <p className={s.cardName}>{f.name}</p>
                <p className={s.cardMeta}>{formatBytes(f.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
