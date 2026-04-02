'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './ScrollRevealText.module.css';

interface Props {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  /** Words (exact match) to render in highlight colour */
  highlightWords?: string[];
  delay?: number;
}

const container = (delay = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: delay },
  },
});

const wordVariant = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ScrollRevealText({
  text,
  as: Tag = 'p',
  className = '',
  highlightWords = [],
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-40px' });

  const words = text.split(' ');

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={container(delay)}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={styles.wrapper}
    >
      <Tag className={className}>
        {words.map((word, i) => {
          const isHighlight = highlightWords.some(
            (hw) => word.toLowerCase().replace(/[.,!?;:]/, '') === hw.toLowerCase()
          );
          return (
            <motion.span
              key={i}
              variants={wordVariant}
              className={`${styles.word} ${isHighlight ? styles.highlight : ''}`}
            >
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          );
        })}
      </Tag>
    </motion.div>
  );
}
