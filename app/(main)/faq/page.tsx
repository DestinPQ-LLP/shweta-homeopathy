import type { Metadata } from 'next';
import Link from 'next/link';
import FaqAccordion from '@/components/public/FaqAccordion';
import { buildMetadata, buildFAQSchema } from '@/lib/seo';
import { faqs } from '@/lib/content';

export const metadata: Metadata = buildMetadata({
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about homeopathic treatment, consultation process, timelines, and what to expect at Dr. Shweta\'s Homoeopathy.',
  path: '/faq',
});
export const revalidate = 3600;

export default function FAQPage() {
  const schema = buildFAQSchema(faqs);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section style={{ background: 'linear-gradient(160deg, #ffffff 0%, hsl(183, 30%, 97%) 40%, hsl(183, 25%, 94%) 100%)', padding: 'var(--space-16) 0' }}>
        <div className="container">
          <span className="section-label" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--clr-forest)' }}>Questions & Answers</span>
          <h1 style={{ color: 'var(--clr-forest)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>Frequently Asked Questions</h1>
          <p style={{ color: 'var(--clr-text-mid)', fontSize: 'var(--text-lg)', maxWidth: '550px' }}>Everything you need to know before booking your first consultation.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px', marginInline: 'auto' }}>
          <FaqAccordion />
          <div style={{ marginTop: 'var(--space-12)', textAlign: 'center', padding: 'var(--space-8)', background: 'var(--clr-sage-pale)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ marginBottom: 'var(--space-3)' }}>Still Have Questions?</h3>
            <p style={{ color: 'var(--clr-text-mid)', marginBottom: 'var(--space-5)' }}>Reach out directly or request a free 10-minute introductory call.</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-outline">Send a Message</Link>
              <a href="tel:+916284411753" className="btn btn-primary">📞 Call Us</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
