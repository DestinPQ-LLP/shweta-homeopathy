import { notFound } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import EditConditionClient from './EditConditionClient';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

async function fetchCondition(slug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res  = await fetch(`${base}/api/admin/conditions/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).condition;
  } catch { return null; }
}

export default async function EditConditionPage({ params }: Props) {
  const { slug }    = await params;
  const condition   = await fetchCondition(slug);
  if (!condition) notFound();
  return (
    <AdminLayout>
      <EditConditionClient condition={condition} />
    </AdminLayout>
  );
}
