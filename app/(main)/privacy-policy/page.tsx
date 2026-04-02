import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'Privacy Policy for Dr. Shweta\'s Homoeopathy — how we collect, use, and protect your data.',
  path: '/privacy-policy',
  noIndex: true,
});

export default function PrivacyPolicyPage() {
  return (
    <div className="container section" style={{ paddingTop: 'calc(var(--header-h) + var(--space-12))' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <span className="section-label">Legal</span>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--clr-text-lt)', marginBottom: 'var(--space-10)' }}>Last updated: March 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {[
            { title: '1. Information We Collect', body: 'We collect personal information you voluntarily provide when submitting the appointment form, contact form, or enquiry — including your name, email address, phone number, and health-related concerns. We do not collect data through tracking pixels or third-party advertising networks.' },
            { title: '2. How We Use Your Information', body: 'Your information is used solely to respond to your enquiry or appointment request, and to communicate treatment-related information. We do not sell, rent, or share your personal data with third parties for marketing purposes.' },
            { title: '3. Data Storage', body: 'Form submissions are stored securely in Google Workspace (Sheets and Drive) using a private service account. Uploaded files are stored in a restricted Google Drive folder accessible only to the clinic team.' },
            { title: '4. Cookies', body: 'This website uses a session cookie solely for the admin panel login. No tracking or analytics cookies are placed on public pages.' },
            { title: '5. Security', body: 'We take reasonable technical and organisational measures to protect your data. All form submissions are transmitted over HTTPS. Access to stored data is restricted to authorised clinic staff.' },
            { title: '6. Your Rights', body: 'You may request access to, correction of, or deletion of your personal data at any time by emailing us at drshwetahmc@gmail.com. We will respond within 30 days.' },
            { title: '7. Medical Disclaimer', body: 'Information shared with us for appointment purposes is treated as confidential clinical information and will not be disclosed to any third party without your explicit consent, except where required by law.' },
            { title: '8. Contact', body: 'For any privacy-related queries, contact us at drshwetahmc@gmail.com or call +91 62844 11753.' },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--clr-border)' }}>
          <Link href="/" className="btn btn-outline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
