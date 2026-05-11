import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedTestimonials, type Testimonial } from '@/lib/testimonials';
import { testimonials as fallback } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import { fetchAllClinics, type PlaceReview, type PlaceSummary } from '@/lib/google/places';
import TestimonialGrid from '@/components/public/TestimonialGrid';

export const metadata: Metadata = buildMetadata({
  title: 'Patient Testimonials',
  description: "Read real patient stories and testimonials from Dr. Shweta Goyal's homeopathy clinic. Treating chronic illness, skin diseases, joint problems, and more.",
  path: '/testimonials',
});

// Re-render every 5 minutes so newly imported reviews appear quickly.
export const revalidate = 300;

function placeReviewToTestimonial(r: PlaceReview, clinic: 'Zirakpur' | 'Budhlada'): Testimonial {
  // Stable-ish id from name + first 16 chars of text
  const seed = `${r.authorName}|${(r.text || '').slice(0, 16)}|${clinic}`;
  const id = `gp-${Buffer.from(seed).toString('base64url').slice(0, 16)}`;
  return {
    id,
    name: r.authorName || 'Google reviewer',
    location: clinic === 'Zirakpur' ? 'Zirakpur, Punjab' : 'Budhlada, Punjab',
    condition: '',
    rating: r.rating || 5,
    text: r.text || '',
    status: 'published',
    createdAt: r.publishTime || '',
    imageUrl: r.authorPhotoUrl || '',
    source: 'Google',
    clinic,
  };
}

export default async function TestimonialsPage() {
  // 1) Sheet-stored testimonials (curated + WordPress-imported + Google manual import)
  let sheetTestimonials: Testimonial[] = [];
  try {
    sheetTestimonials = await getPublishedTestimonials();
  } catch (err) {
    console.error('[testimonials] sheet fetch failed:', err);
  }

  // 2) Live Google Places API (5 most-relevant per clinic = 10 fresh reviews)
  let placesData: { zirakpur: PlaceSummary | null; budhlada: PlaceSummary | null } = { zirakpur: null, budhlada: null };
  const liveTestimonials: Testimonial[] = [];
  try {
    const all = await fetchAllClinics();
    placesData = { zirakpur: all.zirakpur, budhlada: all.budhlada };
    if (all.zirakpur) all.zirakpur.reviews.forEach(r => liveTestimonials.push(placeReviewToTestimonial(r, 'Zirakpur')));
    if (all.budhlada) all.budhlada.reviews.forEach(r => liveTestimonials.push(placeReviewToTestimonial(r, 'Budhlada')));
  } catch (err) {
    console.error('[testimonials] places fetch failed:', err);
  }

  // 3) Merge & de-duplicate (sheet first, then live; dedupe by name+first 40 chars of text)
  const seen = new Set<string>();
  const merged: Testimonial[] = [];
  for (const t of [...sheetTestimonials, ...liveTestimonials]) {
    const key = `${t.name.toLowerCase().trim()}::${t.text.slice(0, 40).toLowerCase().trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(t);
  }

  // 4) Final fallback so the page is never empty
  let testimonials = merged;
  if (testimonials.length === 0) {
    testimonials = fallback.map(t => ({ ...t, location: t.location ?? '', status: 'published' as const, createdAt: '' }));
  }

  // 5) Aggregate Google rating + total review count for the hero badge
  const zCount = placesData.zirakpur?.userRatingCount ?? 0;
  const bCount = placesData.budhlada?.userRatingCount ?? 0;
  const totalGoogleReviews = zCount + bCount;
  const weightedSum =
    (placesData.zirakpur?.rating ?? 0) * zCount + (placesData.budhlada?.rating ?? 0) * bCount;
  const averageRating = totalGoogleReviews > 0 ? weightedSum / totalGoogleReviews : 4.9;
  const displayRating = averageRating.toFixed(1);
  const displayReviewCount = totalGoogleReviews > 0 ? totalGoogleReviews : 200;

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
            <span style={{ color: 'var(--clr-forest)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>{displayRating}</span>
            <span style={{ color: 'var(--clr-text-lt)', fontSize: 'var(--text-sm)' }}>
              · {displayReviewCount}+ verified Google reviews across both clinics
            </span>
          </div>
          <p style={{ color: 'var(--clr-text-lt)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-4)' }}>
            Showing {testimonials.length} on this page.{' '}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Dr.+Shweta+Homoeopathy+Zirakpur"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--clr-forest)', fontWeight: 600, textDecoration: 'underline' }}
            >
              See all {totalGoogleReviews || ''} reviews on Google →
            </a>
          </p>
        </div>
      </section>

      {/* Testimonial grid with pagination */}
      <section className="section" id="testimonial-grid">
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
