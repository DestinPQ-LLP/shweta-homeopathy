'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import s from '../clients/clients.module.css';

interface Condition {
  slug: string; name: string; shortDesc: string; icon: string; status: string;
}

export default function ConditionsListClient({ conditions }: { conditions: Condition[] }) {
  const [query, setQuery]  = useState('');
  const [deleting, setDel] = useState<string | null>(null);
  const router             = useRouter();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return conditions.filter(c =>
      c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [conditions, query]);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete condition "${slug}"? This cannot be undone.`)) return;
    setDel(slug);
    await fetch(`/api/admin/conditions/${slug}`, { method: 'DELETE' });
    setDel(null);
    router.refresh();
  }

  return (
    <>
      <div className={s.header}>
        <span>
          <span className={s.title}>Conditions</span>
          <span className={s.count} style={{ marginLeft: '0.75rem' }}>{conditions.length} total</span>
        </span>
        <div className={s.actions}>
          <input className={s.search} placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} />
          <Link href="/admin/conditions/new" className={`${s.btn} ${s.btnPrimary}`}>+ New Condition</Link>
        </div>
      </div>

      {filtered.length === 0
        ? <p className={s.empty}>No conditions found.</p>
        : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr><th>Icon</th><th>Name</th><th>Slug</th><th>Short Desc</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.slug}>
                    <td style={{ fontSize: '1.25rem' }}>{c.icon || '—'}</td>
                    <td>{c.name}</td>
                    <td><code style={{ fontSize: '0.78rem' }}>{c.slug}</code></td>
                    <td>{c.shortDesc ? c.shortDesc.slice(0, 60) + (c.shortDesc.length > 60 ? '…' : '') : '—'}</td>
                    <td>
                      <span className={`${s.badge} ${c.status === 'draft' ? s.badgeDraft : s.badgePublished}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className={s.actions}>
                        <Link href={`/admin/conditions/${c.slug}/edit`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Edit</Link>
                        <button
                          onClick={() => handleDelete(c.slug)}
                          disabled={deleting === c.slug}
                          className={`${s.btn} ${s.btnDanger} ${s.btnSmall}`}
                        >
                          {deleting === c.slug ? '…' : 'Delete'}
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
