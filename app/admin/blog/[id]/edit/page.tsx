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
    try {
      const docHtml = await getBlogDocHtml(post.docId);
      // Strip the wrapping <html>/<body> so TinyMCE shows just the body content.
      const bodyMatch = docHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      htmlContent = bodyMatch ? bodyMatch[1] : docHtml;
    } catch {
      /* leave empty — falls back to sheet content below */
    }
  }
  // Fallback: most imported posts have inline content in Sheet column O and no docId.
  // Without this fallback the editor used to open EMPTY and any save wiped the post.
  if (!htmlContent.trim()) {
    htmlContent = post.content || '';
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
