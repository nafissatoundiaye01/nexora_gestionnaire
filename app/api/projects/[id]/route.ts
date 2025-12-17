import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject, deleteProject } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const project = await updateProject(id, body);
  if (!project) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteProject(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
