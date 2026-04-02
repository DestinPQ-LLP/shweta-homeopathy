'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faqs } from '@/lib/content';
import styles from './FaqAccordion.module.css';

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={styles.accordion}>
      {faqs.map((f, i) => (
        <div key={i} className={`${styles.item} ${open === i ? styles.isOpen : ''}`}>
          <button
            className={styles.question}
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            id={`faq-btn-${i}`}
          >
            {f.question}
            <motion.span
              className={styles.icon}
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.25 }}
            >
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <p className={styles.answerText}>{f.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
