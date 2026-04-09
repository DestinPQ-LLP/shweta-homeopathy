import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/google/sheets';
import { sendEmail, appointmentAckEmail, adminNotificationEmail } from '@/lib/google/gmail';

const SHEET_ID = process.env.GOOGLE_SHEETS_BOOKINGS_ID || '';
const ADMIN_EMAIL = process.env.GOOGLE_GMAIL_FROM || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, age, concern, preferredTime, consultationType, message } = body;

    // Basic validation
    if (!name || !email || !phone || !concern) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    // Save to Google Sheets — 10 columns (A:J)
    // Col I = status (initial 'New'), Col J = message
    // PATCH /api/admin/leads/[rowIndex] updates Col I only
    if (SHEET_ID) {
      await appendToSheet(SHEET_ID, 'Leads!A:J', [[
        timestamp, name, email, phone, age || '',
        concern, preferredTime || '', consultationType, 'New', message || '',
      ]]);
    }

    // Send emails
    if (ADMIN_EMAIL) {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Appointment Request — ${name} (${concern})`,
        html: adminNotificationEmail({ Name: name, Email: email, Phone: phone, Age: age || 'N/A', Concern: concern, 'Preferred Time': preferredTime || 'Any', 'Consultation Type': consultationType, Message: message || 'N/A', Timestamp: timestamp }),
      });
      await sendEmail({
        to: email,
        subject: "We've received your appointment request — Dr. Shweta's Homoeopathy",
        html: appointmentAckEmail(name),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[appointment API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
