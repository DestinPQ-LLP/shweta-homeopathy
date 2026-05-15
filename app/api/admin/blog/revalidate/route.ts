import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth';
import { getAllBlogs } from '@/lib/blog';

/**
 * Force-refresh public blog pages from the latest Google Sheet contents.
 * Called from the Refresh button on /admin/blog after editing the sheet directly.
 */
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Re-read so any sheet errors surface here, and so the count below is accurate.
    const posts = await getAllBlogs();

    // Invalidate listing pages
    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    revalidatePath('/');               // home shows latest blogs

    // Invalidate every published slug page
    for (const p of posts) {
      if (p.status === 'published' && p.slug) revalidatePath(`/blog/${p.slug}`);
    }

    return NextResponse.json({ ok: true, count: posts.length });
  } catch (err) {
    console.error('[admin/blog/revalidate]', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to refresh' },
      { status: 500 },
    );
  }
}
