I studied both references and translated them into a build direction for Antigravity.

What I could confirm:
Dr Akanksha’s site has a clear trust-first pattern: strong hero section, credibility stats, testimonials, credentials, service cards, CTA-driven booking flow, and FAQs. It also currently shows Zoho SalesIQ and routes CTAs to Zoho Bookings, which you explicitly want removed in the new build. ([drakanksha.com][1])

Dr Shweta’s site appears positioned around specialty-led care and SEO content. The indexed pages emphasize chronic illness, women’s health, pediatric conditions, and disease-specific content, and the site has a blog focused on natural healing and patient success stories. Some pages are bot-protected, so I’m using indexed search snippets as the reliable reference rather than pretending I fully crawled the site. ([drshwetahomoeopathy.com][2])

For your build stack, Google Antigravity is designed as an agent-first development platform with an editor plus a manager surface for autonomous tasks. Vercel now officially supports NestJS on Vercel Functions, and Vercel Functions are suited to I/O-heavy AI/API workflows. OpenAI’s current API supports image/file input for vision-style extraction, and Google’s APIs cover Drive, Sheets, Docs, Gmail, and server-side OAuth flows. ([Google Developers Blog][3])

Below are Antigravity-ready prompts in the order I’d use them.

## 1) Master project prompt

```text
Build a production-grade medical/doctor website and admin system using ONLY:

- Next.js App Router frontend
- NestJS backend
- TypeScript everywhere
- Vercel deployment only
- Google Workspace as the primary persistence/integration layer
- OpenAI API for handwriting OCR from uploaded doctor notes

Hard constraints:
1. Use heavy SSR across all public pages for SEO, trust, and fast first-load rendering.
2. Do NOT use Zoho Bookings.
3. Do NOT use Zoho SalesIQ.
4. Do NOT add any Zoho dependency, script, widget, SDK, webhook, or fallback.
5. All files must be a maximum of 200 lines each. Refactor aggressively into modules if needed.
6. Use NestJS only for backend logic. No Express custom backend outside NestJS.
7. Deployment target is Vercel only. Make the NestJS backend Vercel-compatible.
8. Prefer Google Drive, Google Sheets, Google Docs, and Gmail for storage and workflows.
9. Do not introduce a traditional CMS unless absolutely required. Prefer Google-backed content workflows.
10. Keep code clean, typed, modular, and enterprise-readable.

Reference direction:
- Visual/content inspiration should combine:
  a) the trust-first, clean, professional structure of drakanksha.com
  b) the specialty-led, SEO-rich medical content strategy seen on drshwetahomoeopathy.com
- The new product must feel premium, trustworthy, medically professional, calm, and conversion-focused.

Product goals:
- Public doctor website with strong SEO and SSR
- Appointment/contact/enquiry workflows without Zoho
- Blog system with admin publishing
- Google Sheets logging for leads, forms, and key operational data
- Google Drive storage for uploads and media
- Gmail-based outbound email notifications
- Doctor session note upload flow:
  handwritten image/PDF upload -> OpenAI OCR extraction -> review/edit screen -> save final notes into Google Docs -> fetchable later by the doctor

Before coding:
1. Generate the full architecture.
2. Generate the route map.
3. Generate the module map.
4. Generate the data flow for each Google integration.
5. Generate the environment variable list.
6. Generate a file/folder plan that keeps every file under 200 lines.
7. Identify Vercel/runtime constraints and design around them.
8. Then start implementation in small, reviewable steps.
```

## 2) Architecture prompt

