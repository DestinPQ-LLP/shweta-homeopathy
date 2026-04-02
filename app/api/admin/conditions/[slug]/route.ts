import { NextResponse } from 'next/server';
import { getConditionBySlug, updateCondition, deleteCondition } from '@/lib/healing-conditions';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const result = await getConditionBySlug(slug);
    if (!result) return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
    return NextResponse.json({ condition: result.condition });
  } catch (err) {
    console.error('GET /api/admin/conditions/[slug]', err);
    return NextResponse.json({ error: 'Failed to load condition' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const body = await req.json();
    if (body.symptoms && !Array.isArray(body.symptoms)) {
      body.symptoms = body.symptoms.split('\n').filter(Boolean);
    }
    const updated = await updateCondition(slug, body);
    if (!updated) return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
    return NextResponse.json({ condition: updated });
  } catch (err) {
    console.error('PUT /api/admin/conditions/[slug]', err);
    return NextResponse.json({ error: 'Failed to update condition' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const ok = await deleteCondition(slug);
    if (!ok) return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/conditions/[slug]', err);
    return NextResponse.json({ error: 'Failed to delete condition' }, { status: 500 });
  }
}
