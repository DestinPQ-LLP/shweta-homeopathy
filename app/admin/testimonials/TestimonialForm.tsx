'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Testimonial } from '@/lib/testimonials';
import s from './testimonials-admin.module.css';

interface Props {
  testimonial?: Testimonial;
}

export default function TestimonialForm({ testimonial }: Props) {
  const router  = useRouter();
  const isEdit  = !!testimonial?.id;

  const [name,      setName]      = useState(testimonial?.name      ?? '');
  const [location,  setLocation]  = useState(testimonial?.location  ?? '');
  const [condition, setCondition] = useState(testimonial?.condition ?? '');
  const [rating,    setRating]    = useState(testimonial?.rating    ?? 5);
  const [text,      setText]      = useState(testimonial?.text      ?? '');
  const [status,    setStatus]    = useState<'published'|'draft'>(testimonial?.status ?? 'draft');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !text.trim() || !condition.trim()) {
      setError('Name, condition and review text are required.');
      return;
    }
    setSaving(true);
    try {
      const url    = isEdit ? `/api/admin/testimonials/${testimonial!.id}` : '/api/admin/testimonials';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, condition, rating, text, status }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      router.push('/admin/testimonials');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      {error && <p className={s.formError}>{error}</p>}

      <div className={s.row2}>
        <div className={s.field}>
          <label className={s.label}>Patient Name *</label>
          <input className={s.input} value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Ramesh Kumar" required />
        </div>
        <div className={s.field}>
          <label className={s.label}>Location</label>
          <input className={s.input} value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Zirakpur, Punjab" />
        </div>
      </div>

      <div className={s.row2}>
        <div className={s.field}>
          <label className={s.label}>Condition Treated *</label>
          <input className={s.input} value={condition} onChange={e => setCondition(e.target.value)}
            placeholder="e.g. Chronic Sinusitis" required />
        </div>
        <div className={s.field}>
          <label className={s.label}>Rating (1–5) *</label>
          <select className={s.input} value={rating} onChange={e => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map(r => (
              <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r})</option>
            ))}
          </select>
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>Review Text *</label>
        <textarea className={s.textarea} value={text} onChange={e => setText(e.target.value)}
          rows={6} placeholder="Patient's testimonial in their own words…" required />
      </div>

      <div className={s.field}>
        <label className={s.label}>Status</label>
        <div className={s.radioGroup}>
          {(['draft', 'published'] as const).map(st => (
            <label key={st} className={s.radioLabel}>
              <input type="radio" name="status" value={st}
                checked={status === st} onChange={() => setStatus(st)} />
              {st === 'published' ? '✅ Published (visible on site)' : '📝 Draft (hidden)'}
            </label>
          ))}
        </div>
      </div>

      <div className={s.formActions}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Testimonial')}
        </button>
        <button type="button" className="btn btn-ghost"
          onClick={() => router.push('/admin/testimonials')} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
