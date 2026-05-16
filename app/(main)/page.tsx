import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { faqs } from '@/lib/content';
import { buildDoctorSchema, buildFAQSchema } from '@/lib/seo';
import { getLatestBlogs } from '@/lib/blog';
import { getAllConditions } from '@/lib/healing-conditions';
import { getPublishedTestimonials } from '@/lib/testimonials';
import { fetchAllClinics } from '@/lib/google/places';
import {
  Shield, Target, Microscope, Globe, ClipboardList, Heart, Phone,
  Users, Calendar, CheckCircle, Award, Smile
} from 'lucide-react';
import BlogCard from '@/components/public/BlogCard';
import HomeHero from '@/components/public/HomeHero';
import BentoCredentials from '@/components/public/BentoCredentials';
import VideoSection from '@/components/public/VideoSection';
import FaqAccordion from '@/components/public/FaqAccordion';
import ProofRibbon from '@/components/public/ProofRibbon';
import ServiceFilterGrid from '@/components/public/ServiceFilterGrid';
import ConsultationPathway from '@/components/public/ConsultationPathway';
import TestimonialCarousel from '@/components/public/TestimonialCarousel';
import SocialProofRating from '@/components/public/SocialProofRating';
import WhyChooseGrid from '@/components/public/WhyChooseGrid';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: "Best Homeopath in Zirakpur & Budhlada — Dr. Shweta Goyal",
  description:
    "Dr. Shweta Goyal, BHMS Gold Medalist & MD Homeopathy, offers classical homeopathic treatment in Zirakpur and Budhlada, Punjab. Chronic illness, women's health, skin, joints & online consultations worldwide.",
};

const whyChoose = [
  { icon: <Shield size={32} />, title: 'Zero Side Effects', desc: 'Natural remedies that are safe for all ages — children, pregnant women, and the elderly.' },
  { icon: <Target size={32} />, title: 'Root Cause Treatment', desc: 'We treat the whole person, not just the symptom. Long-lasting results, not short-term suppression.' },
  { icon: <Microscope size={32} />, title: 'Classical Approach', desc: 'Trained at the International Academy of Classical Homeopathy, Greece — the gold standard globally.' },
  { icon: <Globe size={32} />, title: 'Online Consultations', desc: 'Worldwide consultations with doorstep delivery of medicines across India and internationally.' },
  { icon: <ClipboardList size={32} />, title: 'Thorough Case-Taking', desc: 'Deep, personalized case analysis — every patient is unique and treated as such.' },
  { icon: <Heart size={32} />, title: 'Permanent Cure', desc: 'Focused on eradicating disease at its roots, not managing symptoms indefinitely.' },
];

const statsBarData = [
  { icon: <Users size={22} />, num: '15,000+', label: 'Patients Healed' },
  { icon: <Calendar size={22} />, num: '6+', label: 'Years Experience' },
  { icon: <Smile size={22} />, num: '98%', label: 'Patient Satisfaction' },
  { icon: <Image src="/images/logo.webp" alt="Dr. Shweta's Homoeopathy" width={22} height={22} style={{ objectFit: 'contain' }} />, num: 'Holistic', label: 'Natural & Safe Treatment' },
];

