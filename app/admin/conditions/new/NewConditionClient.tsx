'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import s from '../../clients/clients.module.css';

interface ConditionForm {
  slug: string; name: string; shortDesc: string; intro: string;
  symptoms: string; howHomeopathyHelps: string; icon: string; status: string;
}

const BLANK: ConditionForm = {
  slug: '', name: '', shortDesc: '', intro: '',
  symptoms: '', howHomeopathyHelps: '', icon: '', status: 'published',
};

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

export default function NewConditionClient() {
  const router            = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [form, setForm]     = useState<ConditionForm>(BLANK);

  function update(field: keyof ConditionForm, value: string) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !prev.slug) next.slug = toSlug(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.slug || !form.name) { setError('Slug and name are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const body = { ...form, symptoms: form.symptoms.split('\n').filter(Boolean) };
      const res  = await fetch('/api/admin/conditions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      router.push('/admin/conditions');
    } catch { setError('Network error.'); }
    finally { setSaving(false); }
  }

  return (
    <>
      <div className={s.header}>
        <span className={s.title}>New Condition</span>
        <Link href="/admin/conditions" className={`${s.btn} ${s.btnSecondary}`}>← Back</Link>
      </div>
      <div className={s.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label className={s.label}>Name *</label>
              <input className={s.input} value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Slug *</label>
              <input className={s.input} value={form.slug} onChange={e => update('slug', toSlug(e.target.value))} required />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Icon (emoji)</label>
              <input className={s.input} value={form.icon} onChange={e => update('icon', e.target.value)} placeholder="e.g. 🌿" />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Status</label>
              <select className={s.select} value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className={s.formGroupFull}>
              <label className={s.label}>Short Description</label>
              <input className={s.input} value={form.shortDesc} onChange={e => update('shortDesc', e.target.value)} />
            </div>
            <div className={s.formGroupFull}>
              <label className={s.label}>Intro</label>
              <textarea className={s.textarea} value={form.intro} onChange={e => update('intro', e.target.value)} />
            </div>
            <div className={s.formGroupFull}>
              <label className={s.label}>Symptoms (one per line)</label>
              <textarea className={s.textarea} style={{ minHeight: '120px' }} value={form.symptoms} onChange={e => update('symptoms', e.target.value)} placeholder="Persistent headache&#10;Fatigue&#10;Nausea" />
            </div>
            <div className={s.formGroupFull}>
              <label className={s.label}>How Homeopathy Helps</label>
              <textarea className={s.textarea} value={form.howHomeopathyHelps} onChange={e => update('howHomeopathyHelps', e.target.value)} />
            </div>
          </div>
          {error && <p className={s.errorMsg}>{error}</p>}
          <div className={s.formActions}>
            <button type="submit" disabled={saving} className={`${s.btn} ${s.btnPrimary}`}>
              {saving ? 'Creating…' : 'Create Condition'}
            </button>
            <Link href="/admin/conditions" className={`${s.btn} ${s.btnSecondary}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </>
  );
}
