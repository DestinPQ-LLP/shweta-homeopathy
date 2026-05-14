import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllConditions, getConditionBySlug } from '@/lib/healing-conditions';
import { STATIC_CONDITIONS } from '@/lib/static-conditions';
import { buildMetadata, buildConditionSchema } from '@/lib/seo';
import {
  Activity, Phone, CheckCircle2, Stethoscope,
  CalendarClock, PackageCheck, ArrowLeft,
} from 'lucide-react';
import StickyConditionNav from '@/components/public/StickyConditionNav';
import { SOCIAL_PROOF } from '@/lib/social-proof';
import styles from './condition.module.css';

const CONDITION_IMAGES: Record<string, string> = {
  'joint-problems-arthritis':    '/images/condition-joint-problems-arthritis.png',
  'respiratory-diseases':        '/images/condition-respiratory-diseases.png',
  'alopecia-hair-loss':          '/images/condition-alopecia-hair-loss.png',
  'cancer-supportive-care':      '/images/condition-cancer-supportive-care.png',
  'diabetes-mellitus':           '/images/condition-diabetes-mellitus.png',
  'autoimmune-disorders':        '/images/condition-autoimmune-disorders.png',
  'womens-health':               '/images/condition-womens-health.png',
  'pediatric-diseases':          '/images/condition-pediatric-diseases.png',
  'depression-anxiety':          '/images/condition-depression-anxiety.png',
  'thyroid-disorders':           '/images/condition-thyroid-disorders.png',
  'gastrointestinal-disorders':  '/images/condition-gastrointestinal-disorders.png',
  'geriatric-disorders':         '/images/condition-geriatric-disorders.png',
  'skin-diseases':               '/images/condition-skin-diseases.png',
  'migraine':                    '/images/condition-migraine.png',
};

