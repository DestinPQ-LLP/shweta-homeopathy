'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Manual cache-buster for blog pages.
 * Use this after editing the Google Sheet directly so that public ISR pages
 * (which use `revalidate = 60`) get rebuilt immediately instead of waiting
 * up to a minute.
 */
export default function RefreshBlogsButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  async function handleClick() {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/blog/revalidate', { method: 'POST' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setMsg(`Refreshed (${j.count ?? 0} posts).`);
      startTransition(() => router.refresh());
    } catch (e) {
      setMsg(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={handleClick}
        disabled={busy || pending}
        title="Re-fetch from Google Sheets and clear public-page cache"
      >
        {busy || pending ? 'Refreshing…' : '↻ Refresh from Sheet'}
      </button>
      {msg && (
        <small style={{ color: msg.startsWith('Failed') ? '#c53030' : '#2f855a' }}>
          {msg}
        </small>
      )}
    </span>
  );
}
