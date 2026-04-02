import AdminLayout from '@/components/admin/AdminLayout';
import NewConditionClient from './NewConditionClient';

export const metadata = { title: 'New Condition — Admin' };

export default function NewConditionPage() {
  return (
    <AdminLayout>
      <NewConditionClient />
    </AdminLayout>
  );
}
