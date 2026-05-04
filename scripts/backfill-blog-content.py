"""
backfill-blog-content.py

Reads public/blog_posts.csv, fetches existing blogs from the API,
and PUTs the full HTML content into any blog whose content field is empty.
"""
import csv, json, os, re, subprocess, sys

COOKIE = '/tmp/shweta_cookies.txt'
CSV    = 'public/blog_posts.csv'

# Load .env.local / .env
def _load_env(*paths):
    for p in paths:
        if os.path.exists(p):
            with open(p) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        os.environ.setdefault(k.strip(), v.strip())

_root = os.path.join(os.path.dirname(__file__), '..')
_load_env(os.path.join(_root, '.env.local'), os.path.join(_root, '.env'))
BASE = os.environ.get('NEXT_PUBLIC_BASE_URL', 'http://localhost:4000')

# Auth
r = subprocess.run(
    ['curl', '-s', '-c', COOKIE, '-X', 'POST', f'{BASE}/api/admin/auth',
     '-H', 'Content-Type: application/json', '-d', '{"password":"admin1234"}'],
    capture_output=True, text=True
)
print("Auth:", r.stdout.strip())

# Fetch existing blogs
r = subprocess.run(
    ['curl', '-s', '-b', COOKIE, f'{BASE}/api/admin/blog'],
    capture_output=True, text=True
)
try:
    existing = {p['slug']: p for p in json.loads(r.stdout).get('posts', [])}
    print(f"Found {len(existing)} existing blogs in sheet\n")
except Exception as e:
    print("Failed to fetch blogs:", r.stdout[:200])
    sys.exit(1)

# Read CSV
with open(os.path.join(_root, CSV), newline='', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

ok = skip = fail = 0
for row in rows:
    slug    = row['Slug'].strip()
    post    = existing.get(slug)
    if not post:
        print(f"  SKIP (not in sheet) {slug[:60]}")
        skip += 1
        continue

    # Uncomment to skip already-filled posts:
    # if post.get('content', '').strip():
    #     print(f"  SKIP (already has content) {slug[:60]}")
    #     skip += 1
    #     continue

    raw     = row['Content (Plain)'].strip()
    # Convert plain text with \t bullets and \n paragraphs into HTML
    paragraphs = raw.split('\n')
    html_parts = []
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if p.startswith('\t') or p.startswith('\\t'):
            p = p.lstrip('\t').lstrip('\\t').strip()
            html_parts.append(f'<li>{p}</li>')
        else:
            # Close any open list before adding paragraph
            html_parts.append(f'<p>{p}</p>')
    html = '\n'.join(html_parts)

    payload = json.dumps({'htmlContent': html})
    res = subprocess.run(
        ['curl', '-s', '-b', COOKIE, '-X', 'PUT',
         f'{BASE}/api/admin/blog/{post["id"]}',
         '-H', 'Content-Type: application/json', '-d', payload],
        capture_output=True, text=True
    )
    try:
        resp = json.loads(res.stdout)
        if 'post' in resp:
            print(f"  OK   {slug[:70]}")
            ok += 1
        else:
            print(f"  FAIL {slug[:55]}: {res.stdout[:120]}")
            fail += 1
    except:
        print(f"  PARSE ERR: {res.stdout[:120]}")
        fail += 1

print(f"\n{ok} updated, {skip} skipped, {fail} failed")
