import AdminLayout from '@/components/admin/AdminLayout';
import MediaClient from './MediaClient';
import styles from './media.module.css';

export const metadata = { title: 'Media Library — Admin' };

export default function MediaPage() {
  return (
    <AdminLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Media Library</h1>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--clr-text-lt)' }}>
          All files are stored in Google Drive. Click a file to copy its public URL.
        </p>
      </div>
      <MediaClient />
    </AdminLayout>
  );
}
