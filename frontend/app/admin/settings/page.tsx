import AdminLayout from '@/components/admin/AdminLayout';
import styles from './settings.module.css';

function mask(value: string | undefined, show = 4): string {
  if (!value) return '(not set)';
  if (value.length <= show) return '••••';
  return value.slice(0, show) + '•'.repeat(Math.min(value.length - show, 20));
}

function sheetLink(id: string | undefined) {
  if (!id || id === '(not set)') return null;
  return `https://docs.google.com/spreadsheets/d/${id}/edit`;
}
function driveLink(id: string | undefined) {
  if (!id || id === '(not set)') return null;
  return `https://drive.google.com/drive/folders/${id}`;
}

export default function SettingsPage() {
  const bookingsId  = process.env.GOOGLE_SHEETS_BOOKINGS_ID;
  const blogId      = process.env.GOOGLE_SHEETS_BLOG_ID;
  const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const gmailFrom   = process.env.GMAIL_FROM;
  const adminEmail  = process.env.ADMIN_EMAIL;

  const landingSheetId = process.env.GOOGLE_SHEETS_LANDING_ID;

  const rows: { label: string; value: string | undefined; href?: string | null; sensitive?: boolean }[] = [
    { label: 'Bookings Sheet ID',   value: bookingsId,      href: sheetLink(bookingsId) },
    { label: 'Blog Sheet ID',       value: blogId,          href: sheetLink(blogId) },
    { label: 'Landing Sheet ID',    value: landingSheetId,  href: sheetLink(landingSheetId) },
    { label: 'Drive Folder ID',     value: driveFolderId,   href: driveLink(driveFolderId) },
    { label: 'Gmail Sender',        value: gmailFrom },
    { label: 'Admin Email',         value: adminEmail },
    { label: 'Admin Password',      value: process.env.ADMIN_PASSWORD,  sensitive: true },
    { label: 'JWT Secret',          value: process.env.JWT_SECRET,       sensitive: true },
    { label: 'OpenAI Key',          value: process.env.OPENAI_API_KEY,  sensitive: true },
    { label: 'TinyMCE Key',         value: process.env.NEXT_PUBLIC_TINY_MCE_API_KEY, sensitive: true },
    { label: 'Service Account',     value: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL },
  ];

  return (
    <AdminLayout title="Settings">
      <div className={styles.page}>
        <p className={styles.lead}>
          Configuration is managed via environment variables in your <code>.env.local</code> file
          (local) or Vercel project settings (production). Values are read-only here.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Configuration</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Value</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className={styles.colLabel}>{row.label}</td>
                  <td className={styles.colValue}>
                    <code>{row.sensitive ? mask(row.value) : (row.value ?? '(not set)')}</code>
                  </td>
                  <td className={styles.colLink}>
                    {row.href ? (
                      <a href={row.href} target="_blank" rel="noopener noreferrer" className={styles.openLink}>
                        Open ↗
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Required Environment Variables</h2>
          <ul className={styles.varList}>
            <li><code>GOOGLE_SERVICE_ACCOUNT_KEY</code> — JSON key for the service account</li>
            <li><code>GOOGLE_SHEETS_BOOKINGS_ID</code> — Spreadsheet ID for appointment &amp; contact leads</li>
            <li><code>GOOGLE_SHEETS_BLOG_ID</code> — Spreadsheet ID for blog metadata</li>
            <li><code>GOOGLE_DRIVE_FOLDER_ID</code> — Drive folder for media &amp; OCR uploads</li>
            <li><code>GMAIL_FROM</code> — Gmail address used to send notifications</li>
            <li><code>ADMIN_EMAIL</code> — Email that receives appointment &amp; contact alerts</li>
            <li><code>ADMIN_PASSWORD</code> — Login password for this admin panel</li>
            <li><code>JWT_SECRET</code> — Secret used to sign admin session tokens (≥ 32 chars)</li>
            <li><code>OPENAI_API_KEY</code> — Used by the OCR / session-notes feature</li>
            <li><code>NEXT_PUBLIC_TINY_MCE_API_KEY</code> — TinyMCE editor key (public)</li>
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}
