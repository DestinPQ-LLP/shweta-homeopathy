'use client';

import { Star } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import styles from './TestimonialCarousel.module.css';

interface Testimonial {
  id: string | number;
  name: string;
  text: string;
  rating: number;
  condition: string;
  location?: string;
  imageUrl?: string;
}

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialCarousel({ testimonials }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > index ? 1 : -1);
      setIndex(next);
    },
    [index]
  );

  const goNext = useCallback(() => {
    goTo((index + 1) % testimonials.length);
  }, [goTo, index, testimonials.length]);

  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    const id = setInterval(goNext, 5000);
    return () => clearInterval(id);
  }, [paused, goNext, testimonials.length]);

  const current = testimonials[index];
  if (!current) return null;

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.quoteDecor} aria-hidden="true">&ldquo;</div>

      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={styles.card}
        >
          <div className={styles.stars}>
            {Array.from({ length: current.rating }).map((_, i) => (
              <span key={i} className={styles.star}><Star size={14} fill="var(--clr-gold)" color="var(--clr-gold)" /></span>
            ))}
          </div>
          <blockquote className={styles.quote}>{current.text}</blockquote>
          <div className={styles.author}>
            <div className={styles.avatar}>
              {current.imageUrl ? (
                <Image
                  src={current.imageUrl}
                  alt={current.name}
                  width={44}
                  height={44}
                  style={{ borderRadius: '50%', objectFit: 'cover', width: '44px', height: '44px' }}
                />
              ) : (
                <span>{current.name[0]}</span>
              )}
            </div>
            <div>
              <p className={styles.authorName}>{current.name}</p>
              <p className={styles.authorMeta}>
                {current.condition}
                {current.location ? ` · ${current.location}` : ''}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      {testimonials.length > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Testimonial navigation">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-selected={i === index}
              role="tab"
            />
          ))}
        </div>
      )}
    </div>
  );
}

