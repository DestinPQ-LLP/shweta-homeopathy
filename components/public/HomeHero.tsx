'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import {
  Calendar, ArrowRight, Star, Award, Users, Clock,
  CheckCircle, Leaf
} from 'lucide-react';
import styles from './HomeHero.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Stat { number: string; label: string; }
interface Props { stats: Stat[]; }

export default function HomeHero({ stats }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section className={styles.hero} ref={sectionRef}>
      {/* ── Background decorations ── */}
      <div className={styles.bgDecor1} aria-hidden="true" />
      <div className={styles.bgDecor2} aria-hidden="true" />
      <div className={styles.bgDecor3} aria-hidden="true" />

      {/* ════════ MAIN LAYOUT ════════ */}
      <div className={styles.inner}>

        {/* ── LEFT: content ── */}
        <div className={styles.left}>

          {/* Badge */}
          <motion.div
            className={styles.badge}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className={styles.badgeDot} />
            Accepting New Patients · Est. 2009
          </motion.div>

          {/* Headline */}
          <h1 className={styles.headlineWrap}>
            <motion.span
              className={styles.line1}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            >
              Where Science
            </motion.span>
            <motion.span
              className={styles.line2}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            >
              Meets Nature.
              <span className={styles.leafIcon} aria-hidden="true">
                <Leaf size={28} />
              </span>
            </motion.span>
          </h1>

          {/* Divider accent */}
          <motion.div
            className={styles.accentLine}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          />

          {/* Descriptor */}
          <motion.p
            className={styles.desc}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
          >
            Expert homeopathic care for chronic &amp; complex conditions —
            rooted in classical principles, backed by 15+ years of
            practice and thousands of successful outcomes.
          </motion.p>

          {/* Pill credentials */}
          <motion.div
            className={styles.pills}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: EASE }}
          >
            {[
              { icon: <Award size={13} />, text: 'BHMS Gold Medalist' },
              { icon: <CheckCircle size={13} />, text: 'MD (Homeopathy)' },
              { icon: <CheckCircle size={13} />, text: 'PG - IACH Greece' },
            ].map(p => (
              <span key={p.text} className={styles.pill}>
                {p.icon} {p.text}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className={styles.ctaRow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
          >
            <Link href="/appointment" className={styles.ctaPrimary} id="hero-book-btn">
              <Calendar size={16} />
              Book Free Consultation
            </Link>
            <Link href="/about" className={styles.ctaGhost}>
              Our Story <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className={styles.statsRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {[
              { icon: <Users size={20} />, num: '10,000+', label: 'Patients Healed' },
              { icon: <Calendar size={20} />, num: '15+', label: 'Years Experience' },
              { icon: <CheckCircle size={20} />, num: '98%', label: 'Patient Satisfaction' },
              { icon: <Leaf size={20} />, num: 'Holistic', label: 'Natural & Safe Treatment' },
            ].map((s, i) => (
              <div key={s.label} className={styles.statCell}>
                <span className={styles.statIcon}>{s.icon}</span>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: photo + floating panels ── */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        >
          {/* Floating stats panel top-left */}
          <motion.div
            className={`${styles.floatCard} ${styles.floatCardLeft}`}
            initial={{ opacity: 0, x: -20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: EASE }}
          >
            <div className={styles.floatCardIcon}>
              <Users size={18} />
            </div>
            <div>
              <p className={styles.floatCardNum}>10,000+</p>
              <p className={styles.floatCardLabel}>Patients Healed</p>
            </div>
          </motion.div>

          {/* Floating stats panel — experience */}
          <motion.div
            className={`${styles.floatCard} ${styles.floatCardLeft2}`}
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6, ease: EASE }}
          >
            <div className={`${styles.floatCardIcon} ${styles.floatCardIconGreen}`}>
              <Clock size={18} />
            </div>
            <div>
              <p className={styles.floatCardNum}>15+ Years</p>
              <p className={styles.floatCardLabel}>Clinical Practice</p>
            </div>
          </motion.div>

          {/* Doctor photo */}
          <div className={styles.photoWrap}>
            {/* Decorative blob behind photo */}
            <div className={styles.photoBlobBg} aria-hidden="true" />

            <div className={styles.photoFrame}>
              <Image
                src="/photos/17650_drshweta.jpg"
                alt="Dr. Shweta Goyal — Classical Homeopath, Zirakpur"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                priority
                sizes="(max-width: 1024px) 100vw, 44vw"
              />
            </div>

            {/* Rating card — overlapping top-right */}
            <motion.div
              className={styles.ratingCard}
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6, ease: EASE }}
            >
              <div className={styles.ratingStars}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={13} fill="hsl(42,80%,52%)" color="hsl(42,80%,52%)" />
                ))}
              </div>
              <p className={styles.ratingNum}>4.9</p>
              <p className={styles.ratingLabel}>Google Rating</p>
            </motion.div>

            {/* Award card — overlapping right side */}
            <motion.div
              className={styles.awardCard}
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6, ease: EASE }}
            >
              <Award size={20} color="hsl(42,72%,52%)" />
              <div>
                <p className={styles.awardTitle}>Gold Medalist</p>
                <p className={styles.awardSub}>Panjab University</p>
              </div>
            </motion.div>

            {/* Name strip at the bottom */}
            <motion.div
              className={styles.nameStrip}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6, ease: EASE }}
            >
              <div className={styles.nameStripAvatar}>
                <Image
                  src="/photos/17650_drshweta.jpg"
                  alt="Dr. Shweta Goyal"
                  width={36}
                  height={36}
                  style={{ objectFit: 'cover', objectPosition: 'center top', borderRadius: '50%', width: '36px', height: '36px', maxWidth: 'none' }}
                />
              </div>
              <div>
                <p className={styles.nameStripTitle}>Dr. Shweta Goyal</p>
                <p className={styles.nameStripSub}>Classical Homeopath · Zirakpur</p>
              </div>
              <div className={styles.nameStripStatus}>
                <span className={styles.nameDot} />
                Available Now
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
