'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import s from './clients.module.css';

interface Client {
  id: string; name: string; email: string; phone: string;
  firstConsultationDate: string; concern: string; status: string;
}

export default function ClientsListClient({ clients }: { clients: Client[] }) {
  const [query, setQuery]   = useState('');
  const [deleting, setDel]  = useState<string | null>(null);
  const router              = useRouter();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  }, [clients, query]);

  async function handleDelete(id: string) {
    if (!confirm(`Delete client ${id}? This cannot be undone.`)) return;
    setDel(id);
    await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
    setDel(null);
    router.refresh();
  }

  return (
    <>
      <div className={s.header}>
        <span>
          <span className={s.title}>Clients</span>
          <span className={s.count} style={{ marginLeft: '0.75rem' }}>{clients.length} total</span>
        </span>
        <div className={s.actions}>
          <input className={s.search} placeholder="Search name / ID / phone…" value={query} onChange={e => setQuery(e.target.value)} />
          <Link href="/admin/clients/new" className={`${s.btn} ${s.btnPrimary}`}>+ New Client</Link>
        </div>
      </div>

      {filtered.length === 0
        ? <p className={s.empty}>No clients found.</p>
        : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Phone</th><th>First Visit</th>
                  <th>Concern</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><code style={{ fontSize: '0.8rem' }}>{c.id}</code></td>
                    <td><Link href={`/admin/clients/${c.id}`}>{c.name}</Link></td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.firstConsultationDate || '—'}</td>
                    <td>{c.concern ? c.concern.slice(0, 40) + (c.concern.length > 40 ? '…' : '') : '—'}</td>
                    <td>
                      <span className={`${s.badge} ${c.status === 'inactive' ? s.badgeInactive : s.badgeActive}`}>
                        {c.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className={s.actions}>
                        <Link href={`/admin/clients/${c.id}`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>View</Link>
                        <Link href={`/admin/clients/${c.id}/edit`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Edit</Link>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className={`${s.btn} ${s.btnDanger} ${s.btnSmall}`}
                        >
                          {deleting === c.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </>
  );
}
