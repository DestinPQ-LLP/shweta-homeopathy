import AdminLayout from '@/components/admin/AdminLayout';
import LeadsClient from './LeadsClient';
import styles from './leads.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Leads — Admin' };

type Row = Record<string, string>;

async function fetchLeads(): Promise<{ appointments: Row[]; contacts: Row[]; error?: string }> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/admin/leads`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return res.json();
  } catch {
    return { appointments: [], contacts: [], error: 'Could not load leads from Google Sheets.' };
  }
}

export default async function LeadsPage() {
  const { appointments, contacts, error } = await fetchLeads();

  return (
    <AdminLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Leads</h1>
        <span className={styles.count}>{appointments.length + contacts.length} total records</span>
      </div>
      <LeadsClient appointments={appointments} contacts={contacts} error={error} />
    </AdminLayout>
  );
}
