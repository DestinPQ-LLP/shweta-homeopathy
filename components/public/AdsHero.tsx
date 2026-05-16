'use client';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { LandingConfig } from '@/lib/landing';
import styles from './AdsHero.module.css';

interface Props {
  config: LandingConfig;
}

function buildWhatsAppUrl(number: string, message: string) {
  const clean = number.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

function parseYouTubeId(url: string): string | null {
  // Supports: youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>, /shorts/<id>, /live/<id>
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function YouTubePlayer({ id }: { id: string }) {
  const [playing, setPlaying] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  // hqdefault is universally available; maxresdefault often 404s.
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  if (playing) {
    return (
      <>
        <iframe
          className={styles.videoEmbed}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Dr. Shweta — Introduction"
        />
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.videoFallbackLink}
        >
          Video not playing? Watch on YouTube ↗
        </a>
      </>
    );
  }

  return (
    <button
      type="button"
      className={styles.videoPoster}
      onClick={() => setPlaying(true)}
      style={{ backgroundImage: `url(${thumb})` }}
      aria-label="Play introduction video"
    >
      <span className={styles.videoPlayBtn} aria-hidden="true">▶</span>
    </button>
  );
}

export default function AdsHero({ config }: Props) {
  const waUrl = buildWhatsAppUrl(config.whatsapp_number, config.whatsapp_message);
  const ytId = config.video_url ? parseYouTubeId(config.video_url) : null;

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Logo / Brand mark */}
        <div className={styles.brand}>
          <span className={styles.logoMark}>𓆸</span>
          <span className={styles.brandName}>Dr. Shweta Goyal</span>
          <span className={styles.brandCreds}>BHMS · MD (Hom) · PG IACH Greece</span>
        </div>

        {/* Headline */}
        <h1 className={styles.headline}>{config.headline}</h1>
        <p className={styles.subheadline}>{config.subheadline}</p>

        {/* Video */}
        {config.video_url ? (
          <div className={styles.videoWrap}>
            {ytId ? (
              <YouTubePlayer id={ytId} />
            ) : (
              <video className={styles.videoEmbed} controls playsInline>
                <source src={config.video_url} />
              </video>
            )}
          </div>
        ) : (
          <div className={styles.videoPlaceholder}>
            <span className={styles.videoPlaceholderIcon}>▶</span>
            <p>Video coming soon</p>
          </div>
        )}

        {/* CTA */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaBtn}
        >
          <MessageCircle size={22} />
          {config.cta_text}
        </a>

        {/* Trust badges */}
        <div className={styles.badges}>
          <span className={styles.badge}>✅ 15,000+ Patients Treated</span>
          <span className={styles.badge}>✅ 6+ Years Experience</span>
          <span className={styles.badge}>✅ Zero Side Effects</span>
        </div>
      </div>
    </section>
  );
}
