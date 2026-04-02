'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Testimonial } from '@/lib/testimonials';
import s from './testimonials-admin.module.css';

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialsAdminClient({ testimonials: initial }: Props) {
  const router = useRouter();
  const [list, setList]       = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) { alert('Failed to delete'); return; }
      setList(l => l.filter(t => t.id !== id));
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.toolbar}>
        <p className={s.count}>{list.length} testimonial{list.length !== 1 ? 's' : ''}</p>
        <Link href="/admin/testimonials/new" className="btn btn-primary">+ Add Testimonial</Link>
      </div>

      {list.length === 0 ? (
        <div className={s.empty}>
          <p>No testimonials yet.</p>
          <Link href="/admin/testimonials/new" className="btn btn-primary">Add your first</Link>
        </div>
      ) : (
        <div className={s.grid}>
          {list.map(t => (
            <div key={t.id} className={s.card}>
              <div className={s.cardTop}>
                <div className={s.stars}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                <span className={`${s.badge} ${t.status === 'published' ? s.published : s.draft}`}>
                  {t.status}
                </span>
              </div>
              <p className={s.text}>&ldquo;{t.text.length > 160 ? t.text.slice(0, 160) + '…' : t.text}&rdquo;</p>
              <div className={s.meta}>
                <strong>{t.name}</strong>
                {t.location && <span> · {t.location}</span>}
                <span className={s.condition}>{t.condition}</span>
              </div>
              <div className={s.actions}>
                <Link href={`/admin/testimonials/${t.id}/edit`} className="btn btn-ghost">Edit</Link>
                <button
                  className={`btn btn-ghost ${s.deleteBtn}`}
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting === t.id}
                >
                  {deleting === t.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
