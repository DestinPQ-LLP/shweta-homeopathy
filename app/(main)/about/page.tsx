import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { buildMetadata } from '@/lib/seo';
import { Leaf, Dna, Handshake, Book, BookOpen } from 'lucide-react';
import BentoCredentials from '@/components/public/BentoCredentials';
import ClinicFootprintBand from '@/components/public/ClinicFootprintBand';
import ConsultationReel from '@/components/public/ConsultationReel';
import styles from './about.module.css';

export const metadata: Metadata = buildMetadata({
  title: 'About Dr. Shweta Goyal',
  description:
    'Learn about Dr. Shweta Goyal — BHMS Gold Medalist, MD (Hom), PG IACH Greece — an expert in classical homeopathy with 6+ years of experience and 15,000+ patients treated for chronic and complex conditions.',
  path: '/about',
});

export const revalidate = 3600;

const timeline = [
  { year: '2020', event: 'BHMS — Gold Medalist, Panjab University' },
  { year: '2020', event: 'Opened first clinic in Zirakpur (March)' },
  { year: '2020', event: 'Opened second clinic in Budhlada (June)' },
  { year: '2021', event: 'DNHE — Delhi' },
  { year: '2021', event: 'Launched online consultations — patients across India & abroad' },
  { year: '2023', event: 'MD in Homeopathy — Advanced specialization' },
  { year: '2024', event: 'PG — International Academy of Classical Homeopathy (IACH), Greece' },
  { year: '2025', event: '20,000+ patients treated. Continued focus on classical prescribing.' },
];

