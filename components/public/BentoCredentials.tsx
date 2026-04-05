'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Award, Microscope, Globe } from 'lucide-react';
import styles from './BentoCredentials.module.css';
import ScrollRevealText from './ScrollRevealText';

function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const duration = 1800;
    const fps = 60;
    const increment = to / (duration / (1000 / fps));
    const timer = setInterval(() => {
      current += increment;
      if (current >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / fps);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Mini sparkline SVG (static path representing growth curve)
function Sparkline() {
  const ref = useRef<SVGPathElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  return (
    <svg viewBox="0 0 120 40" className={styles.sparkline} aria-hidden="true">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--clr-gold)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--clr-gold)" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M0,38 C10,35 20,30 30,28 S50,20 60,16 S80,8 90,5 S110,2 120,1"
        fill="none"
        stroke="url(#sparkGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        ref={ref}
        style={{
          strokeDasharray: 180,
          strokeDashoffset: inView ? 0 : 180,
          transition: 'stroke-dashoffset 1.4s ease 0.3s',
        }}
      />
      <circle cx="120" cy="1" r="3" fill="var(--clr-gold)" />
    </svg>
  );
}

// Progress bar for years of experience
function ExperienceBar({ years }: { years: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  const pct = Math.min((years / 20) * 100, 100);
  return (
    <div ref={ref} className={styles.expBarWrap}>
      <div className={styles.expBarTrack}>
        <motion.div
          className={styles.expBarFill}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView ? pct / 100 : 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
      <span className={styles.expBarLabel}>{years}+ yrs</span>
    </div>
  );
}

const cellVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function BentoCredentials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef as React.RefObject<Element>, { once: true, margin: '-60px' });

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className="section-label">About the Doctor</span>
          <h2>A Luminary in Classical Homeopathy</h2>
          <div className="divider" style={{ marginInline: 'auto' }} />
          <p>
            Combining academic excellence, international training, and 15+ years of clinical practice
            to deliver deep, lasting healing through classical homeopathy.
          </p>
        </div>

        <motion.div
          ref={containerRef}
          className={styles.bento}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* Cell 1: Doctor photo */}
          <motion.div
            className={`${styles.cell} ${styles.cellPhoto}`}
            variants={cellVariants}
            custom={0}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <div className={styles.photoWrap}>
              <Image
                src="/photos/17686_Dr__Shweta_Goyal_In_clinic.jpg"
                alt="Dr. Shweta Goyal"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className={styles.photoOverlay}>
                <span className={styles.photoName}>Dr. Shweta Goyal</span>
                <span className={styles.photoCreds}>BHMS · MD (Hom) · PG IACH Greece</span>
              </div>
            </div>
          </motion.div>

          {/* Cell 2: Gold Medalist — with grid corner markers */}
          <motion.div
            className={`${styles.cell} ${styles.cellGold} ${styles.gridBox}`}
            variants={cellVariants}
            custom={1}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <span className={styles.credIcon}><Award size={32} /></span>
            <h4 className={styles.credTitle}>Gold Medalist</h4>
            <p className={styles.credSub}>BHMS — Panjab University</p>
          </motion.div>

          {/* Cell 3: MD */}
          <motion.div
            className={`${styles.cell} ${styles.cellMd} ${styles.gridBox}`}
            variants={cellVariants}
            custom={2}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <span className={styles.credIcon}><Microscope size={32} /></span>
            <h4 className={styles.credTitle}>MD (Hom)</h4>
            <p className={styles.credSub}>Advanced Specialization in Homoeopathy</p>
          </motion.div>

          {/* Cell 4: 15+ Years counter with progress bar */}
          <motion.div
            className={`${styles.cell} ${styles.cellCounter} ${styles.cellSage}`}
            variants={cellVariants}
            custom={3}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <span className={styles.counterNum}>
              <AnimatedCounter to={15} suffix="+" />
            </span>
            <span className={styles.counterLabel}>Years of Experience</span>
            <ExperienceBar years={15} />
          </motion.div>

          {/* Cell 5: 10,000+ patients counter with sparkline */}
          <motion.div
            className={`${styles.cell} ${styles.cellCounter} ${styles.cellForest}`}
            variants={cellVariants}
            custom={4}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <span className={styles.counterNum}>
              <AnimatedCounter to={10000} suffix="+" />
            </span>
            <span className={styles.counterLabel}>Patients Treated</span>
            <Sparkline />
          </motion.div>

          {/* Cell 6: Philosophy quote with ScrollRevealText */}
          <motion.div
            className={`${styles.cell} ${styles.cellQuote}`}
            variants={cellVariants}
            custom={5}
          >
            <span className={styles.quoteIcon}>&ldquo;</span>
            <ScrollRevealText
              text="True healing means removing the root cause of disease — not merely managing symptoms. Every patient deserves an individualized prescription."
              as="p"
              className={styles.quoteText}
              highlightWords={['root', 'cause', 'individualized']}
              delay={0.2}
            />
            <span className={styles.quoteAuthor}>— Dr. Shweta Goyal</span>
          </motion.div>

          {/* Cell 7: IACH Greece */}
          <motion.div
            className={`${styles.cell} ${styles.cellIach}`}
            variants={cellVariants}
            custom={6}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <span className={styles.credIcon}><Globe size={32} /></span>
            <h4 className={styles.credTitle}>PG · IACH Greece</h4>
            <p className={styles.credSub}>World&apos;s premier institute for classical homeopathy</p>
          </motion.div>

          {/* Cell 8: CTA */}
          <motion.div
            className={`${styles.cell} ${styles.cellCta}`}
            variants={cellVariants}
            custom={7}
          >
            <p className={styles.ctaHeading}>Ready to heal naturally?</p>
            <p className={styles.ctaDesc}>Free 10-min introductory call available.</p>
            <Link href="/appointment" className="btn btn-gold">
              Book Consultation
            </Link>
          </motion.div>
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
          <Link href="/about" className="btn btn-outline">Read Full Profile →</Link>
        </div>
      </div>
    </section>
  );
}
