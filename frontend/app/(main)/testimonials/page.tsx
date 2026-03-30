import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedTestimonials, type Testimonial } from '@/lib/testimonials';
import { testimonials as fallback } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';

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
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, hsl(152,42%,14%), hsl(152,30%,28%))',
        padding: 'var(--space-16) 0',
      }}>
        <div className="container">
          <span className="section-label" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>Real Stories</span>
          <h1 style={{ color: 'var(--clr-white)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>Patient Testimonials</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-lg)', maxWidth: '550px' }}>
            Genuine stories from patients whose lives have been transformed through Dr. Shweta&apos;s homeopathic treatment.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ columns: '2 400px', gap: 'var(--space-6)', columnFill: 'balance' }}>
            {testimonials.map((t) => (
              <div key={t.id} className="card" style={{ breakInside: 'avoid', marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--text-xl)', color: 'var(--clr-gold)', letterSpacing: '2px' }}>{'★'.repeat(t.rating)}</div>
                  <span style={{ background: 'var(--clr-sage-pale)', color: 'var(--clr-sage)', fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>{t.condition}</span>
                </div>
                <p style={{ fontStyle: 'italic', lineHeight: 1.8, color: 'var(--clr-text-mid)', marginBottom: 'var(--space-4)' }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--clr-border)' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--clr-sage), var(--clr-forest))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 'var(--text-sm)', flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--clr-text)' }}>{t.name}</p>
                    {t.location && <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--clr-text-lt)' }}>📍 {t.location}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--clr-forest)', padding: 'var(--space-16) 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--clr-white)', marginBottom: 'var(--space-4)' }}>Your Story Could Be Next</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', marginInline: 'auto', marginBottom: 'var(--space-6)' }}>Begin your healing journey with Dr. Shweta today.</p>
          <Link href="/appointment" className="btn btn-gold btn-lg">Request Appointment</Link>
        </div>
      </section>
    </>
  );
}