```text
Design the architecture for this project.

Requirements:
- Frontend: Next.js App Router, SSR-first
- Backend: NestJS, Vercel-compatible
- Hosting: Vercel only
- Storage/workflow:
  - Google Sheets for form submissions, lead logs, blog metadata, and operational tracking
  - Google Drive for images, uploaded assets, documents, and note attachments
  - Google Docs for finalized session notes
  - Gmail API for transactional emails
- AI:
  - OpenAI API for OCR / handwriting-to-text extraction from doctor-uploaded images or PDFs

Public site requirements:
- Home
- About doctor
- Services / conditions treated
- Blog listing
- Blog detail
- Testimonials
- FAQ
- Contact / appointment request
- Optional city/location pages for SEO
- Privacy policy / terms

Admin requirements:
- Secure admin login
- Dashboard
- Blog CRUD
- Media uploader to Google Drive
- Lead viewer / export
- Session notes dashboard
- OCR review queue
- Google Doc link management
- Settings for email templates and spreadsheet IDs

Important:
- No Zoho Bookings
- No Zoho SalesIQ
- No client-heavy rendering unless required
- Prefer server components wherever possible
- Keep each file under 200 lines

Deliverables:
1. High-level architecture
2. Module diagram
3. Request lifecycle for public forms
4. Request lifecycle for OCR note flow
5. Auth strategy
6. Error handling strategy
7. Logging/audit strategy
8. Recommended folder structure
9. Sequence plan for implementation
```

## 3) Public website UI + content prompt

```text
Build the public website UX and content architecture.

Use these reference principles:
- From drakanksha.com:
  - clean hero
  - strong trust signals
  - credentials section
  - service cards
  - testimonials
  - FAQ
  - conversion CTAs
- From drshwetahomoeopathy.com:
  - specialty-led condition pages
  - SEO-rich educational blog strategy
  - condition clusters for discoverability

Design goals:
- calm, premium, trustworthy medical aesthetic
- not generic SaaS
- not flashy
- accessible and mobile-first
- conversion-focused
- SEO-friendly
- SSR-friendly

Build these pages:
1. Homepage
2. About doctor
3. Services
4. Conditions treated
5. Blog index
6. Blog detail
7. Testimonials
8. FAQ
9. Contact / appointment request
10. Thank-you pages
11. Policy pages

Homepage sections:
- Hero with credibility and clear CTA
- Doctor intro and credentials
- Conditions / specialties grid
- Why choose this doctor
- Testimonials
- Process / what to expect
- FAQs
- Final CTA

Technical rules:
- Use Next.js server components by default
- SSR all content-heavy pages
- Add metadata generation per page
- Add schema markup where relevant
- Optimize for Core Web Vitals
- All files under 200 lines

First output:
- site map
- section-by-section content plan
- component inventory
- SEO metadata plan
- schema markup plan
- then generate pages
```

## 4) Google Workspace integration prompt

```text
Implement all Google Workspace integrations through NestJS services.

Required integrations:
1. Google Sheets
   - store contact form submissions
   - store appointment requests
   - store newsletter/blog lead captures
   - store blog metadata
   - store OCR job metadata
2. Google Drive
   - store uploaded files/images
   - store blog cover images
   - store doctor note source files
3. Google Docs
   - create finalized session notes as Google Docs
   - update note content after doctor review
   - fetch note metadata and links later
4. Gmail API
   - send admin notifications
   - send patient acknowledgement emails
   - send doctor workflow alerts

Requirements:
- Use proper server-side OAuth flows where needed
- Centralize Google auth/token handling
- Make all integrations production-safe for Vercel
- Add retries for transient API failures
- Add audit logs
- Validate file types and size
- Keep all secrets server-side only

Design the app so Google Workspace is the primary system of record for:
- enquiries
- uploaded assets
- blog metadata
- session notes metadata

Need:
- GoogleModule in NestJS
- separate services for Drive, Sheets, Docs, Gmail
- DTOs, validation, error handling
- env var contract
- admin settings storage strategy
- each file under 200 lines
```

## 5) No-Zoho appointment flow prompt

