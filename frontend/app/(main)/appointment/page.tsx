import type { Metadata } from 'next';
import AppointmentForm from '@/components/public/AppointmentForm';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Book an Appointment',
  description:
    "Request a homeopathy consultation with Dr. Shweta Goyal — in clinic (Zirakpur / Budhlada) or online. We contact you within 24 hours to confirm your slot.",
  path: '/appointment',
});

export default function AppointmentPage() {
  return (
    <>
      <section style={{
        background: 'linear-gradient(160deg, hsl(152,42%,14%), hsl(152,30%,28%))',
        padding: 'var(--space-16) 0',
      }}>
        <div className="container">
          <span className="section-label" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
            Get Started
          </span>
          <h1 style={{ color: 'var(--clr-white)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            Book a Consultation
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-lg)', maxWidth: '550px' }}>
            Fill in the form below. We will contact you within 24 hours to confirm your appointment time. Free 10-minute introductory call available.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-12)', alignItems: 'start' }}>
            {/* Form */}
            <div>
              <div className="card" style={{ borderTop: '4px solid var(--clr-sage)' }}>
                <AppointmentForm />
              </div>
            </div>

            {/* Info sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'sticky', top: 'calc(var(--header-h) + 2rem)' }}>
              <div className="card">
                <h4 style={{ marginBottom: 'var(--space-4)' }}>Contact Us Directly</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { icon: '📞', label: 'Phone', value: '+91 62844 11753', href: 'tel:+916284411753' },
                    { icon: '✉️', label: 'Email', value: 'drshwetahmc@gmail.com', href: 'mailto:drshwetahmc@gmail.com' },
                  ].map((c) => (
                    <a key={c.label} href={c.href} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit', padding: 'var(--space-3)', background: 'var(--clr-sage-pale)', borderRadius: 'var(--radius-md)', transition: 'background 0.2s' }}>
                      <span style={{ fontSize: '20px' }}>{c.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--clr-text-lt)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--clr-sage)', fontWeight: 600 }}>{c.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: 'var(--space-4)' }}>Clinic Locations</h4>
                {[
                  { name: 'Zirakpur Clinic', address: 'Patiala Road, Zirakpur-140603, Punjab', hours: 'Mon–Sat · 9AM–7PM' },
                  { name: 'Budhlada Clinic', address: 'Main Clinic Road, Budhlada, Punjab', hours: 'Tue, Thu, Sat · By Appointment' },
                ].map((loc) => (
                  <div key={loc.name} style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--clr-border)' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--clr-forest)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>📍 {loc.name}</p>
                    <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--clr-text-mid)' }}>{loc.address}</p>
                    <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--clr-sage)', fontWeight: 500 }}>🕐 {loc.hours}</p>
                  </div>
                ))}
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--clr-forest)', fontWeight: 600 }}>💻 Online — Worldwide</p>
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--clr-text-mid)' }}>Video consultation with doorstep medicine delivery.</p>
              </div>

              <div className="card" style={{ background: 'var(--clr-gold-lt)', borderColor: 'hsl(42,68%,82%)' }}>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'hsl(42,60%,28%)', lineHeight: 1.7 }}>
                  🎯 <strong>Free 10-minute introductory call</strong> available to help you decide if Dr. Shweta is the right fit before booking a full consultation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
