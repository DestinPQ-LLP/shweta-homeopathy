import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllBlogs } from '@/lib/blog';
import type { BlogPost } from '@/lib/blog';
import styles from './blog.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  let posts: BlogPost[] = [];
  let fetchError = '';
  try {
    posts = await getAllBlogs();
  } catch {
    fetchError = 'Could not load posts from Google Sheets.';
  }

  return (
    <AdminLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Blog Posts</h1>
        <Link href="/admin/blog/new" className="btn btn-primary">+ New Post</Link>
      </div>

      {fetchError && <p className={styles.error}>{fetchError}</p>}

      {posts.length === 0 && !fetchError ? (
        <p className={styles.empty}>No posts yet. <Link href="/admin/blog/new">Create the first one →</Link></p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td className={styles.tdTitle}>{post.title}</td>
                  <td className={styles.tdSlug}>{post.slug}</td>
                  <td>{post.category || '—'}</td>
                  <td>
                    <span className={post.status === 'published' ? styles.badgePublished : styles.badgeDraft}>
                      {post.status}
                    </span>
                  </td>
                  <td className={styles.tdDate}>{post.publishedDate ? new Date(post.publishedDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className={styles.tdActions}>
                    <Link href={`/admin/blog/${post.id}/edit`} className={styles.linkEdit}>Edit</Link>
                    <Link href={`/blog/${post.slug}`} target="_blank" className={styles.linkView}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
