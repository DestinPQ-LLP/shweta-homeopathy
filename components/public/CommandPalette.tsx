'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, ChevronRight, Stethoscope, FileText, HelpCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import styles from './CommandPalette.module.css';

/* ── Static quick-links always shown ────────────────────── */
const QUICK_LINKS = [
  { icon: Calendar, label: 'Book Appointment', href: '/appointment', category: 'Action' },
  { icon: Stethoscope, label: 'All Services', href: '/services', category: 'Page' },
  { icon: FileText, label: 'Read our Blog', href: '/blog', category: 'Page' },
  { icon: HelpCircle, label: 'FAQ', href: '/faq', category: 'Page' },
];

/* ── Condition index (static seed — hydrated at runtime) ─ */
const CONDITIONS = [
  { label: 'Hair Loss / Alopecia', href: '/conditions/alopecia-hair-loss' },
  { label: 'Cancer Supportive Care', href: '/conditions/cancer-supportive-care' },
  { label: 'Joint Problems & Arthritis', href: '/conditions/joint-problems-arthritis' },
  { label: 'Female Diseases', href: '/conditions/female-diseases' },
  { label: 'Diabetes Mellitus', href: '/conditions/diabetes-mellitus' },
  { label: 'Geriatric Disorders', href: '/conditions/geriatric-disorders' },
  { label: 'Depression & Anxiety', href: '/conditions/depression-anxiety' },
  { label: 'Gastrointestinal Disorders', href: '/conditions/gastrointestinal-disorders' },
  { label: 'Pediatric Diseases', href: '/conditions/pediatric-diseases' },
  { label: 'Skin Disease', href: '/conditions/skin-disease' },
  { label: 'Respiratory Diseases', href: '/conditions/respiratory-diseases' },
  { label: 'Thyroid Disorders', href: '/conditions/thyroid-disorders' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /* Focus input when opened */
  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  /* Close on Escape */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  /* Filter conditions */
  const filteredConditions = query.length < 2
    ? []
    : CONDITIONS.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()),
      );

  const showQuickLinks = query.length < 2;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal
            aria-label="Search"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Search bar */}
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon} />
              <input
                ref={inputRef}
                className={styles.input}
                placeholder="Search conditions, pages…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div className={styles.results}>
              {showQuickLinks && (
                <div className={styles.group}>
                  <p className={styles.groupLabel}>Quick Links</p>
                  {QUICK_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={styles.item}
                      onClick={onClose}
                    >
                      <item.icon size={16} className={styles.itemIcon} />
                      <span className={styles.itemLabel}>{item.label}</span>
                      <span className={styles.itemCategory}>{item.category}</span>
                      <ChevronRight size={14} className={styles.itemArrow} />
                    </Link>
                  ))}
                </div>
              )}

              {filteredConditions.length > 0 && (
                <div className={styles.group}>
                  <p className={styles.groupLabel}>Conditions</p>
                  {filteredConditions.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={styles.item}
                      onClick={onClose}
                    >
                      <Stethoscope size={16} className={styles.itemIcon} />
                      <span className={styles.itemLabel}>{c.label}</span>
                      <span className={styles.itemCategory}>Condition</span>
                      <ChevronRight size={14} className={styles.itemArrow} />
                    </Link>
                  ))}
                </div>
              )}

              {query.length >= 2 && filteredConditions.length === 0 && (
                <p className={styles.empty}>No results for &ldquo;{query}&rdquo;</p>
              )}
            </div>

            <div className={styles.footer}>
              <kbd className={styles.kbd}>esc</kbd> to close &nbsp;·&nbsp;
              <kbd className={styles.kbd}>↵</kbd> to navigate
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
