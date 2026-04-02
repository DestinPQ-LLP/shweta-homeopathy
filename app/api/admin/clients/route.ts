import { NextResponse } from 'next/server';
import { getAllClients, createClient } from '@/lib/clients';

export async function GET() {
  try {
    const clients = await getAllClients();
    return NextResponse.json({ clients });
  } catch (err) {
    console.error('GET /api/admin/clients', err);
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, dob, address, firstConsultationDate, concern, notes, status } = body;
    if (!name || !firstConsultationDate) {
      return NextResponse.json({ error: 'name and firstConsultationDate are required' }, { status: 400 });
    }
    const client = await createClient({
      name, email: email || '', phone: phone || '', dob: dob || '',
      address: address || '', firstConsultationDate, concern: concern || '',
      notes: notes || '', status: status || 'active',
    });
    return NextResponse.json({ client }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/clients', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
