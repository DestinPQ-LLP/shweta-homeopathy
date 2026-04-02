import { NextResponse } from 'next/server';
import { getAllConditions, createCondition } from '@/lib/healing-conditions';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === '1';
    const conditions = await getAllConditions(all);
    return NextResponse.json({ conditions });
  } catch (err) {
    console.error('GET /api/admin/conditions', err);
    return NextResponse.json({ error: 'Failed to load conditions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, name, shortDesc, intro, symptoms, howHomeopathyHelps, icon, status } = body;
    if (!slug || !name) {
      return NextResponse.json({ error: 'slug and name are required' }, { status: 400 });
    }
    const condition = await createCondition({
      slug, name,
      shortDesc: shortDesc || '',
      intro: intro || '',
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms || '').split('\n').filter(Boolean),
      howHomeopathyHelps: howHomeopathyHelps || '',
      icon: icon || '',
      status: status === 'draft' ? 'draft' : 'published',
    });
    return NextResponse.json({ condition }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/conditions', err);
    return NextResponse.json({ error: 'Failed to create condition' }, { status: 500 });
  }
}
