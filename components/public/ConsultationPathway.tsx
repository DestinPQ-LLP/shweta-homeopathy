'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CalendarCheck, MessageCircle, Pill, RefreshCw } from 'lucide-react';
import styles from './ConsultationPathway.module.css';

const steps = [
  {
    number: '01',
    icon: <CalendarCheck size={28} />,
    title: 'Book Consultation',
    desc: 'Fill out our simple appointment form online or call us. Free 10-min intro call available.',
  },
  {
    number: '02',
    icon: <MessageCircle size={28} />,
    title: 'Deep Case Analysis',
    desc: 'Dr. Shweta takes a thorough history — body, mind, emotions, lifestyle — nothing is left out.',
  },
  {
    number: '03',
    icon: <Pill size={28} />,
    title: 'Your Personal Remedy',
    desc: 'A constitutional remedy selected uniquely for you. Delivered to your door across India.',
  },
  {
    number: '04',
    icon: <RefreshCw size={28} />,
    title: 'Heal & Follow-up',
    desc: 'Regular check-ins track your progress and refine treatment until you are fully healed.',
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef as React.RefObject<Element>, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={cardRef}
      className={`${styles.card} glass-card`}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      {/* Ghost watermark number */}
      <span className={styles.watermarkNum} aria-hidden="true">{step.number}</span>

      {/* Animated ring badge */}
      <div className={styles.ringWrap} aria-hidden="true">
        <svg className={styles.ringsvg} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="var(--clr-sage-lt)" strokeWidth="2" />
          <motion.circle
            cx="24" cy="24" r="20"
            stroke="var(--clr-sage)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={125.6}
            initial={{ strokeDashoffset: 125.6 }}
            animate={inView ? { strokeDashoffset: 31.4 } : {}}
            transition={{ duration: 1, delay: index * 0.15 + 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'center', rotate: -90 }}
          />
        </svg>
        <span className={styles.ringNum}>{step.number}</span>
      </div>

      <div className={styles.icon}>{step.icon}</div>
      <h4 className={styles.title}>{step.title}</h4>
      <p className={styles.desc}>{step.desc}</p>

      {index < steps.length - 1 && (
        <div className={styles.connector} aria-hidden="true" />
      )}
    </motion.div>
  );
}

// Scroll-driven progress line across the 4 cards
function ProgressLine() {
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ['start 80%', 'end 60%'],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={lineRef} className={styles.progressLineWrap} aria-hidden="true">
      <div className={styles.progressLineTrack} />
      <motion.div
        className={styles.progressLineFill}
        style={{ scaleX, transformOrigin: 'left' }}
      />
    </div>
  );
}

export default function ConsultationPathway() {
  return (
    <div className={styles.wrap}>
      <div className={styles.gridWrap}>
        <ProgressLine />
        <div className={styles.grid}>
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>

      <motion.div
        className={styles.cta}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.45 }}
      >
        <Link href="/appointment" className="btn btn-gold btn-lg">
          Start Your Journey →
        </Link>
      </motion.div>
    </div>
  );
}
