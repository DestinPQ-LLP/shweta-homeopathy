import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.GOOGLE_GMAIL_FROM,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.GOOGLE_GMAIL_FROM;
  if (!from || !process.env.SMTP_PASS) throw new Error('SMTP credentials not configured');
  await transporter.sendMail({
    from: `"Dr. Shweta's Homoeopathy" <${from}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

const BRAND = {
  forest: '#1a3d2b',
  sage: '#4a7c5f',
  sagePale: '#edf6f0',
  gold: '#c9a84c',
  text: '#333',
  muted: '#6b7280',
  border: '#e5e7eb',
  bg: '#f9fafb',
  white: '#ffffff',
};

function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${BRAND.white};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
  <!-- Header -->
  <tr><td style="background:${BRAND.forest};padding:28px 32px">
    <table width="100%"><tr>
      <td style="font-family:Georgia,serif;font-size:20px;color:${BRAND.white};letter-spacing:0.02em">Dr. Shweta's Homoeopathy</td>
    </tr></table>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px">${content}</td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 32px;border-top:1px solid ${BRAND.border};background:${BRAND.bg}">
    <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.5">
      Dr. Shweta's Homoeopathy &middot; Patiala Road, Zirakpur-140603, Punjab<br>
      +91 62844 11753 &middot; drshwetawebsite@gmail.com
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function appointmentAckEmail(name: string): string {
  return emailShell(`
    <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;color:${BRAND.forest}">Appointment Request Received</h2>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.muted}">We'll get back to you within 24 hours.</p>

    <p style="color:${BRAND.text};line-height:1.7;font-size:15px">Dear <strong>${name}</strong>,</p>
    <p style="color:${BRAND.text};line-height:1.7;font-size:15px">
      Thank you for reaching out. We have received your appointment request and our team will contact you within <strong>24 hours</strong> to confirm your consultation time.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:8px;overflow:hidden">
      <tr><td style="background:${BRAND.sagePale};border-left:4px solid ${BRAND.sage};padding:16px 20px">
        <p style="margin:0 0 6px;color:${BRAND.forest};font-weight:600;font-size:14px">What happens next?</p>
        <p style="margin:0;color:${BRAND.text};font-size:14px;line-height:1.6">Our team will call or email you to schedule your consultation at a time that works for you.</p>
      </td></tr>
    </table>

    <p style="color:${BRAND.text};line-height:1.7;font-size:15px">
      If you need immediate assistance, call us at <strong>+91 62844 11753</strong>.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:28px 0 0">
      <tr><td style="background:${BRAND.forest};border-radius:6px;padding:12px 28px">
        <a href="https://shweta.destinpq.com" style="color:${BRAND.white};text-decoration:none;font-size:14px;font-weight:600">Visit Our Website</a>
      </td></tr>
    </table>
  `);
}

export function adminNotificationEmail(data: Record<string, string>): string {
  const rows = Object.entries(data)
    .map(([k, v], i) => {
      const bg = i % 2 === 0 ? BRAND.white : BRAND.bg;
      return `<tr style="background:${bg}">
        <td style="padding:10px 16px;font-size:13px;color:${BRAND.muted};font-weight:500;white-space:nowrap;border-bottom:1px solid ${BRAND.border}">${k}</td>
        <td style="padding:10px 16px;font-size:14px;color:${BRAND.text};border-bottom:1px solid ${BRAND.border}">${v}</td>
      </tr>`;
    })
    .join('');

  return emailShell(`
    <h2 style="margin:0 0 4px;font-family:Georgia,serif;font-size:22px;color:${BRAND.forest}">New Form Submission</h2>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.muted}">A new enquiry has been received on the website.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:8px;overflow:hidden">
      ${rows}
    </table>

    <p style="margin:20px 0 0;font-size:12px;color:${BRAND.muted}">
      Received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </p>
  `);
}
