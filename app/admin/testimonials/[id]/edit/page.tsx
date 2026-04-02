import { notFound } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import TestimonialForm from '../../TestimonialForm';
import { getTestimonialById } from '@/lib/testimonials';

export const dynamic = 'force-dynamic';

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getTestimonialById(id).catch(() => null);
  if (!result) notFound();

  return (
    <AdminLayout title="Edit Testimonial">
      <TestimonialForm testimonial={result.testimonial} />
    </AdminLayout>
  );
}
