'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { BlogPost } from '@/lib/blog';
import styles from './BlogCard.module.css';

// Some legacy WP-exported URLs use Google Drive's "open?id=" or "uc?id=" form
// which Next/Image can't load. Convert them to the lh3 thumbnail proxy.
function normalizeImageUrl(url: string): string {
  if (!url) return url;
  // https://drive.google.com/file/d/<ID>/view  OR  open?id=<ID>  OR  uc?id=<ID>
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}=w1200`;
  return url;
}

export default function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const initialUrl = normalizeImageUrl(post.coverImageUrl || '');
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link href={`/blog/${post.slug}`} className={styles.blogCard}>
      <div className={styles.coverWrap}>
        {initialUrl && !imgFailed ? (
          <Image
            src={initialUrl}
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
            onError={() => setImgFailed(true)}
          />
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
