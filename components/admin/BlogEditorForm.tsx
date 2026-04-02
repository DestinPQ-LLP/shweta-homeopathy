'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { BlogPost } from '@/lib/blog';
import s from './BlogEditorForm.module.css';

// TinyMCE must only render in the browser
const Editor = dynamic(
  () => import('@tinymce/tinymce-react').then(mod => mod.Editor),
  { ssr: false, loading: () => <div className={s.editorPlaceholder}>Loading editor…</div> }
);

interface Props {
  post?: BlogPost & { htmlContent?: string };
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function BlogEditorForm({ post }: Props) {
  const router = useRouter();
  const isEdit = !!post?.id;
  const slugLocked = useRef(isEdit);

  const [title,       setTitle]       = useState(post?.title       ?? '');
  const [slug,        setSlug]        = useState(post?.slug        ?? '');
  const [excerpt,     setExcerpt]     = useState(post?.excerpt     ?? '');
  const [coverUrl,    setCoverUrl]    = useState(post?.coverImageUrl ?? '');
  const [category,    setCategory]    = useState(post?.category    ?? '');
  const [tags,        setTags]        = useState(post?.tags        ?? '');
  const [author,      setAuthor]      = useState(post?.author      ?? 'Dr. Shweta Goyal');
  const [status,      setStatus]      = useState<'draft'|'published'>(post?.status ?? 'draft');
  const [metaDesc,    setMetaDesc]    = useState(post?.metaDescription ?? '');
  const [htmlContent, setHtmlContent] = useState(post?.htmlContent  ?? '');

  const [coverUploading, setCoverUploading] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [error,  setError]  = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function uploadCoverImage(file: File) {
    setCoverUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'Upload failed'); }
      const data = await res.json();
      setCoverUrl(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Cover image upload failed');
    } finally {
      setCoverUploading(false);
    }
  }

  useEffect(() => {
    if (!slugLocked.current) setSlug(slugify(title));
  }, [title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!htmlContent.trim()) { setError('HTML content is required.'); return; }

    setSaving(true);
    try {
      const body = { title, slug, excerpt, coverImageUrl: coverUrl, category, tags, author, status, metaDescription: metaDesc, htmlContent };
      const res = await fetch(isEdit ? `/api/admin/blog/${post!.id}` : '/api/admin/blog', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Request failed (${res.status})`);
      }
      setSuccess(isEdit ? 'Post updated!' : 'Post created!');
      setTimeout(() => router.push('/admin/blog'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      {error   && <p className={s.errMsg}>{error}</p>}
      {success && <p className={s.successMsg}>{success}</p>}

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Title<span className={s.required}>*</span></label>
          <input className={s.input} value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className={s.field}>
          <label className={s.label}>Slug<span className={s.required}>*</span></label>
          <input className={s.input} value={slug} onChange={e => { slugLocked.current = true; setSlug(e.target.value); }} required />
          <span className={s.hint}>Used in URL: /blog/<strong>{slug || '…'}</strong></span>
        </div>
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Category</label>
          <input className={s.input} value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Wellness, Homeopathy" />
        </div>
        <div className={s.field}>
          <label className={s.label}>Tags</label>
          <input className={s.input} value={tags} onChange={e => setTags(e.target.value)} placeholder="comma-separated" />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Author</label>
          <input className={s.input} value={author} onChange={e => setAuthor(e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Status</label>
          <select className={s.select} value={status} onChange={e => setStatus(e.target.value as 'draft'|'published')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label}>Cover Image</label>
        <div className={s.coverRow}>
          <input className={s.input} value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="Paste URL or upload →" type="url" style={{ flex: 1 }} />
          <button type="button" className="btn btn-ghost" disabled={coverUploading} onClick={() => coverFileRef.current?.click()} style={{ whiteSpace: 'nowrap' }}>
            {coverUploading ? <span className={s.spinner} /> : '⬆ Upload'}
          </button>
          <input ref={coverFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadCoverImage(f); }} />
        </div>
        {coverUrl && <img src={coverUrl} alt="cover preview" className={s.coverPreview} />}
      </div>

      <div className={s.field}>
        <label className={s.label}>Excerpt</label>
        <textarea className={s.textarea} style={{ minHeight: '80px' }} value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} />
      </div>

      <div className={s.field}>
        <label className={s.label}>Meta Description</label>
        <input className={s.input} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} maxLength={160} />
        <span className={s.hint}>{metaDesc.length}/160 characters</span>
      </div>

      <div className={s.field}>
        <label className={s.label}>Content<span className={s.required}>*</span></label>
        <div className={s.editorWrap}>
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
            value={htmlContent}
            onEditorChange={(content: string) => setHtmlContent(content)}
            init={{
              height: 520,
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'table', 'help', 'wordcount',
              ],
              toolbar:
                'undo redo | blocks | bold italic underline | forecolor backcolor | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | link image table | code fullscreen | help',
              content_style:
                "body { font-family: Inter, sans-serif; font-size: 16px; color: #1a2e1c; line-height: 1.8; }",
              branding: false,
            }}
          />
        </div>
        <span className={s.hint}>Rich text is saved to Google Docs and displayed on the public blog.</span>
      </div>

      <div className={s.actions}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className={s.spinner} /> : (isEdit ? 'Save Changes' : 'Create Post')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => router.push('/admin/blog')} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
