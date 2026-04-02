'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Testimonial } from '@/lib/testimonials';
import styles from './TestimonialGrid.module.css';

const PAGE_SIZE = 12;

interface Props {
  testimonials: Testimonial[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );
}

export default function TestimonialGrid({ testimonials }: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(testimonials.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const current = testimonials.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(p);
    // Scroll to top of grid
    document.getElementById('testimonial-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Page numbers to display (show max 7 buttons)
  const pageNums: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    pageNums.push(1);
    if (page > 3) pageNums.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pageNums.push(i);
    if (page < totalPages - 2) pageNums.push('...');
    pageNums.push(totalPages);
  }

  return (
    <div>
      {/* Stats bar */}
      <div className={styles.statsBar}>
        <span className={styles.statCount}>
          Showing <strong>{start + 1}–{Math.min(start + PAGE_SIZE, testimonials.length)}</strong> of <strong>{testimonials.length}</strong> reviews
        </span>
        <div className={styles.googleBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google Reviews
        </div>
      </div>

      {/* Grid */}
      <div id="testimonial-grid" className={styles.grid}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className={styles.gridInner}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {current.map((t, i) => (
              <motion.div
                key={t.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <div className={styles.cardHeader}>
                  <StarRating rating={t.rating} />
                  {t.condition && (
                    <span className={styles.tag}>{t.condition}</span>
                  )}
                </div>
                <p className={styles.quote}>&ldquo;{t.text}&rdquo;</p>
                <div className={styles.cardFooter}>
                  <div className={styles.avatar}>{t.name[0].toUpperCase()}</div>
                  <div className={styles.authorInfo}>
                    <p className={styles.authorName}>{t.name}</p>
                    {t.location && <p className={styles.authorLoc}>📍 {t.location}</p>}
                  </div>
                  <div className={styles.verifiedBadge} title="Verified Google Review">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Verified
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination} role="navigation" aria-label="Review pages">
          <button
            className={styles.pageBtn}
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>

          <div className={styles.pageNums}>
            {pageNums.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
              ) : (
                <button
                  key={p}
                  className={`${styles.pageNum} ${page === p ? styles.pageNumActive : ''}`}
                  onClick={() => goTo(p as number)}
                  aria-label={`Page ${p}`}
                  aria-current={page === p ? 'page' : undefined}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            className={styles.pageBtn}
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