```text
Replace Zoho Bookings entirely with a custom appointment request workflow.

Requirements:
- Public appointment request form on website
- SSR page
- validated input
- anti-spam protection
- on submission:
  1. save request to Google Sheets
  2. optionally create/upload related attachment to Google Drive
  3. send admin notification via Gmail
  4. send acknowledgement email to patient
- optional status tracking in admin
- optional manual scheduling flow handled by doctor/admin later

Important:
- This is NOT calendar auto-booking initially
- Do NOT use Zoho Bookings
- Do NOT embed any third-party booking widget
- Keep the system simple, reliable, and Google-backed

Deliver:
1. UX flow
2. form fields
3. NestJS API design
4. Google Sheets schema
5. email templates
6. thank-you flow
7. admin review flow
8. implementation code
All files must remain under 200 lines.
```

## 6) Blog admin prompt

```text
Build a secure blog admin system.

Requirements:
- Admin login
- Blog list
- Create blog
- Edit blog
- Draft / published states
- Slug management
- SEO title / meta description / canonical
- cover image upload to Google Drive
- blog content storage strategy compatible with SSR
- blog metadata stored in Google Sheets
- published content retrievable efficiently for public SSR pages
- category/tag support
- author support
- related posts logic
- preview mode

Recommended content model:
- store blog body as structured markdown or HTML-compatible content
- store media in Google Drive
- store metadata in Google Sheets
- generate SSR pages from NestJS content APIs

Important:
- The blog must be SEO-strong
- The blog system must support condition-based medical education content
- Avoid bulky CMS dependence
- Keep every file under 200 lines

Deliver:
1. auth flow
2. data model
3. admin route map
4. content storage strategy
5. SSR fetching strategy
6. implementation sequence
7. code
```

## 7) OCR + session notes prompt

```text
Build the doctor session-notes workflow using OpenAI API + Google Docs.

Primary user story:
The doctor uploads a handwritten note image or PDF.
The system extracts text using OpenAI OCR/vision.
The doctor reviews and edits the extracted text.
The approved final version is saved into Google Docs as session notes.
The note is later searchable/fetchable from admin.

Required workflow:
1. Upload note file from admin
2. Save original source file to Google Drive
3. Create OCR job record in Google Sheets
4. Send file to OpenAI API for text extraction
5. Return extracted text to admin review UI
6. Doctor edits and approves
7. Create or update Google Doc with final notes
8. Save Google Doc ID/link + metadata in Google Sheets
9. Allow later retrieval by patient name/date/case ID

Requirements:
- Handle image and PDF input
- Add confidence/fallback messaging because handwriting OCR can be imperfect
- Never auto-finalize without doctor review
- Preserve original uploaded file in Drive
- Keep strong audit trail
- Include patient-safe naming conventions
- Build for Vercel-compatible execution
- All files under 200 lines

Needed outputs:
1. OCR module design
2. DTOs
3. OpenAI service wrapper
4. prompt for extraction
5. review UI
6. Google Docs creation/update logic
7. metadata search strategy
8. error/fallback flow
```

## 8) Exact OCR extraction prompt for the OpenAI service

```text
Implement the OpenAI extraction layer for handwritten doctor notes.

Goal:
Extract clean structured text from uploaded handwritten medical notes while preserving meaning and uncertainty.

Rules for extraction:
- prioritize faithful transcription over guessing
- preserve line breaks where useful
- mark uncertain words clearly using [unclear: ...]
- do not invent diagnoses, medicines, or dosages
- separate extracted text into:
  1. raw transcription
  2. cleaned clinical note draft
  3. flagged uncertain items
- output strict JSON

Target JSON:
{
  "raw_transcription": "...",
  "cleaned_note": "...",
  "uncertain_items": [
    {
      "text": "...",
      "reason": "illegible handwriting"
    }
  ]
}

Implementation requirements:
- NestJS service wrapper
- support image and PDF/file inputs
- input validation
- retry policy
- timeout handling
- structured logging
- unit-testable parser
- all files under 200 lines

Do not build image generation.
Do not do diagnosis inference.
Do not autofill missing content.
```

## 9) SSR implementation prompt