const philosophy = [
  {
    number: '01',
    title: 'Person, Not Disease',
    icon: <Dna size={22} />,
    body: 'Every patient is a unique individual — the prescription must match the person, not their disease label. No two people receive the same remedy.',
  },
  {
    number: '02',
    title: 'Root Cause Healing',
    icon: <Leaf size={22} />,
    body: 'Homeopathy aims to remove the root cause of suffering, not suppress symptoms. When the root is addressed, the expression at every level dissolves.',
  },
  {
    number: '03',
    title: 'Therapeutic Relationship',
    icon: <Handshake size={22} />,
    body: 'The trust and understanding built over time is as healing as the remedy itself. We listen deeply before we prescribe.',
  },
  {
    number: '04',
    title: 'Classical Prescribing',
    icon: <BookOpen size={22} />,
    body: 'One well-chosen constitutional remedy — the foundation of deep, lasting healing. Not polypharmacy or protocol prescribing.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Split-screen Hero ── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}><Leaf size={16} style={{ marginRight: '6px' }} /> About the Doctor</div>
            <h1 className={styles.heroTitle}>Dr. Shweta Goyal</h1>
            <p className={styles.heroSub}>
              Classical Homeopath with 6+ years of practice across Zirakpur, Budhlada, and online — treating patients worldwide.
            </p>
            <div className={styles.heroCreds}>
              {['BHMS Gold Medalist', 'MD (Hom)', 'PG · IACH Greece', 'DNHE Delhi'].map((c) => (
                <span key={c} className={styles.credPill}>{c}</span>
              ))}
            </div>
          </div>
          <div className={styles.heroPhoto}>
            {/* REPLACE with candid warm-lit photo when client provides */}
            <div className={styles.heroPhotoFrame}>
              <Image
                src="/photos/17677_aboutdoctor.jpg"
                alt="Dr. Shweta Goyal"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Credentials ── */}
      <BentoCredentials />

      {/* ── Clinic Footprint Band ── */}
      <ClinicFootprintBand />

      {/* ── Bio & Timeline ── */}
      <section className={styles.bioSection}>
        <div className="container">
          <div className={styles.bioGrid}>
            {/* Sticky photo + sidebar CTA */}
            <div className={styles.stickyCol}>
              <div className={styles.photoWrap}>
                <Image
                  src="/photos/17795_Dr__Shweta_in_Clinic.jpg"
                  alt="Dr. Shweta Goyal at clinic"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  sizes="(max-width: 640px) 100vw, 320px"
                />
              </div>
              <div className={`glass-card ${styles.ctaSidebar}`}>
                <p className={styles.ctaSidebarText}>Ready to start your healing journey?</p>
                <Link href="/appointment" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                  Book a Consultation
                </Link>
              </div>
            </div>

            {/* Content column */}
            <div className={styles.contentCol}>
              {/* Bio text */}
              <div>
                <span className="section-label">Background</span>
                <h2 style={{ marginBottom: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
                  An Expert in Classical Homeopathy
                </h2>
                <div className="divider" />
                <p>
                  Dr. Shweta Goyal is a distinguished homeopathic physician with a rare combination of academic excellence
                  and deep clinical experience. She graduated as a <strong>Gold Medalist in BHMS from Panjab University</strong>,
                  followed by an MD in Homeopathy and a prestigious post-graduate qualification from the
                  <strong> International Academy of Classical Homeopathy (IACH), Greece</strong> — one of the world&apos;s
                  foremost institutions for classical homeopathic training, founded by Dr. George Vithoulkas.
                </p>
                <p style={{ marginTop: 'var(--space-4)' }}>
                  Today, with 6+ years of clinical practice and more than 15,000 patients treated, Dr. Shweta runs
                  clinics in Zirakpur and Budhlada, Punjab, and conducts online consultations for patients across India and internationally.
                </p>
              </div>

              {/* Philosophy */}
              <div>
                <h3 style={{ marginBottom: 'var(--space-6)' }}>Treatment Philosophy</h3>
                <div className={styles.philosophyGrid}>
                  {philosophy.map((p) => (
                    <div
                      key={p.number}
                      className={`${styles.philosophyTile} ${parseInt(p.number) % 2 === 0 ? styles.philosophyTileAlt : ''}`}
                    >
                      <div className={styles.philosophyTileHead}>
                        <span className={styles.philosophyTileNum}>{p.number}</span>
                        <span className={styles.philosophyTileIcon}>{p.icon}</span>
                      </div>
                      <h4 className={styles.philosophyTileTitle}>{p.title}</h4>
                      <p className={styles.philosophyTileBody}>{p.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 style={{ marginBottom: 'var(--space-6)' }}>Journey & Credentials</h3>
                <div className={styles.timelineWrap}>
                  <div className={styles.timelineLine} />
                  <div className={styles.timelineItems}>
                    {timeline.map((t) => (
                      <div key={t.year} className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <span className={styles.timelineYear}>{t.year}</span>
                        <p className={styles.timelineEvent}>{t.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Consultation Reel ── */}
      <ConsultationReel />

      {/* ── Recognition & Talks ── */}
      <section className={styles.recognitionSection}>
        <div className="container">
          <div className={styles.recognitionHeader}>
            <span className="section-label">Recognition &amp; Speaking</span>
            <h2>Featured at Grihshobha EmpowerHer</h2>
            <p className={styles.recognitionDesc}>
              Dr. Shweta was invited as the homoeopathy expert at the Grihshobha EmpowerHer conference —
              a national platform celebrating women&apos;s health, beauty, and financial freedom — where she
              spoke on <em>Homoeopathy for Menopause Wellness</em> and received formal recognition.
            </p>
          </div>
          <div className={styles.recognitionGrid}>
            <div className={styles.recognitionCard}>
              <div className={styles.recognitionImgWrap}>
                <Image
                  src="/images/dr-1.jpeg"
                  alt="Dr. Shweta Goyal presenting on Homoeopathy for Menopause at Grihshobha EmpowerHer conference"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <p className={styles.recognitionCaption}>Speaking on Homoeopathy for Menopause Wellness</p>
            </div>
            <div className={styles.recognitionCard}>
              <div className={styles.recognitionImgWrap}>
                <Image
                  src="/images/dr-2.jpeg"
                  alt="Dr. Shweta Goyal receiving recognition on stage at Grihshobha EmpowerHer 2024"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <p className={styles.recognitionCaption}>Recognised as Homoeopathy Partner at EmpowerHer 2024</p>
            </div>
            <div className={styles.recognitionCard}>
              <div className={styles.recognitionImgWrap}>
                <Image
                  src="/images/dr-3.jpeg"
                  alt="Dr. Shweta Goyal receiving award at Grihshobha EmpowerHer 2024"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <p className={styles.recognitionCaption}>Awarded at the Grihshobha EmpowerHer Ceremony</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaStrip}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2>Ready to Begin Your Healing?</h2>
            <p>Schedule a consultation with Dr. Shweta — in clinic or online.</p>
            <Link href="/appointment" className="btn btn-gold btn-lg">Request Appointment</Link>
          </div>
        </div>
      </section>
    </>
  );
}

