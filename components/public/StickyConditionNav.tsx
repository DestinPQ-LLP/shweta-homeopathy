'use client';

import { useEffect, useState } from 'react';
import styles from './StickyConditionNav.module.css';

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'symptoms', label: 'Symptoms' },
  { id: 'treatment', label: 'Treatment' },
  { id: 'expectations', label: 'What to Expect' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'safety', label: 'Safety' },
];

export default function StickyConditionNav() {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 90;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <nav className={styles.nav} aria-label="Page sections">
      <p className={styles.label}>On this page</p>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`${styles.link} ${active === item.id ? styles.linkActive : ''}`}
          onClick={() => scrollTo(item.id)}
        >
          <span className={styles.dot} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}
