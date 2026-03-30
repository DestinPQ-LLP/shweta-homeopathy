import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogs } from '@/lib/blog';
import { buildMetadata } from '@/lib/seo';
import BlogCard from '@/components/public/BlogCard';
import styles from './blog.module.css';

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: 'Homeopathy Blog',
  description: 'Educational articles on homeopathic treatment, patient case studies, and natural healing. Written by Dr. Shweta Goyal — BHMS Gold Medalist, MD Hom.',
  path: '/blog',
});

interface Props { searchParams: Promise<{ category?: string }> }

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams;

  let allPosts = await getAllBlogs().catch(() => []);
  allPosts = allPosts.filter((p) => p.status === 'published')
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

  // Collect unique non-empty categories
  const categories = Array.from(new Set(allPosts.map(p => p.category).filter(Boolean))).sort();

  const posts = category
    ? allPosts.filter(p => p.category.toLowerCase() === category.toLowerCase())
    : allPosts;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: "Dr. Shweta's Homoeopathy — Blog",
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://drshwetahomoeopathy.com'}/blog`,
    author: { '@type': 'Person', name: 'Dr. Shweta Goyal' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className={styles.hero}>
        <div className="container">
          <span className={`section-label ${styles.heroLabel}`}>Knowledge &amp; Healing</span>
          <h1 className={styles.heroTitle}>Homeopathy Blog</h1>
          <p className={styles.heroDesc}>
            Case studies, treatment insights, and educational articles from Dr. Shweta&apos;s practice.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {categories.length > 0 && (
            <div className={styles.filters}>
              <Link href="/blog" className={`${styles.filterChip} ${!category ? styles.filterChipActive : ''}`}>
                All
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`}
                  className={`${styles.filterChip} ${category?.toLowerCase() === cat.toLowerCase() ? styles.filterChipActive : ''}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <div className={styles.empty}>
              <h3>{category ? `No posts in "${category}" yet` : 'Coming soon'}</h3>
              <p>Blog articles will appear here once published.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <div className={styles.ctaSection}>
            <h2>Ready to Start Your Healing Journey?</h2>
            <p>Consult Dr. Shweta for a personalized homeopathic treatment plan — in-clinic or online.</p>
            <Link href="/appointment" className="btn btn-primary btn-lg">
              Request an Appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
