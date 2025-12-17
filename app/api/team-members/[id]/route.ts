import { NextRequest, NextResponse } from 'next/server';
import { getTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const member = await getTeamMember(id);
  if (!member) {
    return NextResponse.json({ error: 'Membre non trouve' }, { status: 404 });
  }
  return NextResponse.json(member);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const member = await updateTeamMember(id, body);
  if (!member) {
    return NextResponse.json({ error: 'Membre non trouve' }, { status: 404 });
  }
  return NextResponse.json(member);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = await deleteTeamMember(id);
  if (!success) {
    return NextResponse.json({ error: 'Membre non trouve' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
