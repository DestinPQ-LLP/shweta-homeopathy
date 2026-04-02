'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion, useScroll, useTransform,
  useMotionValue, useSpring, animate
} from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowRight, Calendar, CheckCircle, Star, HeartPulse, Award } from 'lucide-react';
import styles from './HomeHero.module.css';

/* ═══════════════════════════════════════
   PARTICLE CANVAS — organic field
   ═══════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const N = 90;
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    type P = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; phase: number; speed: number;
      gold: boolean;
    };

    const particles: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 2 + 0.6,
      alpha: Math.random() * 0.5 + 0.12,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.012 + 0.006,
      gold: Math.random() < 0.12,
    }));

    const LINK_DIST = 160;
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 1;

      // Draw connecting lines first
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].gold
              ? `rgba(198,158,56,${alpha})`
              : `rgba(70,150,190,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        // Organic float
        p.x += p.vx + Math.sin(t * p.speed + p.phase) * 0.18;
        p.y += p.vy + Math.cos(t * p.speed + p.phase) * 0.14;

        // Wrap
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // Pulse alpha
        const pulse = p.alpha * (0.7 + 0.3 * Math.sin(t * p.speed * 2 + p.phase));

        const color = p.gold ? `rgba(198,158,56,${pulse})` : `rgba(70,150,190,${pulse})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        if (p.r > 1.6) {
          ctx.shadowColor = p.gold ? 'rgba(198,158,56,0.6)' : 'rgba(70,150,190,0.6)';
          ctx.shadowBlur  = 6;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}

/* ═══════════════════════════════════════
   MORPHING BLOB — SVG organic shape
   ═══════════════════════════════════════ */
const BLOBS = [
  'M60,30 C80,10 100,20 110,50 C120,80 90,110 60,105 C30,100 10,70 15,45 C20,20 40,50 60,30Z',
  'M65,25 C90,5 115,25 115,55 C115,85 85,110 55,108 C25,106 5,75 10,48 C15,21 40,45 65,25Z',
  'M55,28 C78,5 108,18 112,50 C116,82 88,115 60,110 C32,105 8,78 12,46 C16,14 32,51 55,28Z',
  'M62,22 C85,2 112,22 112,52 C112,82 82,112 55,110 C28,108 6,78 10,49 C14,20 39,42 62,22Z',
];

