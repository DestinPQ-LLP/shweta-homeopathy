import AdminLayout from '@/components/admin/AdminLayout';
import { getAllBlogs } from '@/lib/blog';
import { readSheet } from '@/lib/google/sheets';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  const bookingsId = process.env.GOOGLE_SHEETS_BOOKINGS_ID || '';
  const sheetsConfigured = !!bookingsId;

  const [posts, leads, contacts] = await Promise.allSettled([
    getAllBlogs(),
    bookingsId ? readSheet(bookingsId, 'Leads!A:A') : Promise.resolve([]),
    bookingsId ? readSheet(bookingsId, 'Contacts!A:A') : Promise.resolve([]),
  ]);
  const postList = posts.status === 'fulfilled' ? posts.value : [];
  const leadRows = leads.status === 'fulfilled' ? leads.value : [];
  const contactRows = contacts.status === 'fulfilled' ? contacts.value : [];
  const leadsError = leads.status === 'rejected' ? (leads.reason as Error).message : null;
  return {
    totalPosts: postList.length,
    publishedPosts: postList.filter((p) => p.status === 'published').length,
    totalLeads: Math.max(0, leadRows.length - 1),
    totalContacts: Math.max(0, contactRows.length - 1),
    sheetsConfigured,
    leadsError,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'Total Blog Posts', value: stats.totalPosts, sub: `${stats.publishedPosts} published`, href: '/admin/blog', cta: 'View Posts' },
    { label: 'Appointment Leads', value: stats.totalLeads, sub: 'from booking form', href: '/admin/leads', cta: 'View Leads' },
    { label: 'Contact Messages', value: stats.totalContacts, sub: 'from contact form', href: '/admin/leads', cta: 'View Messages' },
    { label: 'Session Notes', value: '—', sub: 'click to manage', href: '/admin/notes', cta: 'View Notes' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* ── Config warnings ── */}
      {!stats.sheetsConfigured && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', color: '#856404' }}>
          ⚠️ <strong>GOOGLE_SHEETS_BOOKINGS_ID is not set.</strong> Appointment form submissions will not be saved to Google Sheets. Go to Vercel → Project Settings → Environment Variables and add <code>GOOGLE_SHEETS_BOOKINGS_ID</code> with your Bookings spreadsheet ID.
        </div>
      )}
      {stats.leadsError && (
        <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', color: '#c53030' }}>
          ❌ <strong>Could not read leads from Google Sheets:</strong> {stats.leadsError}. Check that the service account has Editor access to the Bookings sheet.
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)', borderTop: '3px solid var(--clr-sage)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-lt)', marginBottom: 'var(--space-2)' }}>{c.label}</p>
            <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--clr-forest)', lineHeight: 1 }}>{c.value}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--clr-text-lt)', margin: 'var(--space-2) 0 var(--space-4)' }}>{c.sub}</p>
            <Link href={c.href} className="btn btn-outline btn-sm">{c.cta}</Link>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-5)' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Link href="/admin/blog/new" className="btn btn-primary">+ New Blog Post</Link>
          <Link href="/admin/notes/new" className="btn btn-outline">+ New Session Note</Link>
          <Link href="/admin/leads" className="btn btn-outline">View All Leads</Link>
        </div>
      </div>
    </AdminLayout>
  );
}
