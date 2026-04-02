// Gmail API utility for sending transactional emails
import { google } from 'googleapis';

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    clientOptions: { subject: process.env.GOOGLE_GMAIL_FROM },
  });
}

function buildMimeMessage(opts: {
  to: string;
  from: string;
  subject: string;
  html: string;
}): string {
  const msg = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    opts.html,
  ].join('\r\n');
  return Buffer.from(msg).toString('base64url');
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.GOOGLE_GMAIL_FROM;
  if (!from) throw new Error('GOOGLE_GMAIL_FROM is not set');
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });
  const raw = buildMimeMessage({ ...opts, from });
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
}

export function appointmentAckEmail(name: string): string {
  return `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9faf9">
    <div style="background:#1a3d2b;border-radius:8px;padding:24px 32px;margin-bottom:24px">
      <h1 style="color:#fff;font-family:Georgia,serif;font-size:22px;margin:0">Dr. Shweta's Homoeopathy</h1>
    </div>
    <h2 style="color:#1a3d2b;font-family:Georgia,serif">Appointment Request Received</h2>
    <p style="color:#444;line-height:1.7">Dear <strong>${name}</strong>,</p>
    <p style="color:#444;line-height:1.7">Thank you for reaching out to Dr. Shweta's Homoeopathy. We have received your appointment request and our team will contact you within <strong>24 hours</strong> to confirm your consultation time.</p>
    <div style="background:#edf6f0;border-left:4px solid #4a7c5f;padding:16px 20px;border-radius:4px;margin:24px 0">
      <p style="margin:0;color:#2c5f3e;font-weight:600">What happens next?</p>
      <p style="margin:8px 0 0;color:#444">Our team will call or email you to schedule your consultation at a convenient time.</p>
    </div>
    <p style="color:#444;line-height:1.7">If you need immediate assistance, please call us at <strong>+91 62844 11753</strong>.</p>
    <p style="color:#888;font-size:13px;margin-top:40px">Dr. Shweta's Homoeopathy · Patiala Road, Zirakpur-140603, Punjab</p>
  </div>`;
}

export function adminNotificationEmail(data: Record<string, string>): string {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:8px 12px;color:#666;font-weight:500">${k}</td><td style="padding:8px 12px;color:#222">${v}</td></tr>`)
    .join('');
  return `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px">
    <h2 style="color:#1a3d2b;font-family:Georgia,serif">New Form Submission</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e0e7e2;border-radius:8px;overflow:hidden">
      ${rows}
    </table>
    <p style="color:#888;font-size:12px;margin-top:24px">Received at ${new Date().toLocaleString('en-IN')}</p>
  </div>`;
}
