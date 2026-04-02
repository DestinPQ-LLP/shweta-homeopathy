import AdminLayout from '@/components/admin/AdminLayout';
import OcrReviewForm from '@/components/admin/OcrReviewForm';

export const metadata = { title: 'New Session Note — Admin' };

export default function NewNotePage() {
  return (
    <AdminLayout>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--clr-forest)', marginBottom: 'var(--space-6)' }}>
        New Session Note
      </h1>
      <OcrReviewForm />
    </AdminLayout>
  );
}
