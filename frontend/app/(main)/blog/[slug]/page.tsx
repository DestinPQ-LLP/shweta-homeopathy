import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAllBlogs, getBlogBySlug } from '@/lib/blog';
import { getBlogDocHtml } from '@/lib/google/docs';
import { buildMetadata } from '@/lib/seo';
import BlogCard from '@/components/public/BlogCard';
import styles from './slug.module.css';

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllBlogs().catch(() => []);
  return posts.filter((p) => p.status === 'published').map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug).catch(() => null);
  if (!post) return buildMetadata({ title: 'Blog Post', noIndex: true });
  return buildMetadata({
    title: post.title,
    description: post.metaDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImageUrl || undefined,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug).catch(() => null);
  if (!post) notFound();

  // Fetch related posts — same category, excluding current, max 3
  const allPosts = await getAllBlogs().catch(() => []);
  const related = allPosts
    .filter(p => p.status === 'published' && p.slug !== post.slug && p.category && p.category === post.category)
    .slice(0, 3);

  let bodyHtml = '';
  if (post.docId) {
    bodyHtml = await getBlogDocHtml(post.docId).catch(() => '');
    // Strip Google Doc wrapper — keep only body content
    const bodyMatch = bodyHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) bodyHtml = bodyMatch[1];
  }

  const formattedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    datePublished: post.publishedDate,
    dateModified: post.updatedDate,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: "Dr. Shweta's Homoeopathy" },
    image: post.coverImageUrl || undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="container">
        <article className={styles.article}>
          <Link href="/blog" className={styles.back}>← Back to Blog</Link>

          <div className={styles.meta}>
            {post.category && <span className={styles.category}>{post.category}</span>}
            {formattedDate && <span>{formattedDate}</span>}
            <span>By {post.author}</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

          <div className={styles.coverWrap}>
            {post.coverImageUrl ? (
              <Image src={post.coverImageUrl} alt={post.title} fill style={{ objectFit: 'cover' }} unoptimized />
            ) : (
              <div className={styles.coverPlaceholder}>🌿</div>
            )}
          </div>

          {bodyHtml ? (
            <div className={styles.body} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          ) : (
            <div className={styles.body}><p>Content loading…</p></div>
          )}

          <div className={styles.disclaimer}>
            <strong>Medical Disclaimer:</strong> This article is for educational purposes only and does not constitute medical advice. Please consult Dr. Shweta Goyal or a qualified homeopathic practitioner for personalised treatment.
          </div>

          <div className={styles.ctaBox}>
            <h3>Consult Dr. Shweta</h3>
            <p>Book an in-clinic or online consultation for personalised homeopathic care.</p>
            <Link href="/appointment" className="btn btn-gold btn-lg">Request Appointment</Link>
          </div>
        </article>

        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Related Articles</h2>
            <div className={styles.relatedGrid}>
              {related.map(r => <BlogCard key={r.id} post={r} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
