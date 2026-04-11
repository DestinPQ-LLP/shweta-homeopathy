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
