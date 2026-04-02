import AdminLayout from '@/components/admin/AdminLayout';
import NewClientClient from './NewClientClient';

export const metadata = { title: 'New Client — Admin' };

export default function NewClientPage() {
  return (
    <AdminLayout>
      <NewClientClient />
    </AdminLayout>
  );
}
