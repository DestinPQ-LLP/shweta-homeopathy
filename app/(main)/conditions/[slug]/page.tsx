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
import { fetchAllClinics, type PlaceReview } from '@/lib/google/places';
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

/* ── Instagram reel embed helper ──────────────────────── */
function toInstagramEmbed(url: string): string | null {
  const m = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  return `https://www.instagram.com/${m[1]}/${m[2]}/embed/?cr=1&v=14&wp=540&rd=`;
}

export default async function ConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getConditionBySlug(slug).catch(() => null);
  if (!data) notFound();
  const { condition } = data;

  const schema = buildConditionSchema(condition.name, condition.intro);
  const allConditions = await getAllConditions(false).catch(() => []);

  // Live Google reviews — best-effort, never block render
  const social = SOCIAL_PROOF[slug];
  let liveReviews: PlaceReview[] = [];
  if (social && social.reviewLinks.length > 0) {
    try {
      const clinics = await fetchAllClinics();
      const merged = [
        ...(clinics.zirakpur?.reviews ?? []),
        ...(clinics.budhlada?.reviews ?? []),
      ]
        .filter(r => r.text && r.rating >= 4)
        .sort((a, b) => (b.publishTime || '').localeCompare(a.publishTime || ''));
      liveReviews = merged.slice(0, social.reviewLinks.length);
    } catch (e) {
      console.warn('[conditions/[slug]] Google reviews fetch failed:', (e as Error).message);
    }
  }

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
            <p className={styles.sectionEyebrow}>Overview</p>
            <h2 className={styles.sectionHeading}>Overview</h2>
            {condition.intro.split(/\n{2,}/).map((para, idx) => (
              <p key={idx} className={styles.introText}>{para.trim()}</p>
            ))}
          </section>

          {/* 2. Symptom Cluster Chips */}
          <section id="symptoms" className={styles.section}>
            <p className={styles.sectionEyebrow}>Common Symptoms</p>
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
            <p className={styles.sectionEyebrow}>How Homeopathy Helps</p>
            <h2 className={styles.sectionHeading}>How Homeopathy Helps</h2>
            <div className={styles.treatmentPanel}>
              <Stethoscope size={20} className={styles.panelIcon} />
              <div>
                {condition.howHomeopathyHelps.split(/\n{2,}/).map((para, idx) => (
                  <p key={idx} className={styles.panelText}>{para.trim()}</p>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Expectation Setting Panel */}
          <section id="expectations" className={styles.section}>
            <p className={styles.sectionEyebrow}>What to Expect</p>
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
            <p className={styles.sectionEyebrow}>Prepare for Your Visit</p>
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

          {/* Patient Stories — Instagram reels + Google reviews */}
          {SOCIAL_PROOF[slug] && (SOCIAL_PROOF[slug].instagramLinks.length > 0 || SOCIAL_PROOF[slug].reviewLinks.length > 0) && (
            <section className={styles.section}>
              <p className={styles.sectionEyebrow}>Patient Stories</p>
              <h2 className={styles.sectionHeading}>Patient Stories</h2>
              <p style={{ color: 'var(--clr-text-mid)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
                Verified patient experiences from Instagram and Google Reviews.
              </p>
              <div className={styles.storyGrid}>
                {SOCIAL_PROOF[slug].instagramLinks.map((url) => {
                  const embed = toInstagramEmbed(url);
                  if (!embed) return null;
                  return (
                    <div key={url} className={styles.storyCard}>
                      <div className={styles.embedFrame}>
                        <iframe
                          src={embed}
                          loading="lazy"
                          allowFullScreen
                          scrolling="no"
                          allow="encrypted-media"
                          title="Instagram patient story"
                          className={styles.embedIframe}
                        />
                      </div>
                      <footer className={styles.storyFooter}>
                        <span className={styles.storyAvatar} aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                          </svg>
                        </span>
                        <div>
                          <p className={styles.storyInitials}>Instagram</p>
                          <a href={url} target="_blank" rel="noopener noreferrer" className={styles.storyAge}>Open on Instagram ↗</a>
                        </div>
                      </footer>
                    </div>
                  );
                })}
                {SOCIAL_PROOF[slug].reviewLinks.map((url, i) => {
                  const r = liveReviews[i];
                  const initial = (r?.authorName || 'G').trim().charAt(0).toUpperCase();
                  return (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={styles.storyCard} style={{ textDecoration: 'none' }}>
                      <div className={styles.reviewBody}>
                        <div className={styles.reviewStars} aria-label={`${r?.rating ?? 5} star Google review`}>
                          {'★'.repeat(Math.round(r?.rating ?? 5))}{'☆'.repeat(5 - Math.round(r?.rating ?? 5))}
                        </div>
                        <p className={styles.storyText}>
                          {r?.text
                            ? `“${r.text}”`
                            : `Verified Google Review #${i + 1} — read the full patient testimonial on Google.`}
                        </p>
                      </div>
                      <footer className={styles.storyFooter}>
                        <span className={styles.storyAvatar} aria-hidden="true">
                          {r?.authorName ? (
                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{initial}</span>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          )}
                        </span>
                        <div>
                          <p className={styles.storyInitials}>{r?.authorName || 'Google Review'}</p>
                          <span className={styles.storyAge}>
                            {r?.relativeTime ? `${r.relativeTime} · Read on Google ↗` : 'Read on Google ↗'}
                          </span>
                        </div>
                      </footer>
                    </a>
                  );
                })}
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
