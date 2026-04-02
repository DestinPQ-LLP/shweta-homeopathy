'use client';
import { MessageCircle } from 'lucide-react';
import type { LandingConfig } from '@/lib/landing';
import styles from './AdsHero.module.css';

interface Props {
  config: LandingConfig;
}

function buildWhatsAppUrl(number: string, message: string) {
  const clean = number.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export default function AdsHero({ config }: Props) {
  const waUrl = buildWhatsAppUrl(config.whatsapp_number, config.whatsapp_message);

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
            {config.video_url.includes('youtube.com') || config.video_url.includes('youtu.be') ? (
              <iframe
                className={styles.videoEmbed}
                src={getYouTubeEmbedUrl(config.video_url)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Dr. Shweta — Introduction"
              />
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
          <span className={styles.badge}>✅ 10,000+ Patients Treated</span>
          <span className={styles.badge}>✅ 15+ Years Experience</span>
          <span className={styles.badge}>✅ Zero Side Effects</span>
        </div>
      </div>
    </section>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}
