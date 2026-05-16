'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Video } from 'lucide-react';
import styles from './VideoSection.module.css';

interface Props {
  /**
   * YouTube or Vimeo embed URL.
   * REPLACE THIS WITH ACTUAL URL WHEN CLIENT PROVIDES THE VIDEO.
   * YouTube format: https://www.youtube.com/embed/VIDEO_ID?rel=0&modestbranding=1
   * Vimeo format:   https://player.vimeo.com/video/VIDEO_ID
   */
  videoUrl?: string;
  posterSrc?: string;
}

/** Extract the YouTube video ID from any embed/watch URL. */
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

export default function VideoSection({
  videoUrl = 'https://www.youtube.com/embed/o0eDGGu9OXE?si=-jKYTlElBxciycBq&rel=0&modestbranding=1',
  posterSrc,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const ytId = getYouTubeId(videoUrl);
  const [posterErrored, setPosterErrored] = useState(false);
  const resolvedPoster =
    posterSrc ||
    (ytId
      ? posterErrored
        ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
        : `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`
      : '/images/clinic_ai_interior.png');

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.textCol}>
            <span className="section-badge">In Her Own Words</span>
            <h2 className={styles.heading}>Meet Dr. Shweta Goyal</h2>
            <div className="divider" />
            <p className={styles.desc}>
              Watch Dr. Shweta share her philosophy on classical homeopathy, her approach to
              individualized treatment, and why she believes in treating the whole person —
              not just the disease.
            </p>
            <ul className={styles.points}>
              <li>
                <span className={styles.pointIcon}>
                  <Image src="/images/logo.webp" alt="Dr. Shweta's Homoeopathy" width={20} height={20} style={{ objectFit: 'contain' }} />
                </span>
                <span>6+ years of clinical experience in classical homeopathy</span>
              </li>
              <li>
                <span className={styles.pointIcon}>🎯</span>
                <span>Trained at IACH Greece — the world&apos;s top classical homeopathy institute</span>
              </li>
              <li>
                <span className={styles.pointIcon}>💚</span>
                <span>Online consultations with doorstep medicine delivery worldwide</span>
              </li>
            </ul>
          </div>

          <div className={styles.videoCol}>
            <div className={styles.videoWrap}>
              {!playing ? (
                <div className={styles.poster}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvedPoster}
                    alt="Meet Dr. Shweta Goyal video"
                    className={styles.posterImg}
                    onError={() => setPosterErrored(true)}
                  />
                  <div className={styles.posterOverlay} />
                  <button
                    className={styles.playBtn}
                    onClick={() => setPlaying(true)}
                    aria-label="Play Meet the Doctor video"
                  >
                    <span className={styles.playIcon}>▶</span>
                    <span className={styles.playLabel}>Watch Video</span>
                  </button>
                  <div className={styles.posterBadge}>
                    <Video size={16} className={styles.metaIcon} /> <span>60–90 sec · Meet the Doctor</span>
                  </div>
                </div>
              ) : (
                <iframe
                  className={styles.iframe}
                  src={`${videoUrl}&autoplay=1&mute=0`}
                  title="Meet Dr. Shweta Goyal"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
