import AdminLayout from '@/components/admin/AdminLayout';
import ConditionsListClient from './ConditionsListClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Conditions — Admin' };

async function fetchConditions() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res  = await fetch(`${base}/api/admin/conditions?all=1`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    const { conditions } = await res.json();
    return conditions ?? [];
  } catch {
    return [];
  }
}

export default async function ConditionsAdminPage() {
  const conditions = await fetchConditions();
  return (
    <AdminLayout>
      <ConditionsListClient conditions={conditions} />
    </AdminLayout>
  );
}
