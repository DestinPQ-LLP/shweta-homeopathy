import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getTokenFromRequest, verifyAdminToken } from '@/lib/auth';
import { getStoredPasswordHash, savePasswordHash, verifyPassword } from '@/lib/google/admin-config';

export async function POST(req: NextRequest) {
  // Require a valid admin session
  const token = getTokenFromRequest(req);
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let currentPassword: string;
  let newPassword: string;

  try {
    const body = await req.json();
    currentPassword = body.currentPassword ?? '';
    newPassword = body.newPassword ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both current and new passwords are required' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  // Resolve the currently-active password
  let activePassword: string;
  const sheetsHash = await getStoredPasswordHash();
  if (sheetsHash) {
    activePassword = sheetsHash; // already hashed — verifyPassword handles it
  } else {
    const envPw = process.env.ADMIN_PASSWORD ?? '';
    if (!envPw) {
      return NextResponse.json({ error: 'Admin password not configured' }, { status: 503 });
    }
    activePassword = envPw;
  }

  // Verify the current password
  const valid = verifyPassword(currentPassword, activePassword);
  if (!valid) {
    // Extra paranoia: also check raw env var in case sheets returns a stale value
    const envPw = process.env.ADMIN_PASSWORD ?? '';
    const a = Buffer.from(currentPassword);
    const b = Buffer.from(envPw);
    const envMatch = envPw && a.length === b.length && timingSafeEqual(a, b);
    if (!envMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
    }
  }

  // Save new password hash to Google Sheets
  await savePasswordHash(newPassword);

  return NextResponse.json({ success: true });
}
