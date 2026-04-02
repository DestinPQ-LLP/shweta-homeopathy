import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/lib/blog';
import styles from './BlogCard.module.css';

export default function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <Link href={`/blog/${post.slug}`} className={styles.blogCard}>
      <div className={styles.coverWrap}>
        {post.coverImageUrl ? (
          <Image src={post.coverImageUrl} alt={post.title} fill style={{ objectFit: 'cover' }} unoptimized />
        ) : (
          <div className={styles.coverPlaceholder}>🌿</div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          {post.category && <span className={styles.category}>{post.category}</span>}
          {formattedDate && <span>{formattedDate}</span>}
        </div>

        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>{post.excerpt}</p>

        <div className={styles.footer}>
          <span className={styles.author}>{post.author}</span>
          <span className={styles.readMore}>Read more →</span>
        </div>
      </div>
    </Link>
  );
}
