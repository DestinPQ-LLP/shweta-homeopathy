'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './AdminLayout.module.css';

const NAV = [
  { href: '/admin/dashboard',     icon: '🏠', label: 'Dashboard' },
  { href: '/admin/blog',          icon: '📝', label: 'Blog Posts' },
  { href: '/admin/media',         icon: '🖼️', label: 'Media Library' },
  { href: '/admin/leads',         icon: '📋', label: 'Leads' },
  { href: '/admin/testimonials',  icon: '⭐', label: 'Testimonials' },
  { href: '/admin/notes',         icon: '🗒️', label: 'Session Notes' },
  { href: '/admin/settings',      icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <p className={styles.siteTitle}>Dr. Shweta&apos;s</p>
          <p className={styles.siteSub}>Admin Panel</p>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink}${pathname.startsWith(item.href) ? ` ${styles.active}` : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link href="/" target="_blank" className={styles.navLink} style={{ marginBottom: 'var(--space-1)' }}>
            <span className={styles.navIcon}>🌐</span> View Site
          </Link>
          <button className={styles.logoutBtn} onClick={logout}>
            <span className={styles.navIcon}>🚪</span> Log Out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {title && (
          <div className={styles.topbar}>
            <h1 className={styles.pageTitle}>{title}</h1>
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
