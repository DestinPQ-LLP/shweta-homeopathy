import AdminLayout from '@/components/admin/AdminLayout';
import ClientsListClient from './ClientsListClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Clients — Admin' };

async function fetchClients() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res  = await fetch(`${base}/api/admin/clients`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.clients ?? [];
  } catch {
    return [];
  }
}

export default async function ClientsPage() {
  const clients = await fetchClients();
  return (
    <AdminLayout>
      <ClientsListClient clients={clients} />
    </AdminLayout>
  );
}
