"""
scrape-and-import-all-reviews.py
- Headlessly scrapes Google Maps reviews for BOTH clinic locations
- Merges + dedupes
- Writes scripts/scraped-reviews.json
- Imports new ones into the Testimonials Google Sheet (Google-layout columns A:J)

Requires: playwright (`python3 -m playwright install chromium`)
"""
import json, os, re, time, random, subprocess, sys
from playwright.sync_api import sync_playwright

CLINICS = [
    {"clinic": "Zirakpur",  "query": "Dr. Shweta's Homoeopathy Zirakpur"},
    {"clinic": "Budhlada",  "query": "Dr. Shweta's Homoeopathy Budhlada"},
]
OUT_FILE = "scripts/scraped-reviews.json"

def pause(a=0.4, b=0.9):
    time.sleep(random.uniform(a, b))

def scroll_panel(page):
    page.evaluate("""
        () => {
            const candidates = [
                document.querySelector('.m6QErb.DxyBCb.kA9KIf'),
                document.querySelector('.m6QErb[tabindex="-1"]'),
                document.querySelector('.m6QErb.DxyBCb'),
                document.querySelector('.m6QErb'),
            ].filter(Boolean);
            if (candidates[0]) candidates[0].scrollBy(0, 1200);
            else window.scrollBy(0, 1200);
        }
    """)

def scrape_clinic(p, query, clinic):
    print(f"\n=== {clinic} ===")
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
    )
    ctx = browser.new_context(
        viewport={"width": 1400, "height": 900},
        locale="en-US",
        timezone_id="Asia/Kolkata",
        user_agent=("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/121.0.6167.184 Safari/537.36"),
    )
    page = ctx.new_page()
    page.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined})")

    try:
        page.goto(f"https://www.google.com/maps/search/{query.replace(' ', '+')}",
                  wait_until="domcontentloaded", timeout=60000)
        pause(2, 4)

        for sel in ["button:has-text('Accept all')", "button:has-text('Agree')"]:
            try: page.click(sel, timeout=2000); pause(0.5, 1); break
            except: pass

        try: page.click(".Nv2PK:first-child", timeout=6000)
        except:
            try: page.click("a[href*='/maps/place/']", timeout=6000)
            except: pass
        pause(2, 4)

        clicked = False
        for sel in [
            "button[aria-label*='Reviews']",
            "[role='tab']:has-text('Reviews')",
            "button:has-text('Reviews')",
        ]:
            try:
                page.click(sel, timeout=4000); clicked = True; pause(2, 3); break
            except: pass

        if not clicked and "/place/" in page.url:
            page.goto(page.url.split('?')[0].rstrip('/') + "/reviews",
                      wait_until="domcontentloaded", timeout=30000)
            pause(2, 4)

        # Sort by Newest
        try:
            page.click("[aria-label='Sort reviews'], button:has-text('Sort')", timeout=3000)
            pause(0.4, 0.8)
            page.click("li:has-text('Newest'), [data-index='1']", timeout=3000)
            pause(1.5, 2.5)
        except: pass

        # Scroll until exhausted
        last, streak = 0, 0
        for _ in range(300):
            n = len(page.query_selector_all(".jftiEf, [data-review-id]"))
            if n > last:
                print(f"  loaded: {n}")
                last, streak = n, 0
            else:
                streak += 1
                if streak >= 10: break
            scroll_panel(page)
            pause(0.5, 0.9)

        # Expand "More"
        for btn in page.query_selector_all("button.w8nwRe, button[jsaction*='expandReview']"):
            try: btn.click(); pause(0.02, 0.06)
            except: pass
        pause(1, 1.5)

        raw = page.evaluate("""
            () => {
                const out = [];
                const seen = new Set();
                const blocks = [...new Set([
                    ...document.querySelectorAll('.jftiEf'),
                    ...document.querySelectorAll('[data-review-id]'),
                ])];
                for (const b of blocks) {
                    const name = (b.querySelector('.d4r55')?.innerText
                               || b.querySelector('.kvMYJc')?.innerText || '').trim();
                    let rating = 5;
                    const rEl = b.querySelector('[aria-label*="star"]');
                    if (rEl) {
                        const m = (rEl.getAttribute('aria-label')||'').match(/(\\d)/);
                        if (m) rating = +m[1];
                    }
                    const text = (b.querySelector('.wiI7pd')?.innerText
                               || b.querySelector('span[jscontroller]')?.innerText || '').trim();
                    const date = (b.querySelector('.rsqaWe')?.innerText || '').trim();
                    const img = b.querySelector('img.NBa7we, img[src*="googleusercontent"]');
                    const imageUrl = img ? img.src : '';
                    const key = name + '|' + text.slice(0, 40);
                    if (!seen.has(key) && name) {
                        seen.add(key);
                        out.push({ name, rating, text, date, imageUrl });
                    }
                }
                return out;
            }
        """)
        print(f"  scraped: {len(raw)}")
        for r in raw: r["clinic"] = clinic
        return raw
    finally:
        browser.close()

def main():
    all_reviews = []
    seen = set()
    with sync_playwright() as p:
        for c in CLINICS:
            try:
                got = scrape_clinic(p, c["query"], c["clinic"])
                for r in got:
                    k = (r["name"].lower().strip(), (r["text"] or "")[:40].lower().strip())
                    if k in seen: continue
                    seen.add(k)
                    all_reviews.append(r)
            except Exception as e:
                print(f"  ERROR {c['clinic']}: {e}")

    print(f"\nTOTAL unique: {len(all_reviews)}")
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_reviews, f, ensure_ascii=False, indent=2)
    print(f"saved -> {OUT_FILE}")

if __name__ == "__main__":
    main()
