import { NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/blog';

export async function GET() {
  let blogStats: Record<string, unknown> = { ok: false };
  try {
    const all = await getAllBlogs();
    const published = all.filter((p) => p.status === 'published');
    blogStats = {
      ok: true,
      total: all.length,
      published: published.length,
      drafts: all.length - published.length,
      sampleStatuses: Array.from(new Set(all.map((p) => p.status))).slice(0, 5),
    };
  } catch (err) {
    blogStats = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  let serviceAccountEmail: string | null = null;
  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
    if (raw) {
      const parsed = JSON.parse(raw) as { client_email?: string };
      serviceAccountEmail = parsed.client_email ?? null;
    }
  } catch {
    serviceAccountEmail = 'PARSE_ERROR';
  }

  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: {
      hasGoogleKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasJwt: !!process.env.JWT_SECRET,
      hasBookingsSheet: !!process.env.GOOGLE_SHEETS_BOOKINGS_ID,
      hasBlogSheet: !!process.env.GOOGLE_SHEETS_BLOG_ID,
      hasTestimonialsSheet: !!process.env.GOOGLE_SHEETS_TESTIMONIALS_ID,
    },
    serviceAccountEmail,
    blogSheetId: process.env.GOOGLE_SHEETS_BLOG_ID || null,
    blogStats,
  });
}
