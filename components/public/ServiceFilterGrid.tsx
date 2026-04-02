'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConditionCategory } from '@/lib/conditions';
import styles from './ServiceFilterGrid.module.css';

type Filter = 'All' | ConditionCategory;

const FILTERS: Filter[] = [
  'All',
  "Women's Health",
  'Skin',
  'Respiratory',
  'Pediatric',
  'Chronic Care',
  'Lifestyle',
  'Supportive Care',
];

interface ConditionLike {
  slug: string;
  name: string;
  shortDesc: string;
  icon: string;
  symptoms: string[];
  category?: ConditionCategory;
}

interface Props {
  conditions: ConditionLike[];
}

export default function ServiceFilterGrid({ conditions }: Props) {
  const [active, setActive] = useState<Filter>('All');

  const filtered = active === 'All'
    ? conditions
    : conditions.filter((c) => c.category === active);

  return (
    <div className={styles.wrap}>
      {/* Filter chips */}
      <div className={styles.chips} role="group" aria-label="Filter by category">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`${styles.chip} ${active === f ? styles.chipActive : ''}`}
            onClick={() => setActive(f)}
            aria-pressed={active === f}
          >
            {f}
            {active === f && (
              <motion.span
                className={styles.chipDot}
                layoutId="chipDot"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Bento grid */}
      <motion.div layout className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => (
            <motion.div
              key={c.slug}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.28, delay: i * 0.04 }}
              className={`${styles.card} ${i === 0 ? styles.cardWide : ''} glass-card`}
            >
              <Link href={`/conditions/${c.slug}`} className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <span className={styles.cardIcon}>{c.icon}</span>
                  {c.category && (
                    <span className={styles.cardCategory}>{c.category}</span>
                  )}
                </div>
                <h3 className={styles.cardTitle}>{c.name}</h3>
                <p className={styles.cardDesc}>{c.shortDesc}</p>

                {/* Hover reveal layer */}
                <div className={styles.reveal}>
                  <div className={styles.revealSymptoms}>
                    {c.symptoms.slice(0, 3).map((s) => (
                      <span key={s} className={styles.symptomPill}>{s}</span>
                    ))}
                  </div>
                  <span className={styles.revealCta}>Book for this →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
