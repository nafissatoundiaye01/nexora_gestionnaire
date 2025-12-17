import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask, deleteTask } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await getTask(id);
  if (!task) {
    return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const task = await updateTask(id, body);
  if (!task) {
    return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteTask(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
