import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllConditions } from '@/lib/healing-conditions';
import { buildMetadata } from '@/lib/seo';
import { Shield, Target, Leaf } from 'lucide-react';
import ServiceFilterGrid from '@/components/public/ServiceFilterGrid';
import ConsultationPathway from '@/components/public/ConsultationPathway';
import styles from './services.module.css';

export const metadata: Metadata = buildMetadata({
  title: 'Conditions We Treat',
  description:
    "Dr. Shweta's Homoeopathy treats a wide range of chronic and complex conditions including skin diseases, women's health, joint problems, pediatric conditions, respiratory issues, thyroid disorders, and much more.",
  path: '/services',
});

export const revalidate = 3600;

export default async function ServicesPage() {
  const liveConditions = await getAllConditions(false).catch(() => []);

  return (
    <>
      {/* Glassmorphism hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow1} aria-hidden />
        <div className={styles.heroGlow2} aria-hidden />
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.heroBadge}>Services</span>
          <h1 className={styles.heroTitle}>Conditions&nbsp;We&nbsp;Treat</h1>
          <p className={styles.heroSub}>
            Classical homeopathic treatment for chronic, complex, and
            difficult-to-treat conditions. Every prescription is individually
            crafted — never protocol-driven.
          </p>
          <div className={styles.heroStats}>
            {[
              { num: '100+', label: 'Conditions treated' },
              { num: '15,000+', label: 'Patients healed' },
              { num: '6+', label: 'Years experience' },
            ].map((s) => (
              <div key={s.label} className={styles.heroStat}>
                <span className={styles.heroStatNum}>{s.num}</span>
                <span className={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filterable conditions bento grid */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="section-label">Explore by category</span>
            <h2 style={{ marginTop: 'var(--space-3)' }}>Find Your Condition</h2>
          </div>
          <ServiceFilterGrid conditions={liveConditions} />
        </div>
      </section>

      {/* Consultation process */}
      <ConsultationPathway />

      {/* Benefits */}
      <section className="section" style={{ background: 'var(--clr-sage-pale)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', marginInline: 'auto', marginBottom: 'var(--space-12)' }}>
            <span className="section-label">Why Choose Homeopathy</span>
            <h2 style={{ marginTop: 'var(--space-3)' }}>Safe. Natural. Permanent.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
            {[
              { Icon: Shield, title: 'Zero Side Effects', desc: 'Safe for children, pregnant women, nursing mothers, and the elderly.' },
              { Icon: Target, title: 'Permanent Cure', desc: 'Removes the root cause of disease rather than managing symptoms indefinitely.' },
              { Icon: Leaf, title: 'Natural Healing', desc: "Highly diluted natural remedies that stimulate the body's own healing intelligence." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)', color: 'var(--clr-forest)' }}>
                  <Icon size={40} />
                </div>
                <h4 style={{ marginBottom: 'var(--space-2)' }}>{title}</h4>
                <p style={{ fontSize: 'var(--text-sm)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--space-16) 0', background: 'var(--clr-forest)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--clr-white)', marginBottom: 'var(--space-4)' }}>Not Sure Where to Start?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-6)', maxWidth: '500px', marginInline: 'auto' }}>
            Book a consultation and let Dr. Shweta assess your case comprehensively.
          </p>
          <Link href="/appointment" className="btn btn-gold btn-lg">Request Appointment</Link>
        </div>
      </section>
    </>
  );
}

