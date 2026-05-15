import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth';
import {
  getLandingConfig,
  setLandingConfig,
  getTrackingConfig,
  setTrackingConfig,
} from '@/lib/landing';

// Always read fresh from the sheet — never serve a Next.js fetch-cached copy.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const [landing, tracking] = await Promise.all([getLandingConfig(), getTrackingConfig()]);
  return NextResponse.json({ landing, tracking });
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const errors: string[] = [];

  if (body.landing && typeof body.landing === 'object') {
    try {
      await setLandingConfig(body.landing as Record<string, string>);
    } catch (err) {
      errors.push(`landing: ${(err as Error).message}`);
    }
  }

  if (body.tracking && typeof body.tracking === 'object') {
    try {
      await setTrackingConfig(body.tracking as Record<string, string>);
    } catch (err) {
      errors.push(`tracking: ${(err as Error).message}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 });
  }

  // Bust ISR caches so /ads and globally-injected tracking pixels reflect
  // the new values on the very next request instead of waiting up to 60s.
  revalidatePath('/ads');
  revalidatePath('/admin/landing');
  revalidatePath('/', 'layout'); // tracking pixels are injected in the root layout

  return NextResponse.json({ ok: true });
}
