'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';
import type { Testimonial } from '@/lib/testimonials';
import { testimonials as staticTestimonials } from '@/lib/content';
import styles from './AdsTestimonials.module.css';

interface Props {
  testimonials: Testimonial[];
}

export default function AdsTestimonials({ testimonials }: Props) {
  // Use live testimonials if available, else fall back to static
  const items = testimonials.length > 0
    ? testimonials.slice(0, 8)
    : staticTestimonials.slice(0, 8) as unknown as Testimonial[];

  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 4);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <span className={styles.label}>Real Stories</span>
        <h2 className={styles.title}>What Our Patients Say</h2>
        <p className={styles.sub}>
          Thousands of patients have found lasting relief through Dr. Shweta&apos;s personalised homeopathic care.
        </p>

        {/* Star summary bar */}
        <div className={styles.summaryBar}>
          <div className={styles.summaryStars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={22} fill="var(--clr-gold)" color="var(--clr-gold)" />
            ))}
          </div>
          <strong className={styles.summaryScore}>5.0</strong>
          <span className={styles.summaryCount}>Based on 500+ reviews</span>
        </div>

        <div className={styles.grid}>
          {visible.map((t) => (
            <div key={t.id} className={styles.card}>
              <div className={styles.stars}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="var(--clr-gold)" color="var(--clr-gold)" />
                ))}
              </div>
              <blockquote className={styles.quote}>&ldquo;{t.text}&rdquo;</blockquote>
              <div className={styles.author}>
                <div className={styles.avatar}>{t.name[0]}</div>
                <div>
                  <p className={styles.authorName}>{t.name}</p>
                  <p className={styles.authorMeta}>{t.condition}{t.location ? ` · ${t.location}` : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 4 && !showAll && (
          <button className={styles.showMore} onClick={() => setShowAll(true)}>
            See More Stories ↓
          </button>
        )}
      </div>
    </section>
  );
}
