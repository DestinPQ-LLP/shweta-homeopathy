import { NextRequest, NextResponse } from 'next/server';
import { updateTestimonial, deleteTestimonial } from '@/lib/testimonials';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, location, condition, rating, text, status } = body;

    if (!name?.trim() || !text?.trim() || !condition?.trim()) {
      return NextResponse.json({ error: 'name, condition and text are required' }, { status: 400 });
    }
    const r = parseInt(String(rating), 10);
    if (isNaN(r) || r < 1 || r > 5) {
      return NextResponse.json({ error: 'rating must be 1–5' }, { status: 400 });
    }

    const updated = await updateTestimonial(id, {
      name: name.trim(),
      location: (location ?? '').trim(),
      condition: condition.trim(),
      rating: r,
      text: text.trim(),
      status: status === 'published' ? 'published' : 'draft',
    });

    if (!updated) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    return NextResponse.json({ testimonial: updated });
  } catch (err: unknown) {
    console.error('[testimonials PUT]', err);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteTestimonial(id);
    if (!ok) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('[testimonials DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
