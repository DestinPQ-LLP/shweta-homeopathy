import AdminLayout from '@/components/admin/AdminLayout';
import TestimonialForm from '../TestimonialForm';

export default function NewTestimonialPage() {
  return (
    <AdminLayout title="Add Testimonial">
      <TestimonialForm />
    </AdminLayout>
  );
}
