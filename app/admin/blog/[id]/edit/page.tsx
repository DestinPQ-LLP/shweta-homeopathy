import { notFound } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import BlogEditorForm from '@/components/admin/BlogEditorForm';
import { getBlogById } from '@/lib/blog';
import { getBlogDocHtml } from '@/lib/google/docs';

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic';

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;

  let post;
  try {
    post = await getBlogById(id);
  } catch {
    notFound();
  }
  if (!post) notFound();

  let htmlContent = '';
  if (post.docId) {
    try { htmlContent = await getBlogDocHtml(post.docId); } catch { /* leave empty */ }
  }

  return (
    <AdminLayout>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--clr-forest)', marginBottom: 'var(--space-6)' }}>
        Edit Post
      </h1>
      <BlogEditorForm post={{ ...post, htmlContent }} />
    </AdminLayout>
  );
}
