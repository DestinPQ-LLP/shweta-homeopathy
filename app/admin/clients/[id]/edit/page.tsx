import { notFound } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import EditClientClient from './EditClientClient';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

async function fetchClient(id: string) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res  = await fetch(`${base}/api/admin/clients/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).client;
  } catch {
    return null;
  }
}

export default async function EditClientPage({ params }: PageProps) {
  const { id }  = await params;
  const client  = await fetchClient(id);
  if (!client) notFound();
  return (
    <AdminLayout>
      <EditClientClient client={client} />
    </AdminLayout>
  );
}
