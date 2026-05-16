import { NextRequest, NextResponse } from 'next/server';

// Returns visitor's ISO country code based on edge/CDN headers.
// Falls back to 'US' when no geo info is available.
export async function GET(req: NextRequest) {
  const country =
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-country') ||
    'US';

  return NextResponse.json(
    { country: country.toUpperCase() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
