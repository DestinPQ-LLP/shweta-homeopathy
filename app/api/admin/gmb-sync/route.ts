import { NextRequest, NextResponse } from 'next/server';
import { fetchAllClinics, type PlaceReview } from '@/lib/google/places';
import { getAllTestimonials, createTestimonial, type Testimonial } from '@/lib/testimonials';
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth';

/**
 * POST /api/admin/gmb-sync
 *
 * Pulls the latest Google reviews for both clinic Place IDs and appends any new
 * ones (deduped by author + publishTime) to the Testimonials sheet as drafts so
 * the admin can review/publish.
 *
 * Auth: either
 *   - Bearer admin JWT (manual trigger from admin dashboard)
 *   - `x-cron-secret: <CRON_SECRET>` header (Vercel cron / scheduled trigger)
 */

function isAuthorized(req: NextRequest, adminOk: boolean): boolean {
  if (adminOk) return true;
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader === `Bearer ${cronSecret}`) return true;
  const provided = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  return provided === cronSecret;
}

function dedupeKey(name: string, publishTime: string, text: string): string {
  return `${name.trim().toLowerCase()}::${publishTime || text.slice(0, 60).trim().toLowerCase()}`;
}

function reviewToTestimonial(
  r: PlaceReview,
  clinic: 'Zirakpur' | 'Budhlada'
): Omit<Testimonial, 'id' | 'createdAt'> {
  return {
    name: r.authorName,
    location: clinic,
    condition: 'General',
    rating: r.rating,
    text: r.text,
    status: 'draft',
    imageUrl: r.authorPhotoUrl,
    source: 'Google',
    clinic,
  };
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    const adminOk = token ? await verifyAdminToken(token) : false;
    if (!isAuthorized(req, adminOk)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { zirakpur, budhlada, errors } = await fetchAllClinics();

    const existing = await getAllTestimonials();
    const seen = new Set(existing.map(t => dedupeKey(t.name, '', t.text)));

    const inserted: { clinic: string; author: string }[] = [];
    const skipped: { clinic: string; author: string; reason: string }[] = [];

    async function ingest(summary: typeof zirakpur, clinic: 'Zirakpur' | 'Budhlada') {
      if (!summary) return;
      for (const r of summary.reviews) {
        const key = dedupeKey(r.authorName, r.publishTime, r.text);
        if (seen.has(key) || seen.has(dedupeKey(r.authorName, '', r.text))) {
          skipped.push({ clinic, author: r.authorName, reason: 'duplicate' });
          continue;
        }
        if (!r.text?.trim()) {
          skipped.push({ clinic, author: r.authorName, reason: 'empty-text' });
          continue;
        }
        try {
          await createTestimonial(reviewToTestimonial(r, clinic));
          seen.add(key);
          inserted.push({ clinic, author: r.authorName });
        } catch (err) {
          skipped.push({
            clinic,
            author: r.authorName,
            reason: `write-failed: ${(err as Error).message}`,
          });
        }
      }
    }

    await ingest(zirakpur, 'Zirakpur');
    await ingest(budhlada, 'Budhlada');

    return NextResponse.json({
      ok: true,
      summary: {
        zirakpur: zirakpur
          ? { rating: zirakpur.rating, count: zirakpur.userRatingCount, reviewsFetched: zirakpur.reviews.length }
          : null,
        budhlada: budhlada
          ? { rating: budhlada.rating, count: budhlada.userRatingCount, reviewsFetched: budhlada.reviews.length }
          : null,
      },
      inserted,
      skipped,
      errors,
    });
  } catch (err: unknown) {
    console.error('[gmb-sync POST]', err);
    return NextResponse.json(
      { error: 'gmb sync failed', detail: (err as Error).message },
      { status: 500 }
    );
  }
}

// Vercel cron uses GET — proxy to POST.
export async function GET(req: NextRequest) {
  return POST(req);
}
