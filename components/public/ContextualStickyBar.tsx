'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, CalendarCheck } from 'lucide-react';
import styles from './ContextualStickyBar.module.css';

export default function ContextualStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.bar}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          aria-label="Quick actions"
        >
          <div className={styles.inner}>
            <span className={styles.label}>Ready to heal?</span>
            <div className={styles.actions}>
              <Link href="/appointment" className={`btn btn-gold btn-sm ${styles.btnBook}`}>
                <CalendarCheck size={16} />
                Book Free Call
              </Link>
              <a href="tel:+916284411753" className={`btn btn-outline btn-sm ${styles.btnCall}`}>
                <Phone size={16} />
                Call Now
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
