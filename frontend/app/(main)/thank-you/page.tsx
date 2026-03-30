import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Thank You | Appointment Request Received' };

export default function ThankYouPage() {
  return (
    <section style={{ padding: 'var(--space-32) 0', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '560px', marginInline: 'auto' }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-6)' }}>🌿</div>
        <h1 style={{ marginBottom: 'var(--space-4)', color: 'var(--clr-forest)' }}>Appointment Request Received!</h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--clr-text-mid)', lineHeight: 1.8, marginBottom: 'var(--space-8)' }}>
          Thank you for reaching out to Dr. Shweta&apos;s Homoeopathy. Our team will contact you within <strong>24 hours</strong> to confirm your consultation time and answer any questions you may have.
        </p>
        <div style={{ padding: 'var(--space-5)', background: 'var(--clr-sage-pale)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-8)', borderLeft: '4px solid var(--clr-sage)' }}>
          <p style={{ margin: 0, color: 'var(--clr-text)', fontSize: 'var(--text-sm)' }}>
            Need to reach us sooner? Call us at <a href="tel:+916284411753" style={{ color: 'var(--clr-sage)', fontWeight: 700 }}>+91 62844 11753</a> or email <a href="mailto:drshwetahmc@gmail.com" style={{ color: 'var(--clr-sage)', fontWeight: 700 }}>drshwetahmc@gmail.com</a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">Back to Home</Link>
          <Link href="/blog" className="btn btn-outline">Read Our Blog</Link>
        </div>
      </div>
    </section>
  );
}
