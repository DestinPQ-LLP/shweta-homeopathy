import { NextResponse } from 'next/server';
import { getClientById, updateClient, deleteClient } from '@/lib/clients';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const result = await getClientById(id);
    if (!result) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    return NextResponse.json({ client: result.client });
  } catch (err) {
    console.error('GET /api/admin/clients/[id]', err);
    return NextResponse.json({ error: 'Failed to load client' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await updateClient(id, body);
    if (!updated) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    return NextResponse.json({ client: updated });
  } catch (err) {
    console.error('PUT /api/admin/clients/[id]', err);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const ok = await deleteClient(id);
    if (!ok) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/clients/[id]', err);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
