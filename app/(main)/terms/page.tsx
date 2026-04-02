import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description: "Terms of Service for Dr. Shweta's Homoeopathy website and consultation services.",
  path: '/terms',
  noIndex: true,
});

export default function TermsPage() {
  return (
    <div className="container section" style={{ paddingTop: 'calc(var(--header-h) + var(--space-12))' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <span className="section-label">Legal</span>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>Terms of Service</h1>
        <p style={{ color: 'var(--clr-text-lt)', marginBottom: 'var(--space-10)' }}>Last updated: March 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {[
            { title: '1. Acceptance of Terms', body: 'By using this website or submitting any form, you agree to these Terms of Service. If you do not agree, please do not use this website.' },
            { title: '2. Medical Information Disclaimer', body: 'Content on this website is provided for general informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns.' },
            { title: '3. Appointment Requests', body: 'Submitting an appointment request form does not guarantee a confirmed appointment. The clinic will contact you within 24 hours to confirm availability and schedule your consultation.' },
            { title: '4. Online Consultations', body: 'Online consultations are conducted via video or phone call. The patient is responsible for ensuring a stable internet/phone connection. Consultations are subject to cancellation if the patient is unreachable at the scheduled time.' },
            { title: '5. Intellectual Property', body: 'All content on this website — including text, images, and structure — is the property of Dr. Shweta\'s Homoeopathy. Reproduction without prior written permission is prohibited.' },
            { title: '6. Limitation of Liability', body: 'Dr. Shweta\'s Homoeopathy is not liable for any indirect, incidental, or consequential damages arising from the use of this website or information obtained from it.' },
            { title: '7. Changes to Terms', body: 'We reserve the right to modify these Terms at any time. The updated version will be posted on this page with a revised date.' },
            { title: '8. Governing Law', body: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Punjab, India.' },
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
