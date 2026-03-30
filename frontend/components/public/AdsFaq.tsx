'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FAQ } from '@/lib/content';
import styles from './AdsFaq.module.css';

interface Props {
  faqs: FAQ[];
}

export default function AdsFaq({ faqs }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <span className={styles.label}>FAQs</span>
        <h2 className={styles.title}>Common Questions</h2>
        <p className={styles.sub}>Everything you need to know before booking your consultation.</p>

        <div className={styles.accordion}>
          {faqs.map((f, i) => (
            <div key={i} className={`${styles.item} ${open === i ? styles.isOpen : ''}`}>
              <button
                className={styles.question}
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {f.question}
                <motion.span
                  className={styles.icon}
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.22 }}
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
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className={styles.answer}>{f.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
