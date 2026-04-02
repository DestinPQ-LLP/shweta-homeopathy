import { NextRequest, NextResponse } from 'next/server';
import { getAllTestimonials, createTestimonial } from '@/lib/testimonials';

export async function GET() {
  try {
    const testimonials = await getAllTestimonials();
    return NextResponse.json({ testimonials });
  } catch (err: unknown) {
    console.error('[testimonials GET]', err);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, location, condition, rating, text, status } = body;

    if (!name?.trim() || !text?.trim() || !condition?.trim()) {
      return NextResponse.json({ error: 'name, condition and text are required' }, { status: 400 });
    }
    const r = parseInt(String(rating), 10);
    if (isNaN(r) || r < 1 || r > 5) {
      return NextResponse.json({ error: 'rating must be 1–5' }, { status: 400 });
    }

    const testimonial = await createTestimonial({
      name: name.trim(),
      location: (location ?? '').trim(),
      condition: condition.trim(),
      rating: r,
      text: text.trim(),
      status: status === 'published' ? 'published' : 'draft',
    });
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (err: unknown) {
    console.error('[testimonials POST]', err);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
