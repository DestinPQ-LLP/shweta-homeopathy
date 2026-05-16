#!/usr/bin/env node
/**
 * Parse new-services.md (delimited by `---- END -----`) into a structured
 * JSON keyed by condition slug. Each entry contains:
 *   { name, tagline, metaTitle, metaDescription, intro, symptoms[],
 *     howHomeopathyHelps, expectations[{phase, title, body}], faqs[{q, a}] }
 *
 * Output: data/services-content.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');
const SRC = resolve(ROOT, 'new-services.md');
const OUT = resolve(ROOT, 'data/services-content.json');

/** Canonical name → slug map (matches existing STATIC_CONDITIONS slugs). */
const SLUG_MAP = {
  'Cancer Supportive Care':       'cancer-supportive-care',
  "Women's Health":               'womens-health',
  'Diabetes Mellitus':            'diabetes-mellitus',
  'Geriatric Disorders':          'geriatric-disorders',
  'Depression & Anxiety':         'depression-anxiety',
  'Gastrointestinal Disorders':   'gastrointestinal-disorders',
  'Pediatric Diseases':           'pediatric-diseases',
  'Skin Diseases':                'skin-diseases',
  'Respiratory Diseases':         'respiratory-diseases',
  'Thyroid Disorders':            'thyroid-disorders',
  'Alopecia & Hair Loss':         'alopecia-hair-loss',
  'Autoimmune Disorders':         'autoimmune-disorders',
  'Migraine':                     'migraine',
  'Joint Problems & Arthritis':   'joint-problems-arthritis',
};

/** Known all-caps category lines that may precede the service name. */
const CATEGORIES = new Set([
  'SUPPORTIVE CARE', "WOMEN'S HEALTH", 'LIFESTYLE', 'CHRONIC CARE',
  'PEDIATRIC', 'SKIN', 'RESPIRATORY',
]);

/** Normalised section markers. */
const SECTION_ALIASES = {
  OVERVIEW: 'overview',
  'COMMON SYMPTOMS': 'symptoms',
  'COMMON SYMPTOMS & CONDITIONS TREATED': 'symptoms',
  'TYPES OF MIGRAINE TREATED': 'symptoms',
  'HOW HOMEOPATHY HELPS': 'help',
  'KEY PRINCIPLES OF TREATMENT': 'principles',
  'WHAT TO EXPECT': 'expect',
  'WHAT TO EXPECT  HEALING TIMELINE': 'expect',
  'WHAT TO EXPECT HEALING TIMELINE': 'expect',
  'PREPARE FOR YOUR VISIT': 'prepare',
  'FREQUENTLY ASKED QUESTIONS': 'faqs',
  'PATIENT STORIES': 'stories',
  'SEO META DATA': 'seo',
};

/** Returns the section key for a line, or null. */
function detectSection(line) {
  // Strip leading/trailing dashes, em-dashes, dots, whitespace, digits+dot.
  const stripped = line
    .replace(/^\s*[—–\-]+\s*/, '')
    .replace(/\s*[—–\-]+\s*$/, '')
    .replace(/^\s*\d+\.\s*/, '')
    .replace(/[—–]/g, ' ')
    .trim()
    .toUpperCase()
    .replace(/[:.]+$/, '')
    .replace(/\s{2,}/g, ' ');
  return SECTION_ALIASES[stripped] ?? null;
}

/** Split file into per-service blocks.
 *  Some blocks in the source omit the `---- END -----` delimiter between
 *  consecutive services (e.g. Cancer Supportive Care → Joint Problems).
 *  After splitting on the explicit delimiter, we further split each chunk on
 *  occurrences of known service names appearing at the start of a line. */
