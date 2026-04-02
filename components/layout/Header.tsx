'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import Image from 'next/image';
import styles from './Header.module.css';
import CommandPalette from '@/components/public/CommandPalette';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();

  /* ⌘K / Ctrl+K shortcut */
  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setPaletteOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, [handleGlobalKey]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <Image src="/images/logo.svg" alt="Dr. Shweta's Homoeopathy" width={38} height={38} />
          </div>
          <div>
            <span className={styles.logoName}>Dr. Shweta Goyal</span>
            <span className={styles.logoSub}>BHMS · MD (Hom) · PG IACH Greece</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map((l) => {
            const isActive = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {l.label}
                <span className={styles.navUnderline} />
              </Link>
            );
          })}
        </nav>

        {/* Search trigger */}
        <button
          className={styles.searchBtn}
          onClick={() => setPaletteOpen(true)}
          aria-label="Search (⌘K)"
          title="Search (⌘K)"
        >
          <Search size={18} />
          <span className={styles.searchKbd}>⌘K</span>
        </button>

        {/* CTA */}
        <Link href="/appointment" className={`btn btn-gold ${styles.ctaBtn}`} id="header-book-btn">
          Book Appointment
        </Link>

        {/* Mobile toggle */}
        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.menuBar} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.menuBar} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.menuBar} ${menuOpen ? styles.open : ''}`} />
        </button>
      </div>

      {/* Mobile menu — Framer Motion slide-down */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {NAV_LINKS.map((l, i) => {
              const isActive = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
              return (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <Link
                    href={l.href}
                    className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              );
            })}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.04 + 0.05 }}
              style={{ paddingTop: 'var(--space-2)' }}
            >
              <Link
                href="/appointment"
                className="btn btn-gold"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setMenuOpen(false)}
              >
                Book Appointment
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
