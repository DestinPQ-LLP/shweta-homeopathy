import { Star } from 'lucide-react';
import styles from './GoogleReviewWidget.module.css';

interface Props {
  /**
   * Replace with actual Google Business Place ID when available.
   * e.g. "ChIJxxxxxxxxxxxx"
   * To find it: Google Maps → Search clinic → share/embed → extract Place ID.
   */
  placeId?: string;
  reviewCount?: number;
  rating?: number;
  reviewsUrl?: string;
}

const STAR = 'S';
const EMPTY_STAR = 'E';

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) =>
        i < Math.floor(rating) ? STAR : EMPTY_STAR
      )}
    </span>
  );
}

export default function GoogleReviewWidget({
  placeId,   // ← REPLACE with actual Place ID when client provides it
  reviewCount = 200,
  rating = 4.9,
  reviewsUrl = 'https://g.page/r/PLACE_ID/review', // ← REPLACE with actual Google review URL
}: Props) {
  return (
    <aside className={styles.wrapper}>
      <div className={styles.inner}>
        {/* Google logo */}
        <div className={styles.logoWrap} aria-label="Google">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>

        <div className={styles.content}>
          <div className={styles.ratingRow}>
            <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
            <Stars rating={rating} />
          </div>
          <p className={styles.reviewCount}>
            Based on <strong>{reviewCount}+</strong> Google reviews
          </p>
        </div>

        <a
          href={reviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
          aria-label="Leave a Google review"
        >
          Leave a Review
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </a>
      </div>

      {/* Hidden data attribute for future dynamic fetch */}
      {placeId && <div data-place-id={placeId} aria-hidden="true" style={{ display: 'none' }} />}
    </aside>
  );
}
