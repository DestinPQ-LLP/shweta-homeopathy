import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet, ensureSheetTab } from '@/lib/google/sheets';
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
    // Save to Google Sheets — best-effort, don't let Sheets issues block the response
    if (SHEET_ID) {
      try {
        await ensureSheetTab(SHEET_ID, 'Contacts', [
          'Timestamp', 'Name', 'Email', 'Phone', 'Subject', 'Message',
        ]);
        await appendToSheet(SHEET_ID, 'Contacts!A:F', [
          [timestamp, name, email, phone || '', subject || '', message],
        ]);
      } catch (sheetErr) {
        console.error('[contact API] Sheets write failed (contact still processed):', (sheetErr as Error).message);
      }
    }
    if (ADMIN_EMAIL) {
      try {
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `New Contact Message — ${name}`,
          html: adminNotificationEmail({ Name: name, Email: email, Phone: phone || 'N/A', Subject: subject || 'N/A', Message: message, Timestamp: timestamp }),
        });
      } catch (emailErr) {
        console.warn('[contact API] Email send failed (contact still saved):', (emailErr as Error).message);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
