/**
 * Google Places API helper — fetch live reviews & ratings for the clinic GMB profiles.
 *
 * Uses the Places API (New) `places.get` endpoint with an API key.
 * https://developers.google.com/maps/documentation/places/web-service/place-details
 *
 * Required env vars:
 *   GOOGLE_PLACES_API_KEY              — Google Cloud API key with "Places API (New)" enabled.
 *   GOOGLE_PLACE_ID_ZIRAKPUR           — Place ID for the Zirakpur clinic GMB listing.
 *   GOOGLE_PLACE_ID_BUDHLADA           — Place ID for the Budhlada clinic GMB listing.
 *
 * To find a Place ID:
 *   https://developers.google.com/maps/documentation/places/web-service/place-id
 */

export interface PlaceReview {
  authorName: string;
  authorPhotoUrl: string;
  rating: number;          // 1–5
  relativeTime: string;    // e.g. "2 weeks ago"
  publishTime: string;     // ISO timestamp
  text: string;            // localized review text
  language?: string;
}

export interface PlaceSummary {
  placeId: string;
  displayName: string;
  rating: number | null;          // average rating
  userRatingCount: number | null; // total review count
  reviews: PlaceReview[];         // up to 5 most-relevant reviews from the API
}

/** Mask of fields requested from the Places API. Keeping it minimal lowers cost. */
const FIELD_MASK = [
  'id',
  'displayName',
  'rating',
  'userRatingCount',
  'reviews.authorAttribution',
  'reviews.rating',
  'reviews.relativePublishTimeDescription',
  'reviews.publishTime',
  'reviews.text',
  'reviews.originalText',
].join(',');

/** Fetch a single place's summary + recent reviews. */
export async function fetchPlaceSummary(placeId: string): Promise<PlaceSummary> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY is not set');
  if (!placeId) throw new Error('placeId is required');

  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
      'Accept-Language': 'en',
    },
    // Cache for an hour at the edge so we never hammer the Places API
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Places API ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    id?: string;
    displayName?: { text?: string };
    rating?: number;
    userRatingCount?: number;
    reviews?: Array<{
      authorAttribution?: { displayName?: string; photoUri?: string };
      rating?: number;
      relativePublishTimeDescription?: string;
      publishTime?: string;
      text?: { text?: string; languageCode?: string };
      originalText?: { text?: string; languageCode?: string };
    }>;
  };

  return {
    placeId: data.id || placeId,
    displayName: data.displayName?.text || '',
    rating: typeof data.rating === 'number' ? data.rating : null,
    userRatingCount: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
    reviews: (data.reviews || []).map((r) => ({
      authorName: r.authorAttribution?.displayName || 'Anonymous',
      authorPhotoUrl: r.authorAttribution?.photoUri || '',
      rating: r.rating || 5,
      relativeTime: r.relativePublishTimeDescription || '',
      publishTime: r.publishTime || '',
      text: r.text?.text || r.originalText?.text || '',
      language: r.text?.languageCode || r.originalText?.languageCode,
    })),
  };
}

/** Fetch both clinics. Each call is independent so a failure on one doesn't kill the other. */
export async function fetchAllClinics(): Promise<{
  zirakpur: PlaceSummary | null;
  budhlada: PlaceSummary | null;
  errors: string[];
}> {
  const errors: string[] = [];
  const zid = process.env.GOOGLE_PLACE_ID_ZIRAKPUR || '';
  const bid = process.env.GOOGLE_PLACE_ID_BUDHLADA || '';

  const [zRes, bRes] = await Promise.allSettled([
    zid ? fetchPlaceSummary(zid) : Promise.reject(new Error('GOOGLE_PLACE_ID_ZIRAKPUR not set')),
    bid ? fetchPlaceSummary(bid) : Promise.reject(new Error('GOOGLE_PLACE_ID_BUDHLADA not set')),
  ]);

  const zirakpur = zRes.status === 'fulfilled' ? zRes.value : null;
  const budhlada = bRes.status === 'fulfilled' ? bRes.value : null;
  if (zRes.status === 'rejected') errors.push(`zirakpur: ${(zRes.reason as Error).message}`);
  if (bRes.status === 'rejected') errors.push(`budhlada: ${(bRes.reason as Error).message}`);

  return { zirakpur, budhlada, errors };
}
