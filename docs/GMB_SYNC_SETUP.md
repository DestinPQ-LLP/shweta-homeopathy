# GMB Live Sync — Setup Guide

The site can pull live Google Business Profile (GMB) reviews into the **Testimonials**
sheet automatically once daily, plus on-demand from the admin dashboard.

## 1. Get a Google Places API key

1. Open Google Cloud Console → your project (`hyderabad-police-…` or a fresh one).
2. **APIs & Services → Library →** enable **Places API (New)**.
3. **APIs & Services → Credentials → Create credentials → API key.**
4. (Recommended) Restrict it: API restrictions → only Places API (New); Application
   restrictions → HTTP referrers (none) since this runs server-side.

## 2. Get the two Place IDs

For each clinic listing on Google Maps:

1. Open the clinic listing on Maps.
2. Use the [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
   to get the `ChIJ…` ID.

## 3. Set environment variables (Vercel → Project → Settings → Environment Variables)

```
GOOGLE_PLACES_API_KEY=AIzaSy...
GOOGLE_PLACE_ID_ZIRAKPUR=ChIJxxxxxxxxxxxxxxxx
GOOGLE_PLACE_ID_BUDHLADA=ChIJyyyyyyyyyyyyyyyy
CRON_SECRET=<random-32-char-string>   # used to authorise the daily sync
```

Mirror the same in `.env` for local dev.

## 4. The sync endpoint

`POST /api/admin/gmb-sync` (also accepts `GET` for cron)

Auth modes:
- Logged-in admin (Bearer JWT from the admin dashboard) — manual trigger.
- `Authorization: Bearer <CRON_SECRET>` — Vercel cron (set automatically).
- `x-cron-secret: <CRON_SECRET>` header or `?secret=<CRON_SECRET>` query — fallback.

Behaviour:
- Fetches up to 5 most-relevant reviews per clinic from Places API (New).
- De-duplicates against existing testimonials by `name + text`.
- Appends new ones to the **Testimonials** sheet with `status = draft` so the admin
  can review/publish.

## 5. Daily cron

`vercel.json` already declares a daily cron at **21:30 UTC = 03:00 IST**:

```json
{ "crons": [{ "path": "/api/admin/gmb-sync", "schedule": "30 21 * * *" }] }
```

After the next deploy, Vercel will register and run it automatically.

## 6. "Leave a Review" CTA

`SocialProofRating.tsx` and `GoogleReviewWidget.tsx` accept a `reviewsUrl` prop.
Default format:

```
https://search.google.com/local/writereview?placeid=PLACE_ID
```

Pass each clinic's real Place ID where the widget is rendered, e.g.:

```tsx
<SocialProofRating
  reviewsUrl={`https://search.google.com/local/writereview?placeid=${process.env.NEXT_PUBLIC_PLACE_ID_ZIRAKPUR}`}
/>
```

(Or expose a public version of the Place ID env var with the `NEXT_PUBLIC_` prefix.)
