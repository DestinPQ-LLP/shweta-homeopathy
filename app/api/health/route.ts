import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: {
      hasGoogleKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasJwt: !!process.env.JWT_SECRET,
      hasSheetsId: !!process.env.GOOGLE_SHEETS_ID,
    },
  });
}
