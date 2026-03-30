'use client';
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import styles from './landing.module.css';

interface LandingConfig {
  headline: string;
  subheadline: string;
  video_url: string;
  whatsapp_number: string;
  whatsapp_message: string;
  cta_text: string;
}

interface TrackingConfig {
  meta_pixel_id: string;
  google_ads_id: string;
  google_ads_label: string;
}

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] ?? '';
}

export default function LandingAdminPage() {
  const [landing, setLanding] = useState<LandingConfig>({
    headline: '',
    subheadline: '',
    video_url: '',
    whatsapp_number: '',
    whatsapp_message: '',
    cta_text: '',
  });
  const [tracking, setTracking] = useState<TrackingConfig>({
    meta_pixel_id: '',
    google_ads_id: '',
    google_ads_label: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = getToken();
    fetch('/api/admin/landing', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.landing) setLanding(data.landing);
        if (data.tracking) setTracking(data.tracking);
      })
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load config. Check GOOGLE_SHEETS_LANDING_ID.' }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const token = getToken();
    try {
      const res = await fetch('/api/admin/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ landing, tracking }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      setStatus({ type: 'success', msg: 'Saved! The landing page will update within 60 seconds.' });
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);
    const fd = new FormData();
    fd.append('file', file);
    const token = getToken();
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setLanding(prev => ({ ...prev, video_url: data.publicUrl }));
      setStatus({ type: 'success', msg: `Video uploaded. URL filled in below.` });
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error).message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <AdminLayout title="Landing Page">
      <div className={styles.page}>
        <p className={styles.intro}>
          This page controls the <strong>/ads</strong> landing page content and all tracking pixel IDs.
          Data is stored in the <code>LandingConfig</code> and <code>TrackingConfig</code> tabs of your
          Google Sheet (<code>GOOGLE_SHEETS_LANDING_ID</code>).
        </p>

        {status && (
          <div className={`${styles.alert} ${status.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
            {status.msg}
          </div>
        )}

        {loading ? (
          <p className={styles.loading}>Loading config from Google Sheets…</p>
        ) : (
          <form onSubmit={handleSave} className={styles.form}>

            {/* ── Landing Content ── */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🎯 Landing Page Content</h2>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="headline">Headline</label>
                <input
                  id="headline"
                  className={styles.input}
                  value={landing.headline}
                  onChange={e => setLanding(p => ({ ...p, headline: e.target.value }))}
                  placeholder="Get Lasting Relief from Chronic Conditions — Naturally"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="subheadline">Sub-headline</label>
                <textarea
                  id="subheadline"
                  className={`${styles.input} ${styles.textarea}`}
                  rows={3}
                  value={landing.subheadline}
                  onChange={e => setLanding(p => ({ ...p, subheadline: e.target.value }))}
                  placeholder="Personalised classical homeopathic treatment by Dr. Shweta Goyal…"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="cta_text">CTA Button Text</label>
                <input
                  id="cta_text"
                  className={styles.input}
                  value={landing.cta_text}
                  onChange={e => setLanding(p => ({ ...p, cta_text: e.target.value }))}
                  placeholder="Chat on WhatsApp Now"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="whatsapp_number">
                  WhatsApp Number <span className={styles.hint}>(include country code, digits only)</span>
                </label>
                <input
                  id="whatsapp_number"
                  className={styles.input}
                  value={landing.whatsapp_number}
                  onChange={e => setLanding(p => ({ ...p, whatsapp_number: e.target.value }))}
                  placeholder="916284411753"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="whatsapp_message">
                  WhatsApp Pre-filled Message
                </label>
                <input
                  id="whatsapp_message"
                  className={styles.input}
                  value={landing.whatsapp_message}
                  onChange={e => setLanding(p => ({ ...p, whatsapp_message: e.target.value }))}
                  placeholder="Hi Dr. Shweta, I'd like to book a consultation"
                />
              </div>
            </section>

            {/* ── Video ── */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🎬 Video</h2>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="video_url">
                  Video URL <span className={styles.hint}>(YouTube, video file, or Google Drive public URL)</span>
                </label>
                <input
                  id="video_url"
                  className={styles.input}
                  value={landing.video_url}
                  onChange={e => setLanding(p => ({ ...p, video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=…"
                />
              </div>

              <div className={styles.uploadRow}>
                <span className={styles.uploadLabel}>— or upload a video file —</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className={styles.fileInput}
                  onChange={handleVideoUpload}
                  disabled={uploading}
                />
                {uploading && <span className={styles.uploadingBadge}>Uploading…</span>}
              </div>

              {landing.video_url && (
                <div className={styles.videoPreview}>
                  <p className={styles.previewLabel}>Current video URL:</p>
                  <a href={landing.video_url} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                    {landing.video_url}
                  </a>
                  <button type="button" className={styles.clearBtn} onClick={() => setLanding(p => ({ ...p, video_url: '' }))}>
                    ✕ Remove
                  </button>
                </div>
              )}
            </section>

            {/* ── Tracking ── */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📡 Tracking Pixels</h2>
              <p className={styles.sectionNote}>
                Leave blank to disable a tracker. IDs are injected globally across all pages.
              </p>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="meta_pixel_id">
                  Meta (Facebook) Pixel ID
                </label>
                <input
                  id="meta_pixel_id"
                  className={styles.input}
                  value={tracking.meta_pixel_id}
                  onChange={e => setTracking(p => ({ ...p, meta_pixel_id: e.target.value }))}
                  placeholder="123456789012345"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="google_ads_id">
                  Google Ads Conversion ID <span className={styles.hint}>(e.g. AW-123456789)</span>
                </label>
                <input
                  id="google_ads_id"
                  className={styles.input}
                  value={tracking.google_ads_id}
                  onChange={e => setTracking(p => ({ ...p, google_ads_id: e.target.value }))}
                  placeholder="AW-123456789"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="google_ads_label">
                  Google Ads Conversion Label <span className={styles.hint}>(optional, for specific conversion events)</span>
                </label>
                <input
                  id="google_ads_label"
                  className={styles.input}
                  value={tracking.google_ads_label}
                  onChange={e => setTracking(p => ({ ...p, google_ads_label: e.target.value }))}
                  placeholder="AbCdEfGhIjKlMnOp"
                />
              </div>
            </section>

            <div className={styles.actions}>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? 'Saving…' : '💾 Save All Changes'}
              </button>
              <a href="/ads" target="_blank" className={styles.previewBtn}>
                ↗ Preview Landing Page
              </a>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
