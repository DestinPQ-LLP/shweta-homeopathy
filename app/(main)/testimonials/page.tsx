import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedTestimonials, type Testimonial } from '@/lib/testimonials';
import { testimonials as fallback } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import TestimonialGrid from '@/components/public/TestimonialGrid';

export const metadata: Metadata = buildMetadata({
  title: 'Patient Testimonials',
  description: "Read real patient stories and testimonials from Dr. Shweta Goyal's homeopathy clinic. Treating chronic illness, skin diseases, joint problems, and more.",
  path: '/testimonials',
});
export const revalidate = 1800;

export default async function TestimonialsPage() {
  let testimonials: Testimonial[] = [];
  try {
    testimonials = await getPublishedTestimonials();
  } catch {
    testimonials = fallback.map(t => ({ ...t, location: t.location ?? '', status: 'published' as const, createdAt: '' }));
  }
  if (testimonials.length === 0) {
    testimonials = fallback.map(t => ({ ...t, location: t.location ?? '', status: 'published' as const, createdAt: '' }));
  }

  return (
    <>
      {/* Hero — light premium gradient */}
      <section style={{
        background: 'linear-gradient(160deg, #ffffff 0%, hsl(183, 30%, 97%) 40%, hsl(183, 25%, 94%) 100%)',
        padding: 'var(--space-16) 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow orb */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-60px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(42,68%,52%,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} aria-hidden="true" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="section-label" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--clr-forest)', borderColor: 'rgba(0,0,0,0.1)' }}>
            Real Stories
          </span>
          <h1 style={{ color: 'var(--clr-forest)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            Patient Testimonials
          </h1>
          <p style={{ color: 'var(--clr-text-mid)', fontSize: 'var(--text-lg)', maxWidth: '550px' }}>
            Genuine stories from patients whose lives have been transformed through Dr. Shweta&apos;s homeopathic treatment.
          </p>
          {/* Rating summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {['★','★','★','★','★'].map((s, i) => (
                <span key={i} style={{ color: 'hsl(42,88%,58%)', fontSize: '1.25rem' }}>{s}</span>
              ))}
            </div>
            <span style={{ color: 'var(--clr-forest)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>4.9</span>
            <span style={{ color: 'var(--clr-text-lt)', fontSize: 'var(--text-sm)' }}>
              · 200+ verified Google reviews
            </span>
          </div>
        </div>
      </section>

      {/* Testimonial grid with pagination */}
      <section className="section">
        <div className="container">
          <TestimonialGrid testimonials={testimonials} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--clr-forest)', padding: 'var(--space-16) 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--clr-white)', marginBottom: 'var(--space-4)' }}>Your Story Could Be Next</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', marginInline: 'auto', marginBottom: 'var(--space-6)' }}>
            Begin your healing journey with Dr. Shweta today.
          </p>
          <Link href="/appointment" className="btn btn-gold btn-lg">Request Appointment</Link>
        </div>
      </section>
    </>
  );
}