function splitBlocks(text) {
  const primary = text
    .split(/^----\s*END\s*-----\s*$/m)
    .map((b) => b.trim())
    .filter(Boolean);

  const knownNames = Object.keys(SLUG_MAP);
  const namePattern = new RegExp(
    `^(?:${knownNames
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})\\s*$`,
    'm',
  );

  const out = [];
  for (const block of primary) {
    const lines = block.split('\n');
    const boundaries = [];
    for (let i = 0; i < lines.length; i++) {
      if (namePattern.test(lines[i])) boundaries.push(i);
    }
    if (boundaries.length <= 1) {
      out.push(block);
      continue;
    }
    // For each boundary, also pull in the immediately preceding category line
    // (single all-caps short line) if present.
    for (let b = 0; b < boundaries.length; b++) {
      let start = boundaries[b];
      const prev = lines[start - 1]?.trim();
      if (prev && CATEGORIES.has(prev.toUpperCase())) start -= 1;
      const end = b + 1 < boundaries.length
        ? (CATEGORIES.has((lines[boundaries[b + 1] - 1] ?? '').trim().toUpperCase())
            ? boundaries[b + 1] - 1
            : boundaries[b + 1])
        : lines.length;
      out.push(lines.slice(start, end).join('\n').trim());
    }
  }
  return out.filter(Boolean);
}

/** Parse the leading "header" portion of a block into { category, name, tagline }. */
function parseHeader(headerLines) {
  // First non-empty line that isn't a category, the next non-empty is tagline.
  const lines = headerLines.map((l) => l.trim()).filter(Boolean);
  let i = 0;
  let category;
  if (lines[i] && CATEGORIES.has(lines[i].toUpperCase())) {
    category = lines[i];
    i++;
  }
  const name = lines[i] ?? '';
  const tagline = lines[i + 1] ?? '';
  return { category, name, tagline };
}

/** Split a block into sections. Returns { header: [...lines], sections: { key: [...lines] } }. */
function splitSections(block) {
  const lines = block.split('\n');
  const sections = {};
  const headerLines = [];
  let current = null;
  for (const rawLine of lines) {
    const sec = detectSection(rawLine);
    if (sec) {
      current = sec;
      if (!sections[current]) sections[current] = [];
      continue;
    }
    if (current === null) {
      headerLines.push(rawLine);
    } else {
      sections[current].push(rawLine);
    }
  }
  return { headerLines, sections };
}

/** Trim leading/trailing blank lines from an array. */
function trimBlanks(lines) {
  let s = 0;
  let e = lines.length;
  while (s < e && !lines[s].trim()) s++;
  while (e > s && !lines[e - 1].trim()) e--;
  return lines.slice(s, e);
}

/** Strip surrounding straight or curly double quotes. */
function unquote(s) {
  return s.replace(/^["“”]\s*/, '').replace(/\s*["“”]$/, '').trim();
}

/** Group lines into paragraphs separated by blank lines. */
function toParagraphs(lines) {
  const out = [];
  let cur = [];
  for (const line of lines) {
    if (line.trim()) {
      cur.push(line.trim());
    } else if (cur.length) {
      out.push(cur.join(' '));
      cur = [];
    }
  }
  if (cur.length) out.push(cur.join(' '));
  return out.map(unquote).filter(Boolean);
}

/** Treat every non-blank line as its own paragraph. Source uses long unwrapped
 *  sentences as paragraphs without blank-line separators. */
function toLineParagraphs(lines) {
  return (lines || [])
    .map((l) => l.trim())
    .filter(Boolean)
    .map(unquote);
}

/** Extract Meta Title / Meta Description from the SEO section. */
function parseSeo(lines) {
  const text = (lines || []).join('\n');
  const title = text.match(/Meta\s*Title\s*:\s*(.+)/i)?.[1]?.trim() ?? '';
  const desc  = text.match(/Meta\s*Description\s*:\s*(.+)/i)?.[1]?.trim() ?? '';
  return { metaTitle: title, metaDescription: desc };
}

/** Parse the overview section: skip leading sub-heading, return joined paragraphs. */
function parseOverview(lines) {
  const trimmed = trimBlanks(lines || []);
  // Drop a leading "Overview" sub-heading if present.
  if (trimmed[0] && /^overview$/i.test(trimmed[0].trim())) {
    trimmed.shift();
  }
  // Drop a leading single-line poetic sub-heading (e.g. "Your immune system is
  // not your enemy — it has simply lost its way.") that opens migraine /
  // autoimmune blocks. Keep it actually — it sets the tone.
  const paras = toLineParagraphs(trimmed);
  return paras.join('\n\n');
}