function MorphBlob({ className }: { className: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    let idx = 0;
    function morph() {
      idx = (idx + 1) % BLOBS.length;
      if (pathRef.current) {
        pathRef.current.style.transition = 'd 3.5s ease-in-out';
        (pathRef.current as SVGPathElement & { d: string }).d = BLOBS[idx];
        pathRef.current.setAttribute('d', BLOBS[idx]);
      }
    }
    const id = setInterval(morph, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="blobGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="hsl(198,60%,30%)" stopOpacity="0.55" />
          <stop offset="60%"  stopColor="hsl(198,50%,20%)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="hsl(198,50%,14%)" stopOpacity="0"    />
        </radialGradient>
        <filter id="blobBlur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <path
        ref={pathRef}
        d={BLOBS[0]}
        fill="url(#blobGrad)"
        filter="url(#blobBlur)"
        style={{ transition: 'd 3.5s ease-in-out' }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════
   SCRAMBLE TEXT HOOK — kinetic titles
   ═══════════════════════════════════════ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function useScramble(final: string, delay = 0) {
  const [display, setDisplay] = useState(' '.repeat(final.length));
  useEffect(() => {
    let frame = 0;
    const maxFrames = final.length * 4 + 20;
    const start     = delay * 60;

    const raf = requestAnimationFrame(function tick() {
      frame++;
      if (frame < start) { requestAnimationFrame(tick); return; }
      const elapsed = frame - start;
      const pct = Math.min(1, elapsed / maxFrames);
      const revealed = Math.floor(pct * final.length);
      let out = '';
      for (let i = 0; i < final.length; i++) {
        if (i < revealed) {
          out += final[i];
        } else if (i === revealed) {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          out += Math.random() < 0.3 ? CHARS[Math.floor(Math.random() * CHARS.length)] : ' ';
        }
      }
      setDisplay(out);
      if (revealed < final.length) requestAnimationFrame(tick);
      else setDisplay(final);
    });
    return () => cancelAnimationFrame(raf);
  }, [final, delay]);
  return display;
}

/* ═══════════════════════════════════════
   COUNTER — animated number count-up
   ═══════════════════════════════════════ */
function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctrl = animate(0, to, {
      duration: 2.0,
      delay: 1.5,
      ease: [0.36, 0, 0.18, 1],
      onUpdate(v) { setVal(Math.round(v)); },
    });
    return ctrl.stop;
  }, [to]);

  return <span ref={nodeRef}>{val.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════
   MAGNETIC cursor effect on card
   ═══════════════════════════════════════ */
function useMagneticTilt() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 180, damping: 24 });
  const rY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 180, damping: 24 });

  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  }, [mx, my]);

  const onLeave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);
  return { rX, rY, onMove, onLeave };
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
interface Stat { number: string; label: string; }
interface Props { stats: Stat[]; }

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HomeHero({ stats }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });

  const bgY    = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const card1Y = useTransform(scrollYProgress, [0, 1], ['0px', '-80px']);
  const card2Y = useTransform(scrollYProgress, [0, 1], ['0px', '-110px']);
  const card3Y = useTransform(scrollYProgress, [0, 1], ['0px', '-50px']);
  const card4Y = useTransform(scrollYProgress, [0, 1], ['0px', '-65px']);

  const { rX, rY, onMove, onLeave } = useMagneticTilt();

  // Scramble headline lines
  const line1 = useScramble('Where Science', 0.3);
  const line2 = useScramble('Meets Nature.', 0.9);

  return (
    <section className={styles.hero} ref={sectionRef}>
      {/* ── Canvas particle field ── */}
      <ParticleCanvas />

      {/* ── Morphing blobs ── */}
      <motion.div className={styles.blobWrap1} style={{ y: bgY }}>
        <MorphBlob className={styles.blob} />
      </motion.div>
      <motion.div className={styles.blobWrap2}>
        <MorphBlob className={styles.blob} />
      </motion.div>

      {/* ── Ambient glows ── */}
      <div className={styles.glow1} aria-hidden="true" />
      <div className={styles.glow2} aria-hidden="true" />

      {/* ── Horizontal scan line ── */}
      <div className={styles.scanLine} aria-hidden="true" />

      {/* ════════ MAIN LAYOUT ════════ */}
      <div className={styles.inner}>

        {/* ── LEFT: content ── */}
        <div className={styles.left}>

          {/* Badge */}
          <motion.div
            className={styles.badge}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y:   0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className={styles.badgeDot} />
            Accepting New Patients · Est. 2009
          </motion.div>

          {/* Scramble headline */}
          <div className={styles.headlineWrap} aria-label="Where Science Meets Nature.">
            <div className={styles.line1}>
              <span className={styles.h1}>{line1}</span>
            </div>
            <div className={styles.line2}>
              <span className={`${styles.h1} ${styles.h1Gold}`}>{line2}</span>
            </div>
          </div>

          {/* Descriptor */}
          <motion.p
            className={styles.desc}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.4, ease: EASE }}
          >
            Expert homeopathic care for chronic & complex conditions —
            rooted in classical principles, backed by 15+ years of practice.
          </motion.p>

          {/* Pill credentials */}
          <motion.div
            className={styles.pills}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6, ease: EASE }}
          >
            {['BHMS Gold Medalist', 'MD (Homeopathy)', 'PG · IACH Greece'].map(t => (
              <span key={t} className={styles.pill}>{t}</span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className={styles.ctaRow}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8, ease: EASE }}
          >
            <Link href="/appointment" className={styles.ctaPrimary} id="hero-book-btn">
              <Calendar size={16} />
              Book Free Consultation
            </Link>
            <Link href="/about" className={styles.ctaGhost}>
              Our Story <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Animated stats */}
          <motion.div
            className={styles.statsRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.0 }}
          >
            {[
              { to: 10000, suffix: '+', label: 'Patients Healed' },
              { to: 15,    suffix: '+', label: 'Years Experience' },
              { to: 98,    suffix: '%', label: 'Patient Satisfaction' },
            ].map((s, i) => (
              <div key={s.label} className={styles.statCell}>
                <span className={styles.statNum}>
                  <AnimatedCounter to={s.to} suffix={s.suffix} />
                </span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: photo + floating panels ── */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.2 }}
        >
          {/* Photo with 3D magnetic tilt */}
          <motion.div
            className={styles.photoWrap}
            style={{ y: photoY, rotateX: rX, rotateY: rY, transformPerspective: 1100 }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            {/* Glow ring behind photo */}
            <div className={styles.photoGlowRing} aria-hidden="true" />

            <div className={styles.photoFrame}>
              <Image
                src="/Clinic Pictures/IMG-20240615-WA0219.jpg"
                alt="Dr. Shweta Goyal — Classical Homeopath"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
              />
              {/* Cinematic vignette inside photo */}
              <div className={styles.photoVignette} aria-hidden="true" />
            </div>

            {/* Inline name strip */}
            <motion.div
              className={styles.nameStrip}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y:  0 }}
              transition={{ delay: 1.2, duration: 0.65, ease: EASE }}
            >
              <div className={styles.nameStripAvatar}>
                <Image
                  src="/Clinic Pictures/IMG-20240615-WA0219.jpg"
                  alt="" width={40} height={40}
                  style={{ objectFit: 'cover', objectPosition: 'center top', borderRadius: '50%', width: '40px', height: '40px', maxWidth: 'none' }}
                />
              </div>
              <div>
                <p className={styles.nameStripTitle}>Dr. Shweta Goyal</p>
                <p className={styles.nameStripSub}>Classical Homeopath · Zirakpur</p>
              </div>
              <div className={styles.nameStripStatus}>
                <span className={styles.nameDot} /> Available Now
              </div>
            </motion.div>
          </motion.div>

          {/* ── Floating panels — cinematic parallax ── */}

          {/* Panel 1: Patients — top-left */}
          <motion.div
            className={`${styles.panel} ${styles.panelGreen}`}
            style={{ y: card1Y }}
            initial={{ opacity: 0, x: -40, scale: 0.88, rotate: -4 }}
            animate={{ opacity: 1, x:   0, scale: 1.00, rotate:  0 }}
            transition={{ delay: 1.4, duration: 0.8, ease: EASE }}
          >
            <CheckCircle size={20} className={styles.panelIcon} />
            <div>
              <p className={styles.panelBig}>10,000+</p>
              <p className={styles.panelSub}>Patients Healed</p>
            </div>
          </motion.div>

          {/* Panel 2: Rating — top-right */}
          <motion.div
            className={`${styles.panel} ${styles.panelGold}`}
            style={{ y: card2Y }}
            initial={{ opacity: 0, x: 40, scale: 0.88, rotate: 4 }}
            animate={{ opacity: 1, x:  0, scale: 1.00, rotate: 0 }}
            transition={{ delay: 1.6, duration: 0.8, ease: EASE }}
          >
            <Star size={20} className={styles.panelIcon} fill="currentColor" />
            <div>
              <p className={styles.panelBig}>4.9 ★</p>
              <p className={styles.panelSub}>Google Rating</p>
            </div>
          </motion.div>

          {/* Panel 3: Award — bottom right */}
          <motion.div
            className={`${styles.panel} ${styles.panelWhite}`}
            style={{ y: card3Y }}
            initial={{ opacity: 0, y: 40, scale: 0.88 }}
            animate={{ opacity: 1, y:  0, scale: 1.00 }}
            transition={{ delay: 1.8, duration: 0.8, ease: EASE }}
          >
            <Award size={20} className={styles.panelIcon} />
            <div>
              <p className={styles.panelBig}>Gold Medalist</p>
              <p className={styles.panelSub}>Panjab University</p>
            </div>
          </motion.div>

          {/* Panel 4: Experience — bottom left */}
          <motion.div
            className={`${styles.panel} ${styles.panelDark}`}
            style={{ y: card4Y }}
            initial={{ opacity: 0, x: -40, scale: 0.88, rotate: -3 }}
            animate={{ opacity: 1, x:   0, scale: 1.00, rotate:  0 }}
            transition={{ delay: 2.0, duration: 0.8, ease: EASE }}
          >
            <HeartPulse size={20} className={styles.panelIcon} />
            <div>
              <p className={styles.panelBig}>15+ Yrs</p>
              <p className={styles.panelSub}>Clinical Practice</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        aria-hidden="true"
      >
        <div className={styles.scrollLine} />
        <span className={styles.scrollLabel}>Scroll</span>
      </motion.div>
    </section>
  );
}
