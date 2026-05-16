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

/**
 * Format raw blog content from Google Sheets into readable HTML.
 *  - Converts literal "\t" (backslash + t) sequences used as bullet markers into <ul><li>…</li></ul>
 *  - Converts real tab characters the same way
 *  - Splits on blank lines / sentence boundaries to create paragraphs
 *  - Preserves any HTML already present in the source
 */
function formatBlogContent(raw: string): string {
  if (!raw) return '';
  // If the content already looks like HTML (has block tags), leave it alone but still clean stray "\t".
  const looksLikeHtml = /<(p|h[1-6]|ul|ol|li|div|section|article|br)[\s>]/i.test(raw);
  if (looksLikeHtml) {
    return raw.replace(/\\t/g, '<br>• ').replace(/\t/g, '<br>• ');
  }

  // Normalize: convert escaped \t and real tabs into a single sentinel
  const TOKEN = '\u0001BULLET\u0001';
  const text = raw.replace(/\\t|\t/g, TOKEN).trim();

  // Split into paragraph-like blocks on blank lines
  const blocks = text.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);

  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const renderBlock = (block: string): string => {
    // If a block contains the bullet sentinel, split it into intro + list
    if (block.includes(TOKEN)) {
      const [intro, ...items] = block.split(TOKEN).map((s) => s.trim()).filter(Boolean);
      const introHtml = intro ? `<p>${escape(intro)}</p>` : '';
      const listHtml = items.length
        ? `<ul>${items.map((it) => `<li>${escape(it)}</li>`).join('')}</ul>`
        : '';
      return introHtml + listHtml;
    }
    // Plain paragraph — preserve single newlines as <br>
    return `<p>${escape(block).replace(/\n/g, '<br>')}</p>`;
  };

  return blocks.map(renderBlock).join('\n');
}

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

  // Prefer inline content stored in sheet; fall back to Google Doc export
  let bodyHtml = post.content || '';
  if (!bodyHtml && post.docId) {
    const docHtml = await getBlogDocHtml(post.docId).catch(() => '');
    const bodyMatch = docHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    bodyHtml = bodyMatch ? bodyMatch[1] : docHtml;
  }
  // Normalize sheet-formatted text (literal "\t" bullets, blank-line paragraphs) into proper HTML
  bodyHtml = formatBlogContent(bodyHtml);

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
              <Image src={post.coverImageUrl} alt={post.title} fill style={{ objectFit: 'contain' }} unoptimized />
            ) : (
              <div className={styles.coverPlaceholder}>
                <Image src="/images/logo.webp" alt="Dr. Shweta's Homoeopathy" width={160} height={160} style={{ objectFit: 'contain', opacity: 0.85 }} />
              </div>
            )}
          </div>

          {bodyHtml ? (
            <div className={styles.body} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          ) : post.excerpt ? (
            <div className={styles.body}>
              <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--clr-text-muted)' }}>
                {post.excerpt}
              </p>
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--clr-sage-pale)', borderRadius: '12px', borderLeft: '4px solid var(--clr-primary)' }}>
                <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--clr-text-muted)' }}>
                  📌 Full article content will be available shortly. Book a consultation to discuss this topic with Dr. Shweta directly.
                </p>
              </div>
            </div>
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