export async function generateStaticParams() {
  const sheetConditions = await getAllConditions(false).catch(() => []);
  const sheetSlugs = new Set(sheetConditions.map((c) => c.slug));
  const staticSlugs = STATIC_CONDITIONS
    .filter((c) => !sheetSlugs.has(c.slug))
    .map((c) => ({ slug: c.slug }));
  return [
    ...sheetConditions.map((c) => ({ slug: c.slug })),
    ...staticSlugs,
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getConditionBySlug(slug).catch(() => null);
  if (!data) return {};
  const { condition } = data;
  return buildMetadata({
    title: `${condition.name} — Homeopathic Treatment`,
    description: `${condition.shortDesc} ${condition.intro.slice(0, 120)}...`,
    path: `/conditions/${condition.slug}`,
  });
}

export const revalidate = 3600;

/* ── Expectation timeline ─────────────────────────────── */
const DEFAULT_EXPECTATIONS = [
  { phase: 'Week 1–2', title: 'Early Response', body: 'The remedy begins acting at the energetic level. Many patients notice improved sleep, calmer mood, and a sense of well-being even before the main complaint shifts.' },
  { phase: 'Week 3–4', title: 'First Shifts', body: 'Energy improves, sleep may deepen. Skin or mood changes often appear before the main complaint resolves.' },
  { phase: 'Month 2–3', title: 'Core Healing', body: 'The primary condition begins to reduce. Frequency and intensity of symptoms decrease measurably.' },
  { phase: 'Month 4+', title: 'Consolidation', body: 'Remedy doses are tapered. The goal is the longest possible gap between doses without relapse.' },
];

const WOMENS_HEALTH_EXPECTATIONS = [
  { phase: 'Week 1–2', title: 'Period Cycles Start to Improve', body: 'Better flow. Regular periods. Pains and mood improve during periods.' },
  { phase: 'Week 3–4', title: 'First Shifts', body: 'Energy improves, sleep deepens, and PMS symptoms ease. Hormonal balance begins to settle.' },
  { phase: 'Month 2–3', title: 'Core Healing', body: 'Cycle regularity and flow stabilize. Cramps, bloating, and mood swings reduce measurably.' },
  { phase: 'Month 4+', title: 'Consolidation', body: 'Remedy doses are tapered. The goal is sustained hormonal balance and the longest possible gap between doses without relapse.' },
];

const WOMENS_HEALTH_SLUGS = new Set([
  'womens-health',
  'women-health',
  'menstrual-disorders',
  'pcos-pcod',
  'pcos',
  'pcod',
  'endometriosis',
  'menopause',
  'infertility',
]);

function getExpectations(slug: string) {
  return WOMENS_HEALTH_SLUGS.has(slug) ? WOMENS_HEALTH_EXPECTATIONS : DEFAULT_EXPECTATIONS;
}

/* ── What to bring ────────────────────────────────────── */
const BRING_ITEMS = [
  'Previous medical reports & lab results',
  'List of current medications (allopathic or otherwise)',
  'Family medical history if known',
  'A note on when symptoms began and what triggers them',
];

/* ── QoL story cards ──────────────────────────────────── */
const QOL_STORIES = [
  {
    initials: 'P.K.',
    age: '38, Female',
    story: '"I had tried every cream and antibiotic. My skin was raw and I avoided mirrors. Within two months of homeopathy, I finally slept through the night."',
  },
  {
    initials: 'R.S.',
    age: '55, Male',
    story: '"My joints were so painful I could not climb stairs. Dr. Shweta\'s prescription gave me my mornings back — I walk 4 km daily now."',
  },
];

export default async function ConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getConditionBySlug(slug).catch(() => null);
  if (!data) notFound();
  const { condition } = data;

  const schema = buildConditionSchema(condition.name, condition.intro);
  const allConditions = await getAllConditions(false).catch(() => []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── Hero ────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <Link href="/services" className={styles.backLink}>
              <ArrowLeft size={14} /> All Conditions
            </Link>
            <div className={styles.heroMeta}>
              <span className={styles.heroIcon}><Activity size={40} /></span>
              <h1 className={styles.heroTitle}>{condition.name}</h1>
            </div>
            <p className={styles.heroSub}>{condition.shortDesc}</p>
            <Link href="/appointment" className={`btn btn-gold ${styles.heroCta}`}>
              Book Consultation →
            </Link>
          </div>
          {CONDITION_IMAGES[slug] && (
            <div className={styles.heroImageWrap}>
              <Image
                src={CONDITION_IMAGES[slug]}
                alt={`${condition.name} — Managed With Homoeopathy`}
                width={580}
                height={387}
                className={styles.heroImage}
                priority
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Main layout ─────────────────────────────────── */}
      <div className={`container ${styles.layout}`}>

        {/* ── Sticky Section Nav (desktop) ────────────── */}
        <aside className={styles.sideNav}>
          <StickyConditionNav />
        </aside>

        {/* ── Content column ──────────────────────────── */}
        <main className={styles.content}>

          {/* 1. Overview */}
          <section id="overview" className={styles.section}>
            <h2 className={styles.sectionHeading}>Overview</h2>
            <p className={styles.introText}>{condition.intro}</p>
          </section>

          {/* 2. Symptom Cluster Chips */}
          <section id="symptoms" className={styles.section}>
            <h2 className={styles.sectionHeading}>Common Symptoms</h2>
            <div className={styles.chipGrid}>
              {condition.symptoms.map((s) => (
                <span key={s} className={styles.chip}>
                  <CheckCircle2 size={13} className={styles.chipIcon} />
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* 3. How Homeopathy Helps */}
          <section id="treatment" className={styles.section}>
            <h2 className={styles.sectionHeading}>How Homeopathy Helps</h2>
            <div className={styles.treatmentPanel}>
              <Stethoscope size={20} className={styles.panelIcon} />
              <p className={styles.panelText}>{condition.howHomeopathyHelps}</p>
            </div>
          </section>

          {/* 4. Expectation Setting Panel */}
          <section id="expectations" className={styles.section}>
            <h2 className={styles.sectionHeading}>What to Expect</h2>
            <div className={styles.timeline}>
              {getExpectations(slug).map((e, i, arr) => (
                <div key={e.phase} className={styles.timelineItem}>
                  <div className={styles.timelineMarker}>
                    <span className={styles.timelineNum}>{i + 1}</span>
                    {i < arr.length - 1 && <span className={styles.timelineLine} />}
                  </div>
                  <div className={styles.timelineBody}>
                    <span className={styles.timelinePhase}>{e.phase}</span>
                    <h4 className={styles.timelineTitle}>{e.title}</h4>
                    <p className={styles.timelineText}>{e.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. What To Bring Capsule */}
          <section id="prepare" className={styles.section}>
            <h2 className={styles.sectionHeading}>Prepare for Your Visit</h2>
            <div className={styles.bringCapsule}>
              <div className={styles.bringHeader}>
                <PackageCheck size={20} className={styles.bringIcon} />
                <strong>What to bring to your first consultation</strong>
              </div>
              <ul className={styles.bringList}>
                {BRING_ITEMS.map((item) => (
                  <li key={item} className={styles.bringItem}>
                    <CheckCircle2 size={14} className={styles.bringCheck} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 6. (Removed: Safety First red drawer) */}

          {/* QoL Story Cards */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Patient Stories</h2>
            <div className={styles.storyGrid}>
              {QOL_STORIES.map((story) => (
                <blockquote key={story.initials} className={styles.storyCard}>
                  <p className={styles.storyText}>{story.story}</p>
                  <footer className={styles.storyFooter}>
                    <span className={styles.storyAvatar}>{story.initials[0]}</span>
                    <div>
                      <p className={styles.storyInitials}>{story.initials}</p>
                      <p className={styles.storyAge}>{story.age}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          {/* Social Proof — Instagram & Google Reviews */}
          {SOCIAL_PROOF[slug] && (
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>Real Patient Results</h2>
              <p style={{ color: 'var(--clr-text-mid)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
                See verified patient experiences shared on Instagram and Google Reviews.
              </p>
              <div className={styles.socialProofGrid}>
                {SOCIAL_PROOF[slug].instagramLinks.length > 0 && (
                  <div className={styles.socialProofGroup}>
                    <h4 className={styles.socialProofLabel}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E1306C', flexShrink: 0 }} aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                      Instagram Reels &amp; Posts
                    </h4>
                    <div className={styles.socialProofLinks}>
                      {SOCIAL_PROOF[slug].instagramLinks.map((url, i) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={styles.socialProofLink}>
                          Watch patient story {i + 1} →
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {SOCIAL_PROOF[slug].reviewLinks.length > 0 && (
                  <div className={styles.socialProofGroup}>
                    <h4 className={styles.socialProofLabel}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4285F4', flexShrink: 0 }} aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      Google Reviews
                    </h4>
                    <div className={styles.socialProofLinks}>
                      {SOCIAL_PROOF[slug].reviewLinks.map((url, i) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={styles.socialProofLink}>
                          Read review {i + 1} on Google →
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside className={styles.sidebar}>
          {/* Book card */}
          <div className={`card ${styles.bookCard}`}>
            <CalendarClock size={22} className={styles.bookIcon} />
            <h4 className={styles.bookTitle}>Book a Consultation</h4>
            <p className={styles.bookBody}>
              Get an individualized prescription for {condition.name} from Dr. Shweta Goyal.
            </p>
            <Link href="/appointment" className={`btn btn-primary ${styles.bookBtn}`}>
              Request Appointment
            </Link>
            <a href="tel:+916284411753" className={styles.bookPhone}>
              <Phone size={12} /> +91 62844 11753
            </a>
          </div>

          {/* Credentials */}
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Dr. Shweta&apos;s Credentials</h4>
            {['BHMS — Gold Medalist, Panjab University', 'MD (Homoeopathy)', 'PG — IACH, Greece', '6+ Years Clinical Experience'].map((c) => (
              <div key={c} className={styles.credItem}>
                <CheckCircle2 size={13} className={styles.credIcon} />
                {c}
              </div>
            ))}
          </div>

          {/* Related */}
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Other Conditions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {allConditions.filter((c) => c.slug !== slug).slice(0, 5).map((c) => (
                <Link key={c.slug} href={`/conditions/${c.slug}`} className={styles.relatedLink}>
                  <Activity size={13} /> {c.name}
                </Link>
              ))}
              <Link href="/services" className={styles.relatedAll}>
                View all conditions →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
