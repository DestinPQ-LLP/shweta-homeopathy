import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/public/ContactForm';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description: "Get in touch with Dr. Shweta's Homoeopathy. Reach us by phone, email or the contact form. Clinics in Zirakpur & Budhlada, Punjab. Online consultations worldwide.",
  path: '/contact',
});

const info = [
  { icon: '📞', label: 'Phone', value: '+91 62844 11753', href: 'tel:+916284411753' },
  { icon: '✉️', label: 'Email', value: 'drshwetahmc@gmail.com', href: 'mailto:drshwetahmc@gmail.com' },
  {
    icon: '📍',
    label: 'Zirakpur Clinic',
    value: 'Patiala Road, Above Vintage Properties, Zirakpur, Punjab – 140603 · +91 62844–11753 · Mon–Sun 9:30 am–6:30 pm',
    href: 'https://maps.app.goo.gl/Dr9n9oduRfBhsK9E7',
  },
  {
    icon: '📍',
    label: 'Budhlada Clinic',
    value: 'Patel Marg, Near Railway Station, Budhlada, Mansa, Punjab – 151502 · +91 90564–62817 · Mon–Sun 9:00 am–6:00 pm',
    href: undefined,
  },
  {
    icon: '💻',
    label: 'Online Consultation',
    value: 'Anywhere in the world — video consultations via WhatsApp, Zoom or Google Meet · +91 62844–11753 · Flexible scheduling',
    href: undefined,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--clr-forest), var(--clr-sage))', padding: 'calc(var(--header-h) + var(--space-12)) 0 var(--space-16)', marginTop: 'calc(-1 * var(--header-h))' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-label" style={{ color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.12)' }}>Get In Touch</span>
          <h1 style={{ color: 'white', marginTop: 'var(--space-3)' }}>Contact Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 520, margin: 'var(--space-4) auto 0' }}>
            Reach out with any query or to learn more about treatment options.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,420px)', gap: 'var(--space-12)', alignItems: 'flex-start' }}>
            {/* Form */}
            <div>
              <span className="section-label">Send a Message</span>
              <h2 style={{ marginBottom: 'var(--space-6)' }}>How Can We Help?</h2>
              <ContactForm />
            </div>

            {/* Info sidebar */}
            <div>
              <span className="section-label">Reach Us Directly</span>
              <h3 style={{ marginBottom: 'var(--space-6)', marginTop: 'var(--space-2)' }}>Clinic Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {info.map((item) => (
                  <div key={item.label} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--clr-text)', marginBottom: 2 }}>{item.label}</p>
                      {item.href
                        ? <a href={item.href} style={{ color: 'var(--clr-sage)', fontSize: 'var(--text-sm)' }}>{item.value}</a>
                        : <p style={{ fontSize: 'var(--text-sm)' }}>{item.value}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'var(--space-8)', background: 'var(--clr-sage-pale)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
                <p style={{ fontWeight: 600, color: 'var(--clr-forest)', marginBottom: 'var(--space-2)' }}>🎁 Free Introductory Call</p>
                <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  Book a free 10-minute call to understand your case before committing to a consultation.
                </p>
                <Link href="/appointment" className="btn btn-primary">Book Free Call</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
