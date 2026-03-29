// Blog metadata — Google Sheets backed, content stored in Google Docs
import { appendToSheet, readSheet, updateSheetRow } from '@/lib/google/sheets';
import { createBlogDoc, updateBlogDoc } from '@/lib/google/docs';
import { randomUUID } from 'crypto';

const SHEET_ID = () => process.env.GOOGLE_SHEETS_BLOG_ID || '';
const RANGE_POSTS = 'Blogs!A:N';
const HEADERS = ['id','title','slug','excerpt','coverImageUrl','category','tags','author','publishedDate','updatedDate','status','metaDescription','docId','docUrl'];

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  category: string;
  tags: string;
  author: string;
  publishedDate: string;
  updatedDate: string;
  status: 'draft' | 'published';
  metaDescription: string;
  docId: string;
  docUrl: string;
}

// Ensure the Posts sheet has a header row (idempotent: only appends if sheet is empty)
export async function initBlogSheet(): Promise<void> {
  const rows = await readSheet(SHEET_ID(), RANGE_POSTS);
  if (!rows || rows.length === 0) {
    await appendToSheet(SHEET_ID(), RANGE_POSTS, [HEADERS]); // creates "Blogs" tab on first run
  }
}

function rowToPost(row: string[]): BlogPost {
  return {
    id:             row[0] || '',
    title:          row[1] || '',
    slug:           row[2] || '',
    excerpt:        row[3] || '',
    coverImageUrl:  row[4] || '',
    category:       row[5] || '',
    tags:           row[6] || '',
    author:         row[7] || 'Dr. Shweta Goyal',
    publishedDate:  row[8] || '',
    updatedDate:    row[9] || '',
    status:         (row[10] as 'draft' | 'published') || 'draft',
    metaDescription: row[11] || '',
    docId:          row[12] || '',
    docUrl:         row[13] || '',
  };
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const rows = await readSheet(SHEET_ID(), RANGE_POSTS);
  if (!rows || rows.length < 2) return [];
  return rows.slice(1).map(rowToPost).filter((p) => p.id);
}

export async function getLatestBlogs(n: number): Promise<BlogPost[]> {
  const all = await getAllBlogs();
  return all
    .filter((p) => p.status === 'published')
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
    .slice(0, n);
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const all = await getAllBlogs();
  return all.find((p) => p.slug === slug && p.status === 'published') || null;
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  const all = await getAllBlogs();
  return all.find((p) => p.id === id) || null;
}

export async function createBlog(data: {
  title: string; slug: string; excerpt: string; coverImageUrl: string;
  category: string; tags: string; author: string; status: 'draft' | 'published';
  metaDescription: string; htmlContent: string;
}): Promise<BlogPost> {
  await initBlogSheet();
  let docId = '', docUrl = '';
  try {
    const doc = await createBlogDoc({ title: data.title, htmlContent: data.htmlContent });
    docId = doc.docId; docUrl = doc.url;
  } catch (e) {
    console.warn('createBlogDoc failed (SA quota?), continuing without doc link:', (e as Error).message);
  }
  const now = new Date().toISOString().split('T')[0];
  const post: BlogPost = {
    id: randomUUID(), title: data.title, slug: data.slug, excerpt: data.excerpt,
    coverImageUrl: data.coverImageUrl, category: data.category, tags: data.tags,
    author: data.author || 'Dr. Shweta Goyal', publishedDate: now, updatedDate: now,
    status: data.status, metaDescription: data.metaDescription, docId, docUrl,
  };
  await appendToSheet(SHEET_ID(), RANGE_POSTS, [[
    post.id, post.title, post.slug, post.excerpt, post.coverImageUrl, post.category,
    post.tags, post.author, post.publishedDate, post.updatedDate, post.status,
    post.metaDescription, post.docId, post.docUrl,
  ]]);
  return post;
}

export async function updateBlog(id: string, data: Partial<BlogPost & { htmlContent: string }>): Promise<BlogPost | null> {
  const rows = await readSheet(SHEET_ID(), RANGE_POSTS);
  if (!rows || rows.length < 2) return null;
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex < 0) return null;

  const existing = rowToPost(rows[rowIndex]);
  if (data.htmlContent && existing.docId) await updateBlogDoc(existing.docId, data.htmlContent);

  const updated: BlogPost = { ...existing, ...data, updatedDate: new Date().toISOString().split('T')[0] };
  const range = `Posts!A${rowIndex + 1}:N${rowIndex + 1}`;
  await updateSheetRow(SHEET_ID(), range, [[
    updated.id, updated.title, updated.slug, updated.excerpt, updated.coverImageUrl,
    updated.category, updated.tags, updated.author, updated.publishedDate, updated.updatedDate,
    updated.status, updated.metaDescription, updated.docId, updated.docUrl,
  ]]);
  return updated;
}

export async function deleteBlog(id: string): Promise<boolean> {
  const rows = await readSheet(SHEET_ID(), RANGE_POSTS);
  if (!rows || rows.length < 2) return false;
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex < 0) return false;
  // Mark as deleted by clearing the row (soft delete: status = 'deleted')
  const existing = rowToPost(rows[rowIndex]);
  const range = `Posts!K${rowIndex + 1}`;
  await updateSheetRow(SHEET_ID(), range, [['deleted']]);
  return !!existing.id;
}
