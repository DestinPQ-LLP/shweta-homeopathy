import csv, subprocess, json, re, os, shutil

COOKIE = '/tmp/shweta_cookies.txt'
BASE   = 'http://localhost:4000'
CSV    = 'public/blog_posts.csv'
BLOG_DIR  = 'public/photos/blog'
WP_UPLOADS = '/Applications/MAMP/htdocs/old/wp-content/uploads'

subprocess.run(['curl','-s','-c',COOKIE,'-X','POST',f'{BASE}/api/admin/auth',
    '-H','Content-Type: application/json','-d','{"password":"admin1234"}'],capture_output=True)
print("Logged in\n")

with open(CSV, newline='', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

ok = fail = 0
for row in rows:
    title   = row['Title'].strip().strip('"')
    slug    = row['Slug'].strip()
    content = row['Content (Plain)'][:2000].strip()
    cat     = (row['Categories'] or 'Healthcare').split('|')[0].strip()
    raw_img = row['Featured Image'].strip()

    # Resolve cover image
    cover = ''
    if raw_img and not raw_img.endswith('.pdf'):
        bname = os.path.basename(raw_img)
        safe  = re.sub(r'[^a-zA-Z0-9._-]','_', bname)
        safe  = re.sub(r'_+','_', safe)
        dest  = os.path.join(BLOG_DIR, safe)
        src   = os.path.join(WP_UPLOADS, raw_img)
        if not os.path.exists(dest) and os.path.exists(src):
            os.makedirs(BLOG_DIR, exist_ok=True)
            shutil.copy2(src, dest)
        if os.path.exists(dest):
            cover = f'/photos/blog/{safe}'

    html    = '<p>' + content.replace('\t',' ').replace('\n','</p><p>') + '</p>'
    excerpt = content[:200].replace('\t',' ').replace('\n',' ')

    payload = json.dumps({
        'title': title, 'slug': slug, 'excerpt': excerpt,
        'htmlContent': html, 'coverImageUrl': cover,
        'category': cat, 'tags': 'Homoeopathy',
        'author': 'Dr. Shweta Goyal', 'status': 'published',
        'metaDescription': excerpt[:160],
    })

    res = subprocess.run(['curl','-s','-b',COOKIE,'-X','POST',f'{BASE}/api/admin/blog',
        '-H','Content-Type: application/json','-d',payload],capture_output=True,text=True)
    try:
        resp = json.loads(res.stdout)
        if 'post' in resp or 'id' in resp:
            print(f"  OK   {title[:70]}"); ok += 1
        else:
            print(f"  FAIL {title[:55]}: {res.stdout[:90]}"); fail += 1
    except:
        print(f"  PARSE ERR: {res.stdout[:90]}"); fail += 1

print(f"\n{ok} OK, {fail} failed")