```text
Refactor the project for SSR-first rendering.

Rules:
- Public pages must render server-side wherever feasible
- Use server components by default
- Use client components only for clearly interactive admin or upload flows
- Metadata must be dynamic and generated server-side
- Blog detail pages must be SSR
- Condition pages must be SSR
- Contact and appointment pages should still render quickly and be SEO-ready
- Use caching/revalidation intentionally
- Keep hydration light

Need:
1. SSR strategy by route
2. data fetching map
3. caching/revalidation policy
4. structured metadata generation
5. schema.org integration
6. performance optimization plan
7. implementation

Keep every file under 200 lines.
```

## 10) Vercel deployment prompt

```text
Prepare this monorepo for Vercel-only deployment.

Stack:
- Next.js frontend
- NestJS backend
- TypeScript
- Google APIs
- OpenAI API

Requirements:
- Vercel-compatible build setup
- environment variable documentation
- separation of public vs server-only env vars
- production-safe API routing
- logging strategy suitable for Vercel
- graceful handling of function/runtime constraints
- health endpoint
- error monitoring hooks
- secure webhook/callback handling if needed
- CI-friendly scripts

Important:
- Do not assume traditional long-running server processes
- Design backend handlers to work cleanly on Vercel
- Keep files under 200 lines
- Generate deploy checklist and post-deploy verification steps
```

## 11) Code quality enforcement prompt

```text
Apply strict code governance to the entire project.

Non-negotiable rules:
- every file max 200 lines
- TypeScript strict mode
- no any unless justified
- modular services
- DTO validation for all write endpoints
- no duplicated business logic
- no giant components
- no giant controllers
- no giant services
- clear naming
- reusable UI primitives
- reusable Google integration wrappers
- reusable OpenAI wrapper
- central error format
- central logging utility
- central env validation
- testable architecture

Tasks:
1. scan project for violations
2. split oversized files
3. normalize naming
4. improve folder structure
5. add lint/format rules
6. add pre-commit or CI checks if suitable
7. produce a final architecture compliance report
```

## 12) One-shot super prompt

If you want Antigravity to start with a single large mission first, use this:

```text
Build a production-ready doctor website and admin platform inspired by the trust-first structure of drakanksha.com and the specialty/SEO medical content approach of drshwetahomoeopathy.com.

Tech constraints:
- Next.js App Router
- NestJS only
- TypeScript
- Vercel only
- SSR-heavy public site
- Google Drive + Google Sheets + Google Docs + Gmail as the core integration layer
- OpenAI API for OCR of uploaded handwritten doctor notes
- no Zoho Bookings
- no Zoho SalesIQ
- every file max 200 lines

Main features:
- premium medical website
- SEO-ready specialty pages
- blog with admin CRUD
- custom appointment request flow
- Google Sheets logging
- Google Drive media/file storage
- Gmail transactional email flow
- session note upload -> OpenAI OCR -> review -> save to Google Docs -> fetch later in admin

Start by producing:
1. architecture
2. route map
3. module map
4. storage strategy
5. Google integration plan
6. auth plan
7. SSR plan
8. deployment plan
9. file structure that guarantees max 200 lines per file

Then implement incrementally in reviewable steps.
```

My recommendation: start with prompt 1, then 2, then 4, then 7, then 6, then 3, then 9, then 10, then 11.

One practical note: because handwriting OCR can be imperfect, keep the review-and-approve step mandatory before anything is written to Google Docs. OpenAI’s API supports image and file inputs, but the product should treat OCR as assisted drafting, not blind finalization. ([OpenAI Platform][4])

If you want, I can next turn these into:

1. a single polished PRD prompt for Antigravity, or
2. a full folder/module blueprint for the project.

[1]: https://drakanksha.com/ "Dr. Akanksha Agarwal - Licensed Psychologist"
[2]: https://drshwetahomoeopathy.com/?utm_source=chatgpt.com "Dr Shweta's Homoeopathy – Best Homeopath Zirakpur ..."
[3]: https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/ "
            
            Build with Google Antigravity, our new agentic development platform
            
            
            \- Google Developers Blog
            
        "
[4]: https://platform.openai.com/docs/api-reference/responses?ref=chris.sotherden.io&utm_source=chatgpt.com "Responses | OpenAI API Reference"
