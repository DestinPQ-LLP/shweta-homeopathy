import AdminLayout from '@/components/admin/AdminLayout';
import BlogEditorForm from '@/components/admin/BlogEditorForm';

export const metadata = { title: 'New Blog Post — Admin' };

export default function NewBlogPage() {
  return (
    <AdminLayout>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--clr-forest)', marginBottom: 'var(--space-6)' }}>
        New Blog Post
      </h1>
      <BlogEditorForm />
    </AdminLayout>
  );
}
