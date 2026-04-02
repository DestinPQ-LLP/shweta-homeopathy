'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './SocialProofRating.module.css';

interface Props {
  rating?: number;
  reviewCount?: number;
  reviewsUrl?: string;
  breakdown?: { stars: number; count: number }[];
}

const defaultBreakdown = [
  { stars: 5, count: 189 },
  { stars: 4, count: 9 },
  { stars: 3, count: 2 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? 'var(--clr-gold)' : 'none'}
        stroke="var(--clr-gold)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RatingBar({ stars, count, total, animate }: { stars: number; count: number; total: number; animate: boolean }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{stars}★</span>
      <div className={styles.barTrack}>
        <motion.div
          className={styles.barFill}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: animate ? pct / 100 : 0 }}
          transition={{ duration: 0.8, delay: (5 - stars) * 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
      <span className={styles.barCount}>{count}</span>
    </div>
  );
}

export default function SocialProofRating({
  rating = 4.9,
  reviewCount = 200,
  reviewsUrl = 'https://g.page/r/PLACE_ID/review',
  breakdown = defaultBreakdown,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-40px' });

  const total = breakdown.reduce((s, b) => s + b.count, 0);
  const satisfactionPct = 98;

  return (
    <motion.div
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoRow}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-label="Google" className={styles.googleIcon}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className={styles.googleLabel}>Reviews</span>
        </div>

        <div className={styles.ratingHero}>
          <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
          <div className={styles.starsRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} filled={i < Math.round(rating)} />
            ))}
          </div>
        </div>
        <p className={styles.reviewCountLabel}>{reviewCount}+ verified reviews</p>
      </div>

      {/* Satisfaction bar */}
      <div className={styles.satisfactionRow}>
        <span className={styles.satisfactionLabel}>Patient Satisfaction</span>
        <div className={styles.satisfactionTrack}>
          <motion.div
            className={styles.satisfactionFill}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: inView ? satisfactionPct / 100 : 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
        <motion.span
          className={styles.satisfactionPct}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
        >
          {satisfactionPct}%
        </motion.span>
      </div>

      {/* Breakdown bars */}
      <div className={styles.breakdown}>
        {breakdown.map((b) => (
          <RatingBar key={b.stars} stars={b.stars} count={b.count} total={total} animate={inView} />
        ))}
      </div>

      {/* CTA */}
      <a
        href={reviewsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cta}
        aria-label="Leave a Google review for Dr. Shweta Goyal"
      >
        Leave a Review
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </a>
    </motion.div>
  );
}
