#!/usr/bin/env node
/**
 * Resolve every reviewLinks URL in lib/social-proof.ts to the actual Google
 * Maps review it opens, capturing { author, rating, text, relativeTime,
 * authorPhotoUrl }. Joins against scripts/scraped-reviews.json (which already
 * contains the canonical review text per author) when names match, otherwise
 * falls back to whatever is scraped from the page itself.
 *
 * Output: data/curated-reviews.json — a Record<url, ReviewData>.
 *
 * Usage:  node scripts/resolve-share-links.mjs
 *
 * Requires: `npx playwright install chromium` once.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOCIAL_PROOF_PATH = resolve(ROOT, 'lib/social-proof.ts');
const SCRAPED_PATH = resolve(ROOT, 'scripts/scraped-reviews.json');
const OUT_DIR = resolve(ROOT, 'data');
const OUT_PATH = resolve(OUT_DIR, 'curated-reviews.json');

/** Extract every review URL from social-proof.ts via regex. */
function extractReviewLinks(src) {
  const out = new Set();
  // Capture URLs inside reviewLinks: [...] blocks
  const blockRe = /reviewLinks:\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const block = m[1];
    const urlRe = /'(https?:\/\/[^']+)'|"(https?:\/\/[^"]+)"/g;
    let u;
    while ((u = urlRe.exec(block)) !== null) {
      out.add(u[1] || u[2]);
    }
  }
  return [...out];
}

function normalizeName(n) {
  return (n || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

async function scrapeReview(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  // Wait for the review pane to appear. The author name is in a button.
  await page.waitForFunction(() => {
    const txt = document.body.innerText || '';
    return txt.length > 200 && /\d+ (year|month|week|day)s? ago|ago/i.test(txt);
  }, { timeout: 30000 }).catch(() => {});
  return await page.evaluate(() => {
    const text = document.body.innerText || '';
    const finalUrl = location.href;
    return { text, finalUrl };
  });
}

/**
 * Parse the author + rating + text + date out of the page's innerText.
 * The Google Maps review page lays out content like:
 *
 *   Search Google Maps
 *   Dr. Shweta's Homoeopathy
 *   Medical clinic
 *   Utrathiya
 *   PLACE DETAILS
 *
 *   <author>
 *
 *
 *   <stars line>
 *   <relative time>
 *   <review text>
 *   ...
 */
function parseReviewText(raw) {
  const lines = raw.split('\n').map((l) => l.trim());
  // Find the "PLACE DETAILS" anchor line
  const anchor = lines.findIndex((l) => /^PLACE DETAILS$/i.test(l));
  if (anchor === -1) return null;
  // Author is the first non-empty line after PLACE DETAILS
  let i = anchor + 1;
  while (i < lines.length && lines[i] === '') i++;
  const author = lines[i] || '';
  // Find the relative time line (e.g. "4 years ago", "a month ago", "Edited 3 months ago")
  const timeRe = /^(?:Edited\s+)?(?:a|an|\d+)\s+(?:second|minute|hour|day|week|month|year)s?\s+ago$/i;
  let timeIdx = -1;
  for (let j = i + 1; j < lines.length; j++) {
    if (timeRe.test(lines[j])) { timeIdx = j; break; }
  }
  if (timeIdx === -1) return null;
  // Review text is the first non-empty line after the time line, until the
  // next "Share" / "Response from the owner" / blank stretch.
  let textStart = timeIdx + 1;
  while (textStart < lines.length && lines[textStart] === '') textStart++;
  const textLines = [];
  for (let k = textStart; k < lines.length; k++) {
    const ln = lines[k];
    if (/^Share$/i.test(ln) || /^Response from the owner/i.test(ln)) break;
    if (/^\d+$/.test(ln) && k > textStart) continue; // like-count line
    textLines.push(ln);
  }
  // Strip trailing empties/numerals
  while (textLines.length && (textLines[textLines.length - 1] === '' || /^\d+$/.test(textLines[textLines.length - 1]))) {
    textLines.pop();
  }
  const text = textLines.join('\n').trim();
  // Rating: not directly in innerText (icons are images). Default to 5.
  return {
    author,
    relativeTime: lines[timeIdx],
    text,
    rating: 5,
  };
}

async function main() {
  if (!existsSync(SOCIAL_PROOF_PATH)) throw new Error('social-proof.ts not found');
  const src = readFileSync(SOCIAL_PROOF_PATH, 'utf8');
  const urls = extractReviewLinks(src);
  console.log(`Found ${urls.length} review URLs to resolve.`);

  const scraped = JSON.parse(readFileSync(SCRAPED_PATH, 'utf8'));
  const byName = new Map();
  for (const r of scraped) {
    byName.set(normalizeName(r.name), r);
  }

  // Preserve previous output if present so we can incrementally re-run.
  let existing = {};
  if (existsSync(OUT_PATH)) {
    try { existing = JSON.parse(readFileSync(OUT_PATH, 'utf8')); } catch {}
  }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-GB',
  });
  const page = await ctx.newPage();

  const out = { ...existing };
  let i = 0;
  for (const url of urls) {
    i++;
    if (out[url] && out[url].author) {
      console.log(`[${i}/${urls.length}] cached → ${out[url].author}`);
      continue;
    }
    try {
      const { text, finalUrl } = await scrapeReview(page, url);
      const parsed = parseReviewText(text);
      if (!parsed || !parsed.author) {
        console.log(`[${i}/${urls.length}] FAILED to parse: ${url}`);
        out[url] = { error: 'parse_failed', finalUrl };
        continue;
      }
      // Try to enrich with scraped-reviews data (text/rating/photo).
      const matched = byName.get(normalizeName(parsed.author));
      const merged = {
        url,
        finalUrl,
        author: parsed.author,
        relativeTime: parsed.relativeTime,
        rating: matched?.rating ?? parsed.rating ?? 5,
        text: matched?.text || parsed.text,
        authorPhotoUrl: matched?.imageUrl || '',
        clinic: matched?.clinic || '',
        source: matched ? 'joined' : 'scraped',
      };
      out[url] = merged;
      console.log(`[${i}/${urls.length}] ${merged.author} (${merged.source})`);
    } catch (e) {
      console.log(`[${i}/${urls.length}] ERROR ${url}: ${e.message}`);
      out[url] = { error: String(e.message || e) };
    }
  }

  await browser.close();

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${OUT_PATH}`);
  const ok = Object.values(out).filter((v) => v && v.author).length;
  console.log(`${ok}/${urls.length} resolved successfully.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
