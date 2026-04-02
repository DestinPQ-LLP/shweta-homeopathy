import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/google/sheets';
import { sendEmail, adminNotificationEmail } from '@/lib/google/gmail';

const SHEET_ID = process.env.GOOGLE_SHEETS_BOOKINGS_ID || '';
const ADMIN_EMAIL = process.env.GOOGLE_GMAIL_FROM || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const timestamp = new Date().toISOString();
    if (SHEET_ID) {
      await appendToSheet(SHEET_ID, 'Contacts!A:F', [
        [timestamp, name, email, phone || '', subject || '', message],
      ]);
    }
    if (ADMIN_EMAIL) {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Contact Message — ${name}`,
        html: adminNotificationEmail({ Name: name, Email: email, Phone: phone || 'N/A', Subject: subject || 'N/A', Message: message, Timestamp: timestamp }),
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
