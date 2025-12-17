import { NextRequest, NextResponse } from 'next/server';
import { getCorrection, updateCorrection, deleteCorrection } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const correction = await getCorrection(id);
  if (!correction) {
    return NextResponse.json({ error: 'Correction non trouvee' }, { status: 404 });
  }
  return NextResponse.json(correction);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const correction = await updateCorrection(id, body);
  if (!correction) {
    return NextResponse.json({ error: 'Correction non trouvee' }, { status: 404 });
  }
  return NextResponse.json(correction);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = await deleteCorrection(id);
  if (!success) {
    return NextResponse.json({ error: 'Correction non trouvee' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