export default async function HomePage() {
  const doctorSchema = buildDoctorSchema();
  const faqSchema = buildFAQSchema(faqs.slice(0, 6));
  const latestPosts = await getLatestBlogs(3).catch(() => []);
  const liveConditions = await getAllConditions(false).catch(() => []);
  const liveTestimonials = await getPublishedTestimonials().catch(() => []);

  // Live Google Reviews aggregate (Zirakpur + Budhlada)
  const reviewsData = await fetchAllClinics().catch(() => ({ zirakpur: null, budhlada: null, errors: [] as string[] }));
  const totalReviewCount =
    (reviewsData.zirakpur?.userRatingCount ?? 0) + (reviewsData.budhlada?.userRatingCount ?? 0);
  const ratedClinics = [reviewsData.zirakpur, reviewsData.budhlada].filter(
    (c): c is NonNullable<typeof c> => !!c && c.rating != null && !!c.userRatingCount,
  );
  const totalWeight = ratedClinics.reduce((s, c) => s + (c.userRatingCount ?? 0), 0);
  const averageRating = totalWeight
    ? ratedClinics.reduce((s, c) => s + (c.rating ?? 0) * (c.userRatingCount ?? 0), 0) / totalWeight
    : 4.9;
  const displayReviewCount = totalReviewCount || 200;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── Split-screen Hero ── */}
      <HomeHero stats={[
        { number: '6+', label: 'Years Experience' },
        { number: '15,000+', label: 'Patients Healed' },
        { number: '12+', label: 'Specialities' },
        { number: '98%', label: 'Patient Satisfaction' },
      ]} />

      {/* ── Stats Bar (removed) ── */}

      {/* ── Credentials & Why Choose Us strip ── */}
      <div className={styles.credWhyStrip}>
        <div className="container">
          <div className={styles.credWhyGrid}>
            {/* Trusted Credentials */}
            <div className={styles.credBlock}>
              <h4>Trusted Credentials</h4>
              <div className={styles.credBlockItems}>
                {[
                  { icon: <Award size={22} />, label: 'BHMS', sub: 'Gold Medalist' },
                  { icon: <Microscope size={22} />, label: 'MD', sub: '(Homeopathy)' },
                  { icon: <Globe size={22} />, label: 'PG - IACH', sub: 'Greece' },
                ].map(c => (
                  <div key={c.label} className={styles.credBlockItem}>
                    <div className={styles.credBlockIcon}>{c.icon}</div>
                    <span className={styles.credBlockLabel}>{c.label}</span>
                    <span className={styles.credBlockSub}>{c.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose Us */}
            <div className={styles.whyBlock}>
              <h4>Why Choose Us?</h4>
              <div className={styles.whyBlockItems}>
                {[
                  'Conveys trust, healing & scientific approach',
                  'Reflects nature with a clinical, premium feel',
                  'Creates a calming experience for patients',
                ].map(w => (
                  <div key={w} className={styles.whyBlockItem}>
                    <CheckCircle size={14} className={styles.whyBlockCheck} />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botanicals image */}
            <div className={styles.credWhyBotanical}>
              <Image
                src="/images/botanicals_flatlay.png"
                alt="Homeopathic botanicals"
                fill
                style={{ objectFit: 'contain' }}
                sizes="220px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Proof Ribbon (animated marquee) ── */}
      <ProofRibbon />

      {/* ── Bento Credentials Grid ── */}
      <BentoCredentials />

      {/* ── Meet the Doctor Video ── */}
      <VideoSection />

      {/* ── Service Filter Grid (Constellation Map) ── */}
      <section className={`section bg-sage-pale ${styles.conditionsSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-label">Conditions Treated</span>
            <h2>Homeopathy Helps With</h2>
            <p>Filter by category — hover any card to see symptoms and book directly.</p>
          </div>
          <ServiceFilterGrid conditions={liveConditions.map(c => ({
            ...c,
            category: (c as any).category || 'Chronic Care',
            icon: c.icon || 'Logo'
          })) as any} />
        </div>
      </section>

      {/* ── Why Choose ── */}
      <section className={`section ${styles.whySection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-label">Why Choose Homeopathy</span>
            <h2>Healing That Goes to the Root</h2>
            <p>Homeopathy is not just alternative medicine — it is a complete system of medicine that transforms health permanently.</p>
          </div>
          <WhyChooseGrid items={whyChoose} />
        </div>
      </section>

      {/* ── Consultation Pathway ── */}
      <section className={`section ${styles.processSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-label">How It Works</span>
            <h2>Your Healing Journey in 4 Steps</h2>
            <p>A simple, patient-centered process designed around your healing.</p>
          </div>
          <ConsultationPathway />
        </div>
      </section>

      {/* ── Testimonial Carousel ── */}
      <section className={`section bg-sage-pale ${styles.testimonialsSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-label">Patient Stories</span>
            <h2>What Our Patients Say</h2>
          </div>
          <div className={styles.testimonialsInner}>
            <TestimonialCarousel testimonials={liveTestimonials} />
            <SocialProofRating reviewCount={displayReviewCount} rating={averageRating} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
            <Link href="/testimonials" className="btn btn-outline">Read All Patient Stories</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ Preview ── */}
      <section className={`section ${styles.faqSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-label">Common Questions</span>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className={styles.faqWrap}>
            <FaqAccordion />
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Link href="/faq" className="btn btn-outline">All FAQs</Link>
          </div>
        </div>
      </section>

      {/* ── Blog Preview ── */}
      {latestPosts.length > 0 && (
        <section className={`section bg-sage-pale`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="section-label">From the Blog</span>
              <h2>Latest Articles</h2>
              <p>Insights on homeopathy, wellness, and healing from Dr. Shweta&apos;s practice.</p>
            </div>
            <div className={styles.blogPreviewGrid}>
              {latestPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
              <Link href="/blog" className="btn btn-outline">View All Articles</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <span className="section-badge" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}>
              Take the First Step
            </span>
            <h2 className={styles.ctaTitle}>Begin Your Healing Journey Today</h2>
            <p className={styles.ctaDesc}>
              Free 10-minute introductory call available. In-clinic (Zirakpur &amp; Budhlada) or online worldwide.
            </p>
            <div className={styles.ctaBtns}>
              <Link href="/appointment" className="btn btn-gold btn-lg" id="cta-book-btn">
                Request Appointment
              </Link>
              <a href="tel:+916284411753" className={`btn btn-lg ${styles.ctaCallBtn}`}>
                <Phone size={20} style={{ marginRight: '8px' }} /> Call +91 62844 11753
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