/** Parse symptoms: collect bullet-like single-sentence lines. */
function parseSymptoms(lines) {
  const trimmed = trimBlanks(lines || []).map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (const line of trimmed) {
    // Skip headings, intro/closing paragraphs, "Symptom tags:" labels.
    if (/^(common symptoms|symptom tags|recognising your migraine pattern|constitutional homeopathic care|homeopathic treatment is offered|autoimmune conditions treated|common symptoms across|homeopathic supportive care|constitutional homeopathy for)/i.test(line)) continue;
    if (line.endsWith(':')) continue;
    if (/^if you/i.test(line)) continue;
    if (line.startsWith('"') || line.startsWith('“')) continue;
    // Strip leading bullets / dashes.
    const cleaned = line
      .replace(/^[-•▸·*]\s*/, '')
      .replace(/^\d+\.\s*/, '')
      .trim();
    if (!cleaned) continue;
    // Drop full-sentence intro/closing paragraphs (they end in a period AND
    // are clearly descriptive prose, not bullet points).
    if (cleaned.length > 140 && /[.!]$/.test(cleaned)) continue;
    if (cleaned.length > 220) continue;
    out.push(cleaned);
  }
  return out;
}

/** Parse "How Homeopathy Helps" body + optional principles. Returns joined text. */
function parseHelp(helpLines, principleLines) {
  const helpTrim = trimBlanks(helpLines || []);
  // Drop alopecia-style label prefixes.
  while (helpTrim[0] && /^(section heading|main treatment block|three supporting callout cards|card \d|how constitutional homeopathy treats|constitutional homeopathy for|why homeopathy)/i.test(helpTrim[0].trim())) {
    helpTrim.shift();
  }
  const helpParas = toLineParagraphs(helpTrim);

  const principleParas = [];
  const pTrim = trimBlanks(principleLines || []);
  if (pTrim.length) {
    // Each principle: a short title line then a body paragraph (or two).
    // Convert to "Title — body" paragraphs.
    let i = 0;
    while (i < pTrim.length) {
      const line = pTrim[i].trim();
      if (!line) { i++; continue; }
      // Strip leading bullet/icon.
      const titleRaw = line.replace(/^[▸•\-*·]\s*/, '').trim();
      const bodyLines = [];
      i++;
      while (i < pTrim.length && pTrim[i].trim() && !/^[▸•\-*·]/.test(pTrim[i])) {
        bodyLines.push(pTrim[i].trim());
        i++;
      }
      // Skip blank separator.
      while (i < pTrim.length && !pTrim[i].trim()) i++;
      if (titleRaw && bodyLines.length) {
        principleParas.push(`${titleRaw} — ${bodyLines.join(' ')}`);
      } else if (titleRaw) {
        principleParas.push(titleRaw);
      }
    }
  }
  return [...helpParas, ...principleParas].join('\n\n');
}

/** Parse "What to Expect" timeline → [{ phase, title, body }]. */
function parseExpectations(lines) {
  const trimmed = trimBlanks(lines || []);
  // Drop leading description paragraph (lines until first stage marker).
  const stages = [];
  let current = null;
  // A stage starts with: "1. ..." or "Stage 1 — ..." or "1.  Week 1–2  — Title"
  const stageRe = /^(?:Stage\s+)?(\d+)\.?\s*[\u2014\u2013\-]?\s*(.+)$/i;
  for (const raw of trimmed) {
    const line = raw.trim();
    if (!line) continue;
    if (/^section\s*intro/i.test(line)) continue;
    const m = line.match(stageRe);
    // Only treat as a stage header if the line contains an em/en-dash separator
    // (e.g. "1. Week 1–2 — Early Response"), or starts with "Stage N —".
    const looksLikeStage = m && /[\u2014\u2013]/.test(line) && /Week|Month|Day/i.test(line);
    if (looksLikeStage) {
      if (current) stages.push(current);
      // Split on first em/en-dash after the phase, or fallback to colon.
      const tail = m[2];
      let phase = tail;
      let title = '';
      const dashIdx = tail.search(/\s[\u2014\u2013]\s/);
      if (dashIdx > -1) {
        phase = tail.slice(0, dashIdx).trim();
        title = tail.slice(dashIdx + 3).trim();
      } else {
        const colonIdx = tail.indexOf(':');
        if (colonIdx > -1) {
          phase = tail.slice(0, colonIdx).trim();
          title = tail.slice(colonIdx + 1).trim();
        }
      }
      current = { phase, title, body: '' };
    } else if (current) {
      current.body = current.body ? `${current.body} ${unquote(line)}` : unquote(line);
    }
  }
  if (current) stages.push(current);
  return stages
    .map((s) => ({ phase: s.phase.trim(), title: s.title.trim(), body: s.body.trim() }))
    .filter((s) => s.phase && s.body);
}

