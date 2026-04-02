import type { Testimonial } from '@/lib/testimonials';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllTestimonials } from '@/lib/testimonials';
import TestimonialsAdminClient from './TestimonialsAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminTestimonialsPage() {
  let testimonials: Testimonial[] = [];
  try {
    testimonials = await getAllTestimonials();
  } catch (e) {
    console.error('[admin testimonials]', e);
  }

  return (
    <AdminLayout title="Testimonials">
      <TestimonialsAdminClient testimonials={testimonials} />
    </AdminLayout>
  );
}
