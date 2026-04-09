'use client';
import { useState } from 'react';
import s from './leads.module.css';

type Row = Record<string, string>;

interface Props {
  appointments: Row[];
  contacts: Row[];
  error?: string;
}

const APPT_COLS  = ['timestamp','name','email','phone','age','concern','preferredTime','consultationType','status'];
const CTACT_COLS = ['timestamp','name','email','phone','subject','message'];
const STATUSES   = ['New', 'Contacted', 'Confirmed', 'Cancelled', 'Completed'];

function StatusCell({ value, rowIndex }: { value: string; rowIndex: number }) {
  const [status, setStatus]     = useState(value || 'New');
  const [saving, setSaving]     = useState(false);
  const [saved,  setSaved]      = useState(false);

  async function handleChange(next: string) {
    setStatus(next);
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/leads/${rowIndex}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className={s.statusCell}>
      <select
        value={status}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
        className={`${s.statusSelect} ${s[`status_${status.toLowerCase()}`] ?? ''}`}
      >
        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
      </select>
      {saved && <span className={s.savedBadge}>✓</span>}
    </span>
  );
}

function ApptTable({ rows }: { rows: Row[] }) {
  const cols = APPT_COLS.filter(c => c !== 'status' && rows.some(r => r[c]));
  if (rows.length === 0) return <p className={s.empty}>No appointments yet.</p>;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            {cols.map(c => <th key={c}>{c}</th>)}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map(c => <td key={c}>{row[c] || '—'}</td>)}
              <td><StatusCell value={row.status || 'New'} rowIndex={i} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContactTable({ rows }: { rows: Row[] }) {
  const cols = CTACT_COLS.filter(c => rows.some(r => r[c]));
  if (rows.length === 0) return <p className={s.empty}>No contact messages yet.</p>;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{cols.map(c => <td key={c}>{row[c] || '—'}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LeadsClient({ appointments, contacts, error }: Props) {
  const [tab, setTab] = useState<'appt'|'contact'>('appt');

  return (
    <>
      {error && <p className={s.error}>{error}</p>}
      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'appt' ? s.tabActive : ''}`} onClick={() => setTab('appt')}>
          Appointments ({appointments.length})
        </button>
        <button className={`${s.tab} ${tab === 'contact' ? s.tabActive : ''}`} onClick={() => setTab('contact')}>
          Contact Messages ({contacts.length})
        </button>
      </div>
      {tab === 'appt'    && <ApptTable    rows={appointments} />}
      {tab === 'contact' && <ContactTable rows={contacts} />}
    </>
  );
}