/** Parse FAQs → [{ q, a }]. */
function parseFaqs(lines) {
  const trimmed = trimBlanks(lines || []);
  const faqs = [];
  let current = null;
  // Q-marker may be "Q1:", "Q1 :", "Q1.  ", "Q1  : "
  const qRe = /^Q\s*\d+\s*[:.]\s*(.+)$/i;
  for (const raw of trimmed) {
    const line = raw.trim();
    if (!line) continue;
    if (/^questions?\s+(patients|migraine)/i.test(line)) continue;
    const m = line.match(qRe);
    if (m) {
      if (current) faqs.push(current);
      current = { q: unquote(m[1].trim()), a: '' };
    } else if (current) {
      current.a = current.a
        ? `${current.a} ${unquote(line)}`
        : unquote(line);
    }
  }
  if (current) faqs.push(current);
  return faqs.filter((f) => f.q && f.a);
}

/** Special handling for the Alopecia block which uses numbered sub-headings. */
function parseAlopeciaBlock(block) {
  // Inject ALL-CAPS markers so the generic parser handles it.
  const replaced = block
    .replace(/^1\.\s*Overview\s*$/m, 'OVERVIEW')
    .replace(/^2\.\s*Common Symptoms\s*$/m, 'COMMON SYMPTOMS')
    .replace(/^3\.\s*How Homeopathy Helps.*$/m, 'HOW HOMEOPATHY HELPS')
    .replace(/^4\.\s*What to Expect.*$/m, 'WHAT TO EXPECT')
    .replace(/^5\.\s*FAQs.*$/m, 'FREQUENTLY ASKED QUESTIONS')
    .replace(/^Meta Title & Description.*$/m, 'SEO META DATA');
  return replaced;
}

function parseBlock(rawBlock) {
  // Hand-tag the Alopecia block format.
  const block = /^\s*1\.\s*Overview\s*$/m.test(rawBlock)
    ? parseAlopeciaBlock(rawBlock)
    : rawBlock;

  const { headerLines, sections } = splitSections(block);
  const { name, tagline } = parseHeader(headerLines);
  const slug = SLUG_MAP[name];
  if (!slug) return null;

  const { metaTitle, metaDescription } = parseSeo(sections.seo);
  const intro = parseOverview(sections.overview);
  const symptoms = parseSymptoms(sections.symptoms);
  const howHomeopathyHelps = parseHelp(sections.help, sections.principles);
  const expectations = parseExpectations(sections.expect);
  const faqs = parseFaqs(sections.faqs);

  return [slug, {
    slug,
    name,
    tagline,
    metaTitle,
    metaDescription,
    intro,
    symptoms,
    howHomeopathyHelps,
    expectations,
    faqs,
  }];
}

function main() {
  const raw = readFileSync(SRC, 'utf8');
  const blocks = splitBlocks(raw);
  const out = {};
  const skipped = [];
  for (const b of blocks) {
    const parsed = parseBlock(b);
    if (!parsed) {
      // Capture first line to help debugging.
      const first = b.split('\n').find((l) => l.trim()) ?? '';
      skipped.push(first);
      continue;
    }
    const [slug, data] = parsed;
    out[slug] = data;
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote ${Object.keys(out).length} services → ${OUT}`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} block(s):`);
    for (const s of skipped) console.log('  -', s);
  }
  // Quick sanity report.
  for (const [slug, d] of Object.entries(out)) {
    console.log(
      `  ${slug.padEnd(32)} symptoms=${d.symptoms.length.toString().padStart(2)} faqs=${d.faqs.length} stages=${d.expectations.length}`,
    );
  }
}

main();
