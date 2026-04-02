'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import s from '../../clients.module.css';

interface Client {
  id: string; name: string; email: string; phone: string; dob: string;
  address: string; firstConsultationDate: string; concern: string;
  notes: string; status: string;
}

export default function EditClientClient({ client }: { client: Client }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [form, setForm]     = useState({
    name:                  client.name,
    email:                 client.email,
    phone:                 client.phone,
    dob:                   client.dob,
    address:               client.address,
    firstConsultationDate: client.firstConsultationDate,
    concern:               client.concern,
    notes:                 client.notes,
    status:                client.status,
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Failed to update');
        return;
      }
      router.push(`/admin/clients/${client.id}`);
    } catch {
      setError('Network error, please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={s.header}>
        <span className={s.title}>Edit — {client.name}</span>
        <Link href={`/admin/clients/${client.id}`} className={`${s.btn} ${s.btnSecondary}`}>← Back</Link>
      </div>

      <div className={s.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label className={s.label}>Full Name</label>
              <input className={s.input} value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>First Consultation Date</label>
              <input type="date" className={s.input} value={form.firstConsultationDate} onChange={e => update('firstConsultationDate', e.target.value)} />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Phone</label>
              <input className={s.input} value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Email</label>
              <input type="email" className={s.input} value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Date of Birth</label>
              <input type="date" className={s.input} value={form.dob} onChange={e => update('dob', e.target.value)} />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Status</label>
              <select className={s.select} value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className={s.formGroupFull}>
              <label className={s.label}>Address</label>
              <input className={s.input} value={form.address} onChange={e => update('address', e.target.value)} />
            </div>
            <div className={s.formGroupFull}>
              <label className={s.label}>Chief Concern</label>
              <textarea className={s.textarea} value={form.concern} onChange={e => update('concern', e.target.value)} />
            </div>
            <div className={s.formGroupFull}>
              <label className={s.label}>Internal Notes</label>
              <textarea className={s.textarea} value={form.notes} onChange={e => update('notes', e.target.value)} />
            </div>
          </div>
          {error && <p className={s.errorMsg}>{error}</p>}
          <div className={s.formActions}>
            <button type="submit" disabled={saving} className={`${s.btn} ${s.btnPrimary}`}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link href={`/admin/clients/${client.id}`} className={`${s.btn} ${s.btnSecondary}`}>Cancel</Link>
          </div>
        </form>
      </div>
    </>
  );
}
