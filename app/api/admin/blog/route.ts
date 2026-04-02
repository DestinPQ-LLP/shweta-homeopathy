import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogs, createBlog } from '@/lib/blog';

export async function GET() {
  try {
    const posts = await getAllBlogs();
    return NextResponse.json({ posts });
  } catch (err) {
    console.error('[admin/blog GET]', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, coverImageUrl, category, tags, author, status, metaDescription, htmlContent } = body;

    if (!title || !slug || !htmlContent) {
      return NextResponse.json({ error: 'title, slug and htmlContent are required' }, { status: 400 });
    }

    // Sanitise slug — only lowercase alphanumeric + hyphens
    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const post = await createBlog({
      title, slug: safeSlug, excerpt: excerpt || '', coverImageUrl: coverImageUrl || '',
      category: category || '', tags: tags || '', author: author || 'Dr. Shweta Goyal',
      status: status || 'draft', metaDescription: metaDescription || '',
      htmlContent,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error('[admin/blog POST]', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
